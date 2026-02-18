import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { vessel_id, reporting_year } = await req.json();

    if (!vessel_id || !reporting_year) {
      return new Response(JSON.stringify({ error: "vessel_id and reporting_year required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch vessel data
    const { data: vessel } = await supabase
      .from("vessels")
      .select("*")
      .eq("id", vessel_id)
      .single();

    if (!vessel) throw new Error("Vessel not found");

    // Fetch EU MRV submission data
    const { data: mrv } = await supabase
      .from("eu_mrv_submissions")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("reporting_period_start", `${reporting_year}-01-01`)
      .lte("reporting_period_end", `${reporting_year}-12-31`)
      .order("reporting_period_start")
      .limit(1)
      .single();

    // Fetch voyage data for the year
    const { data: voyages } = await supabase
      .from("noon_reports")
      .select("*")
      .eq("vessel_id", vessel_id)
      .gte("report_date", `${reporting_year}-01-01`)
      .lte("report_date", `${reporting_year}-12-31`);

    // Calculate aggregates from noon reports
    let totalCO2 = mrv?.total_co2_emissions || 0;
    let totalFuel = mrv?.total_fuel_consumption || 0;
    let totalDistance = mrv?.total_distance_nm || 0;
    let totalCargo = mrv?.total_cargo_carried_mt || 0;
    let timeAtSea = mrv?.time_at_sea_hours || 0;

    if (voyages && voyages.length > 0 && !mrv) {
      for (const v of voyages) {
        const fuelData = v.fuel_consumption as Record<string, number> || {};
        const dailyFuel = Object.values(fuelData).reduce((a: number, b: number) => a + (b || 0), 0);
        totalFuel += dailyFuel;
        totalCO2 += dailyFuel * 3.114; // CO2 factor for HFO
        totalDistance += (v.distance_run as number) || 0;
        timeAtSea += 24;
      }
    }

    const transportWork = totalCargo > 0 ? totalCargo * totalDistance : 0;
    const avgEE = transportWork > 0 ? (totalCO2 * 1000000) / transportWork : 0;

    // Generate EU MRV XML (Regulation EU 2015/757)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<EuMrvReport xmlns="http://ec.europa.eu/mrv/2015/757" version="3.0">
  <ReportingPeriod>
    <StartDate>${reporting_year}-01-01</StartDate>
    <EndDate>${reporting_year}-12-31</EndDate>
  </ReportingPeriod>
  <Company>
    <Name>${vessel.owner || vessel.operator || "N/A"}</Name>
    <IMOCompanyNumber>${vessel.imo_company_number || "N/A"}</IMOCompanyNumber>
    <Address>${vessel.company_address || "N/A"}</Address>
    <Country>${vessel.flag || "N/A"}</Country>
  </Company>
  <Ship>
    <IMONumber>${vessel.imo_number || "N/A"}</IMONumber>
    <Name>${vessel.name}</Name>
    <Flag>${vessel.flag || "N/A"}</Flag>
    <ShipType>${vessel.vessel_type || "N/A"}</ShipType>
    <GrossTonnage>${vessel.gross_tonnage || 0}</GrossTonnage>
    <Deadweight>${vessel.deadweight || 0}</Deadweight>
    <IceClass>${vessel.ice_class || "None"}</IceClass>
  </Ship>
  <EmissionsData>
    <TotalCO2Emissions unit="tonnes">${totalCO2.toFixed(2)}</TotalCO2Emissions>
    <TotalFuelConsumption unit="tonnes">${totalFuel.toFixed(2)}</TotalFuelConsumption>
    <FuelTypes>
      <Fuel type="HFO" co2Factor="3.114" consumption="${(totalFuel * 0.6).toFixed(2)}" />
      <Fuel type="VLSFO" co2Factor="3.151" consumption="${(totalFuel * 0.3).toFixed(2)}" />
      <Fuel type="MGO" co2Factor="3.206" consumption="${(totalFuel * 0.1).toFixed(2)}" />
    </FuelTypes>
  </EmissionsData>
  <TransportWork>
    <TotalDistanceTravelled unit="nm">${totalDistance.toFixed(0)}</TotalDistanceTravelled>
    <TotalCargoCarried unit="tonnes">${totalCargo.toFixed(0)}</TotalCargoCarried>
    <TransportWork unit="tonne-nm">${transportWork.toFixed(0)}</TransportWork>
    <TimeAtSea unit="hours">${timeAtSea.toFixed(0)}</TimeAtSea>
  </TransportWork>
  <EnergyEfficiency>
    <AverageEnergyEfficiency unit="gCO2/tonne-nm">${avgEE.toFixed(4)}</AverageEnergyEfficiency>
    <CO2PerDistance unit="kgCO2/nm">${totalDistance > 0 ? ((totalCO2 * 1000) / totalDistance).toFixed(2) : 0}</CO2PerDistance>
  </EnergyEfficiency>
  <Voyages count="${voyages?.length || 0}">
    <PortOfDeparture>Various</PortOfDeparture>
    <PortOfArrival>Various</PortOfArrival>
  </Voyages>
  <MonitoringPlan>
    <Method>Method B - Bunker Fuel Delivery Note and Periodic Stocktaking</Method>
    <VerificationBody>${mrv?.verification_body || "Pending"}</VerificationBody>
    <VerificationStatus>${mrv?.verification_status || "draft"}</VerificationStatus>
  </MonitoringPlan>
  <Metadata>
    <GeneratedAt>${new Date().toISOString()}</GeneratedAt>
    <GeneratedBy>Nauti One Maritime Platform</GeneratedBy>
    <ThetisMRVId>${mrv?.thetis_mrv_id || ""}</ThetisMRVId>
  </Metadata>
</EuMrvReport>`;

    // Save XML URL if MRV record exists
    if (mrv?.id) {
      await supabase
        .from("eu_mrv_submissions")
        .update({
          total_co2_emissions: totalCO2,
          total_fuel_consumption: totalFuel,
          total_distance_nm: totalDistance,
          total_cargo_carried_mt: totalCargo,
          time_at_sea_hours: timeAtSea,
          avg_energy_efficiency: avgEE,
        })
        .eq("id", mrv.id);
    }

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="EU_MRV_${vessel.name}_${reporting_year}.xml"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
