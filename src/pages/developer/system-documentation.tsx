/**
 * System Documentation - PATCH 835
 * Documentação técnica para desenvolvedores
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Database, 
  Shield, 
  Settings, 
  Code, 
  FileText,
  Wifi,
  HardDrive,
  Cpu,
  Globe,
  Lock,
  Layers
} from 'lucide-react';

const performanceFeatures = [
  {
    name: 'Low Bandwidth Optimizer',
    description: 'Otimização automática para redes de 2 Mbps',
    file: 'src/lib/performance/low-bandwidth-optimizer.ts',
    config: 'Automático baseado em navigator.connection'
  },
  {
    name: 'Service Worker v4',
    description: 'Cache inteligente com estratégias adaptativas',
    file: 'public/sw.js',
    config: 'Cache-first para assets, Network-first para API'
  },
  {
    name: 'Lazy Loading',
    description: 'Todos os módulos carregam sob demanda',
    file: 'src/App.tsx',
    config: 'React.lazy() + Suspense'
  },
  {
    name: 'Memory Manager',
    description: 'Monitoramento e limpeza automática de memória',
    file: 'src/lib/performance/memory-manager.ts',
    config: 'Intervalo de 60s'
  },
  {
    name: 'Request Deduplication',
    description: 'Evita requisições duplicadas',
    file: 'src/lib/performance/request-deduplication.ts',
    config: 'Cache de 5s por requisição'
  },
  {
    name: 'Image Optimizer',
    description: 'WebP/AVIF com qualidade adaptativa',
    file: 'src/lib/performance/image-optimizer.ts',
    config: 'Qualidade baseada na conexão'
  }
];

const envVariables = [
  { name: 'VITE_ENABLE_CLIENT_METRICS', description: 'Habilita métricas detalhadas de cliente', default: 'false' },
  { name: 'VITE_ENABLE_AUTONOMY', description: 'Habilita sistema de autonomia IA', default: 'false' },
  { name: 'VITE_ENABLE_WATCHDOG', description: 'Habilita watchdog de erros', default: 'false' },
  { name: 'VITE_ENABLE_HEAVY_MONITORING', description: 'Habilita monitoramento pesado', default: 'false' },
  { name: 'VITE_SUPABASE_URL', description: 'URL do Supabase', default: 'Obrigatório' },
  { name: 'VITE_SUPABASE_PUBLISHABLE_KEY', description: 'Chave pública do Supabase', default: 'Obrigatório' }
];

const securityFeatures = [
  { name: 'RLS (Row Level Security)', description: 'Segurança a nível de linha no banco de dados' },
  { name: 'Auth via Supabase', description: 'Autenticação gerenciada pelo Supabase Auth' },
  { name: 'HTTPS Only', description: 'Todas as comunicações são criptografadas' },
  { name: 'Content Security Policy', description: 'Proteção contra XSS e injeção de código' },
  { name: 'Rate Limiting', description: 'Limitação de requisições por API key' }
];

const apiEndpoints = [
  { method: 'GET', path: '/rest/v1/vessels', description: 'Lista embarcações' },
  { method: 'GET', path: '/rest/v1/crew_members', description: 'Lista tripulantes' },
  { method: 'GET', path: '/rest/v1/missions', description: 'Lista missões' },
  { method: 'POST', path: '/functions/v1/ai-chat', description: 'Chat com IA' },
  { method: 'POST', path: '/functions/v1/generate-report', description: 'Gera relatórios' }
];

export default function SystemDocumentation() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentação do Sistema</h1>
        <p className="text-muted-foreground">
          Nautilus One - Sistema Corporativo de Gestão Marítima v2.2.0
        </p>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="architecture">Arquitetura</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Otimizações de Performance
              </CardTitle>
              <CardDescription>
                Sistema otimizado para funcionar em redes de até 2 Mbps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceFeatures.map((feature, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <Badge variant="outline">{feature.config}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{feature.file}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Configurações por Tipo de Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Conexão</th>
                      <th className="text-left p-2">Qualidade Imagem</th>
                      <th className="text-left p-2">Batch Size</th>
                      <th className="text-left p-2">Timeout</th>
                      <th className="text-left p-2">Animações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2"><Badge className="bg-green-500">4G</Badge></td>
                      <td className="p-2">85%</td>
                      <td className="p-2">20</td>
                      <td className="p-2">30s</td>
                      <td className="p-2">✅ Ativas</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><Badge className="bg-yellow-500">3G</Badge></td>
                      <td className="p-2">70%</td>
                      <td className="p-2">10</td>
                      <td className="p-2">45s</td>
                      <td className="p-2">❌ Desativadas</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><Badge className="bg-orange-500">2G</Badge></td>
                      <td className="p-2">50%</td>
                      <td className="p-2">5</td>
                      <td className="p-2">60s</td>
                      <td className="p-2">❌ Desativadas</td>
                    </tr>
                    <tr>
                      <td className="p-2"><Badge className="bg-red-500">Slow-2G</Badge></td>
                      <td className="p-2">30%</td>
                      <td className="p-2">3</td>
                      <td className="p-2">90s</td>
                      <td className="p-2">❌ Desativadas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Variáveis de Ambiente
              </CardTitle>
              <CardDescription>
                Configurações disponíveis via arquivo .env
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {envVariables.map((env, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <code className="text-sm font-mono text-primary">{env.name}</code>
                      <p className="text-sm text-muted-foreground">{env.description}</p>
                    </div>
                    <Badge variant="secondary">{env.default}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Recursos de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {securityFeatures.map((feature, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      <h3 className="font-semibold">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Endpoints da API
              </CardTitle>
              <CardDescription>
                Principais endpoints REST disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Arquitetura do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-blue-500/10 border-blue-500/30">
                  <h3 className="font-semibold mb-2 text-blue-500">Frontend</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• React 18.3</li>
                    <li>• TypeScript 5.x</li>
                    <li>• Tailwind CSS</li>
                    <li>• Framer Motion</li>
                    <li>• TanStack Query</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/30">
                  <h3 className="font-semibold mb-2 text-green-500">Backend</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Supabase (PostgreSQL)</li>
                    <li>• Edge Functions</li>
                    <li>• Row Level Security</li>
                    <li>• Real-time Subscriptions</li>
                    <li>• Storage Buckets</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border bg-purple-500/10 border-purple-500/30">
                  <h3 className="font-semibold mb-2 text-purple-500">IA & Analytics</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• OpenAI GPT-4</li>
                    <li>• TensorFlow.js</li>
                    <li>• Análise Preditiva</li>
                    <li>• Web Vitals</li>
                    <li>• Sentry Monitoring</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <h3 className="font-semibold mb-3">Estrutura de Diretórios</h3>
                <pre className="text-xs bg-background p-4 rounded overflow-x-auto">
{`src/
├── components/          # Componentes React
│   ├── ui/              # Componentes base (shadcn)
│   ├── dashboard/       # Componentes de dashboard
│   ├── performance/     # Componentes de performance
│   └── ...
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e libs
│   ├── performance/     # Otimizações de performance
│   ├── monitoring/      # Monitoramento
│   └── ...
├── pages/               # Páginas da aplicação
├── contexts/            # Contextos React
├── integrations/        # Integrações externas
└── styles/              # CSS global`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
