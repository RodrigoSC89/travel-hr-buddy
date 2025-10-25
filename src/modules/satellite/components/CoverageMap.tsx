import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Globe } from "lucide-react";

interface Coverage {
  region: string;
  coverage: number;
  satellites: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface CoverageMapProps {
  coverageData: Coverage[];
}

export function CoverageMap({ coverageData }: CoverageMapProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'default';
      case 'good': return 'default';
      case 'fair': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'secondary';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'fair': return 'Regular';
      case 'poor': return 'Fraca';
      default: return quality;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Cobertura Satelital por Região
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coverageData.map((coverage, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{coverage.region}</span>
                </div>
                <Badge variant={getQualityColor(coverage.quality)}>
                  {getQualityLabel(coverage.quality)}
                </Badge>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${coverage.coverage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{coverage.coverage}% de cobertura</span>
                <span>{coverage.satellites} satélites</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
