import React from 'react';
import { Helmet } from 'react-helmet-async';
import { WeatherCommandCenter } from '@/components/maritime/WeatherCommandCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Cloud,
  CheckCircle,
  Info,
  Zap,
  Brain,
  Shield,
  Satellite
} from 'lucide-react';

/**
 * Weather Dashboard Demo Page
 * Public demo of the Weather Command Center without authentication
 */
export default function WeatherDashboardDemo() {
  return (
    <>
      <Helmet>
        <title>Weather Dashboard Demo - Nautilus One</title>
        <meta name="description" content="Demo do sistema meteorológico marítimo mais avançado do mundo" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="h-12 w-12" />
                <h1 className="text-4xl font-bold">Weather Command Center</h1>
              </div>
              <p className="text-xl text-blue-100 max-w-3xl mb-6">
                Sistema Meteorológico Marítimo Revolucionário - Demo Público
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Windy.com Integration
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Multi-source Validation
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  AI Weather Analysis
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ASOG Compliance
                </Badge>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
              <Cloud className="h-64 w-64" />
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Demo Público</AlertTitle>
            <AlertDescription className="text-blue-700">
              Esta é uma demonstração do Weather Command Center. Para acesso completo com histórico, 
              análises de IA e integração com embarcações, faça login no sistema.
            </AlertDescription>
          </Alert>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Cloud className="h-8 w-8 text-blue-600" />
                  <Badge variant="outline" className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <CardTitle className="text-lg">Windy.com</CardTitle>
                <CardDescription>
                  Dados em tempo real com mapas interativos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">AI</Badge>
                </div>
                <CardTitle className="text-lg">Análise IA</CardTitle>
                <CardDescription>
                  OpenAI para recomendações inteligentes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Shield className="h-8 w-8 text-orange-600" />
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">ASOG</Badge>
                </div>
                <CardTitle className="text-lg">Compliance</CardTitle>
                <CardDescription>
                  Validação automática ASOG/IMCA
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Satellite className="h-8 w-8 text-green-600" />
                  <Badge variant="outline" className="bg-green-100 text-green-800">Multi</Badge>
                </div>
                <CardTitle className="text-lg">Multi-Source</CardTitle>
                <CardDescription>
                  Validação cruzada de fontes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Weather Command Center */}
          <WeatherCommandCenter 
            location={{ 
              lat: -23.9608, 
              lon: -46.3333,
              name: 'Santos, Brazil'
            }}
          />

          {/* Footer Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Sistema de Referência Mundial</h3>
                  <p className="text-sm text-blue-700">
                    O sistema meteorológico marítimo mais avançado do mundo, desenvolvido para o Nautilus One.
                    Integração única de Windy.com + OpenWeather + IA + ASOG Compliance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
