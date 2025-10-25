/**
 * Weather Station Module - Main Component
 * PATCH 105.0: Maritime weather monitoring with alerts
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, RefreshCw, AlertTriangle, MapPin, Ship } from "lucide-react";
import { CurrentWeatherDashboard } from "./components/CurrentWeatherDashboard";
import { ForecastPanel } from "./components/ForecastPanel";
import { WeatherAlertsList } from "./components/WeatherAlertsList";
import {
  fetchCurrentWeather,
  fetch72HourForecast,
  fetchWeatherAlerts,
  acknowledgeWeatherAlert,
  saveWeatherData,
} from "./services/weather-station-service";
import { fetchVessels } from "../fleet-management/services/vessel-service";
import type { CurrentConditions, WeatherForecastHour, WeatherAlert, WeatherLocation } from "./types";
import type { Vessel } from "../fleet-management/types";

export default function WeatherStation() {
  const [currentWeather, setCurrentWeather] = useState<CurrentConditions | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastHour[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [customLocation, setCustomLocation] = useState({ lat: "", lng: "" });
  const [locationName, setLocationName] = useState("Atlantic Ocean");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vesselsData, alertsData] = await Promise.all([
        fetchVessels(),
        fetchWeatherAlerts(),
      ]);
      setVessels(vesselsData);
      setAlerts(alertsData);

      // Load weather for first vessel if available
      if (vesselsData.length > 0 && vesselsData[0].last_known_position) {
        setSelectedVesselId(vesselsData[0].id);
        await loadWeatherForLocation(
          vesselsData[0].last_known_position,
          vesselsData[0].name
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherForLocation = async (
    location: WeatherLocation,
    name: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setLocationName(name);

      const [current, forecastData] = await Promise.all([
        fetchCurrentWeather(location),
        fetch72HourForecast(location),
      ]);

      if (current) {
        setCurrentWeather(current);
        setForecast(forecastData);

        // Save to database
        const vessel = vessels.find((v) => v.last_known_position?.lat === location.lat);
        await saveWeatherData(
          vessel?.id,
          location,
          name,
          current,
          forecastData
        );
      } else {
        setError("Failed to fetch weather data. Check API key configuration.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather");
      console.error("Error loading weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVesselChange = async (vesselId: string) => {
    setSelectedVesselId(vesselId);
    const vessel = vessels.find((v) => v.id === vesselId);
    if (vessel?.last_known_position) {
      await loadWeatherForLocation(vessel.last_known_position, vessel.name);
    }
  };

  const handleCustomLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLocation.lat);
    const lng = parseFloat(customLocation.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Invalid coordinates");
      return;
    }

    await loadWeatherForLocation({ lat, lng }, "Custom Location");
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeWeatherAlert(alertId, "Current User");
      // Reload alerts
      const alertsData = await fetchWeatherAlerts();
      setAlerts(alertsData);
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const stats = {
    total_alerts: alerts.length,
    active_alerts: alerts.filter((a) => !a.acknowledged).length,
    severe_alerts: alerts.filter((a) => a.severity === "severe" || a.severity === "high").length,
    vessels_monitored: vessels.length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Cloud className="h-8 w-8" />
          Weather Station
        </h1>
        <p className="text-gray-400">
          Real-time maritime weather monitoring and alerts
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{stats.vessels_monitored}</p>
              <p className="text-sm text-gray-400 mt-1">Vessels Monitored</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{stats.total_alerts}</p>
              <p className="text-sm text-gray-400 mt-1">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.active_alerts}</p>
              <p className="text-sm text-gray-400 mt-1">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{stats.severe_alerts}</p>
              <p className="text-sm text-gray-400 mt-1">Severe Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <Label className="text-gray-300 flex items-center gap-2 mb-2">
              <Ship className="h-4 w-4" />
              Select Vessel
            </Label>
            <select
              value={selectedVesselId}
              onChange={(e) => handleVesselChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
              disabled={loading}
            >
              <option value="">Select a vessel...</option>
              {vessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} - {vessel.imo_code}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <form onSubmit={handleCustomLocationSubmit} className="space-y-3">
              <Label className="text-gray-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Custom Location
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  value={customLocation.lat}
                  onChange={(e) =>
                    setCustomLocation({ ...customLocation, lat: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Input
                  placeholder="Longitude"
                  value={customLocation.lng}
                  onChange={(e) =>
                    setCustomLocation({ ...customLocation, lng: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Load Weather
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-6">
        <Button
          onClick={() => selectedVesselId && handleVesselChange(selectedVesselId)}
          variant="outline"
          disabled={loading || !selectedVesselId}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Weather Data
        </Button>
      </div>

      {/* Main Content */}
      {loading && !currentWeather ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading weather data...</p>
            </div>
          </CardContent>
        </Card>
      ) : currentWeather ? (
        <div className="space-y-6">
          {/* Current Weather */}
          <CurrentWeatherDashboard
            conditions={currentWeather}
            locationName={locationName}
          />

          {/* 72-Hour Forecast */}
          <ForecastPanel forecast={forecast} />

          {/* Weather Alerts */}
          <WeatherAlertsList alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
        </div>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-400">
              <Cloud className="h-12 w-12 mx-auto mb-3" />
              <p>Select a vessel or enter custom coordinates to view weather data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
