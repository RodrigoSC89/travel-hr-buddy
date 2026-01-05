import { useState, useEffect } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { soundAlertService } from "@/lib/notifications/sound-alert-service";

export function SoundAlertSettings() {
  const [config, setConfig] = useState(soundAlertService.getConfig());

  useEffect(() => {
    setConfig(soundAlertService.getConfig());
  }, []);

  const handleEnabledChange = (enabled: boolean) => {
    soundAlertService.setEnabled(enabled);
    setConfig(soundAlertService.getConfig());
  };

  const handleVolumeChange = (value: number[]) => {
    soundAlertService.setVolume(value[0]);
    setConfig(soundAlertService.getConfig());
  };

  const handleCriticalChange = (enabled: boolean) => {
    soundAlertService.setCriticalEnabled(enabled);
    setConfig(soundAlertService.getConfig());
  };

  const handleWarningChange = (enabled: boolean) => {
    soundAlertService.setWarningEnabled(enabled);
    setConfig(soundAlertService.getConfig());
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {config.enabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
          Alertas Sonoros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled">Ativar sons</Label>
          <Switch
            id="sound-enabled"
            checked={config.enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {config.enabled && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(config.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[config.volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="critical-sound">Alertas críticos</Label>
              <Switch
                id="critical-sound"
                checked={config.criticalEnabled}
                onCheckedChange={handleCriticalChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="warning-sound">Alertas de aviso</Label>
              <Switch
                id="warning-sound"
                checked={config.warningEnabled}
                onCheckedChange={handleWarningChange}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => soundAlertService.testSound()}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Testar Som
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
