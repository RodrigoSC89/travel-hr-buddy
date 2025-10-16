import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MMIJobForecast {
  id: string;
  title: string;
  forecast: string | null;
  hours: number | null;
  responsible: string | null;
  forecast_date: string | null;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);


export default function MMIJobsPanel() {
  const [jobs, setJobs] = useState<MMIJobForecast[]>([]);
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchJobs();
  }, []);


  async function fetchJobs() {
    const { data } = await supabase.from("mmi_jobs").select("*").order("forecast_date", { ascending: false });
    if (data) setJobs(data);
  }


  async function handleExport(job: MMIJobForecast) {
    const html = `
      <h2>${job.title}</h2>
      <p><strong>Previsão:</strong> ${job.forecast || 'N/A'}</p>
      <p><strong>Horímetro:</strong> ${job.hours || 0}h</p>
      <p><strong>Responsável:</strong> ${job.responsible || 'N/A'}</p>
    `;
    const blob = await (await import("html2pdf.js")).default().from(html).outputPdf("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
  }


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">🛠 Painel de Forecast MMI</h1>


      <Input
        placeholder="🔍 Buscar por sistema, componente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs
          .filter((j) => j.title.toLowerCase().includes(search.toLowerCase()))
          .map((job) => (
            <Card key={job.id} className="border">
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-lg">🔧 {job.title}</h2>
                <p>📅 Previsão: <strong>{job.forecast || 'N/A'}</strong></p>
                <p>⏱ Horímetro: <strong>{job.hours || 0}h</strong></p>
                <p>👨‍🔧 Responsável: {job.responsible || 'N/A'}</p>
                <Button variant="outline" onClick={() => handleExport(job)}>
                  📤 Exportar PDF
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
