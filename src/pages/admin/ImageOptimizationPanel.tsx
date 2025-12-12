/**
 * Image Optimization Admin Panel
 * PATCH 542 - Monitor and configure image optimization settings
 */

import { useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useImageFormatSupport } from "@/hooks/useImageOptimization";
import { cdnManager } from "@/lib/images/cdn-config";
import { imageOptimizer } from "@/lib/images/image-optimizer";
import { Image, CheckCircle, XCircle, Sparkles, Globe, Zap } from "lucide-react";

export default function ImageOptimizationPanel() {
  const formats = useImageFormatSupport();
  const cdnConfig = cdnManager.getConfig();
  const [testImage] = useState("/placeholder.svg");

  const formatSupport = [
    { name: "WebP", supported: formats.webp, savings: "~25%" },
    { name: "AVIF", supported: formats.avif, savings: "~50%" },
  ];

  const optimizationFeatures = [
    { name: "Lazy Loading", enabled: true, description: "Images load when visible" },
    { name: "Blur Placeholders", enabled: true, description: "Smooth loading experience" },
    { name: "Responsive Images", enabled: true, description: "Multiple sizes via srcset" },
    { name: "Format Detection", enabled: true, description: "Auto WebP/AVIF support" },
    { name: "CDN Integration", enabled: cdnConfig.enabled, description: cdnConfig.provider.toUpperCase() },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Image className="h-8 w-8" />
            Image Optimization Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            PATCH 542 - Advanced image optimization & CDN configuration
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          Active
        </Badge>
      </div>

      {/* Browser Format Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Browser Format Support
          </CardTitle>
          <CardDescription>
            Modern image formats supported by your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {formatSupport.map((format) => (
              <div
                key={format.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {format.supported ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold">{format.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format.supported ? `${format.savings} smaller` : "Not supported"}
                    </p>
                  </div>
                </div>
                <Badge variant={format.supported ? "default" : "secondary"}>
                  {format.supported ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Optimal Format Detected:</p>
            <p className="text-2xl font-bold mt-1 uppercase">{formats.optimal}</p>
          </div>
        </CardContent>
      </Card>

      {/* CDN Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            CDN Configuration
          </CardTitle>
          <CardDescription>
            Content Delivery Network settings for image optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="text-xl font-bold uppercase">{cdnConfig.provider}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={cdnConfig.enabled ? "default" : "secondary"} className="text-base">
                {cdnConfig.enabled ? "Active" : "Local Only"}
              </Badge>
            </div>
          </div>

          {cdnConfig.enabled && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold">Transformations Enabled:</p>
              <div className="flex flex-wrap gap-2">
                {cdnConfig.transformations.webp && <Badge>WebP</Badge>}
                {cdnConfig.transformations.avif && <Badge>AVIF</Badge>}
                {cdnConfig.transformations.progressive && <Badge>Progressive</Badge>}
                <Badge>Quality: {cdnConfig.transformations.quality}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Features */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Features</CardTitle>
          <CardDescription>
            Active image optimization capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizationFeatures.map((feature) => (
              <div
                key={feature.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {feature.enabled ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Badge variant={feature.enabled ? "default" : "outline"}>
                  {feature.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Live Optimization Demo</CardTitle>
          <CardDescription>
            See OptimizedImage component in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="font-semibold text-sm">Standard Image</p>
              <img src={testImage} alt="Standard" className="w-full rounded-lg border" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm">Optimized Image</p>
              <OptimizedImage
                src={testImage}
                alt="Optimized"
                width={400}
                height={300}
                priority={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
