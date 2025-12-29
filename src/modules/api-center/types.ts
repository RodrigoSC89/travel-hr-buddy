/**
 * API Center Types
 * PATCH 659: Type definitions for API management module
 */

export type ApiCategory = 'weather' | 'maritime' | 'security' | 'communication' | 'ai' | 'logistics';
export type ApiStatus = 'active' | 'inactive' | 'error' | 'testing';

export interface ApiIntegration {
  id: string;
  org_id: string | null;
  api_name: string;
  api_category: ApiCategory;
  status: ApiStatus;
  config: Record<string, unknown>;
  last_checked: string | null;
  error_count: number;
  next_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiLog {
  id: string;
  org_id: string | null;
  api_name: string;
  endpoint: string | null;
  method: string;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  request_payload: Record<string, unknown> | null;
  response_summary: Record<string, unknown> | null;
  timestamp: string;
}

export interface ApiQuota {
  id: string;
  org_id: string | null;
  api_name: string;
  quota_limit: number | null;
  quota_used: number;
  reset_at: string | null;
  last_updated: string;
}

export interface ApiCardProps {
  api: ApiIntegration;
  onTest: (apiName: string) => Promise<void>;
  onToggle: (apiName: string, enabled: boolean) => Promise<void>;
  isLoading?: boolean;
}

export interface ApiDetailModalProps {
  api: ApiIntegration | null;
  logs: ApiLog[];
  quota: ApiQuota | null;
  isOpen: boolean;
  onClose: () => void;
}

// API Registry with default configurations
export const API_REGISTRY: Record<string, {
  name: string;
  category: ApiCategory;
  description: string;
  icon: string;
  docsUrl: string;
  hasQuota: boolean;
  quotaLimit?: number;
}> = {
  openweather: {
    name: 'OpenWeather',
    category: 'weather',
    description: 'Dados meteorológicos globais em tempo real',
    icon: 'Cloud',
    docsUrl: 'https://openweathermap.org/api',
    hasQuota: true,
    quotaLimit: 60
  },
  windy: {
    name: 'Windy',
    category: 'weather',
    description: 'Previsão de ventos e condições marítimas',
    icon: 'Wind',
    docsUrl: 'https://api.windy.com',
    hasQuota: true,
    quotaLimit: 50
  },
  stormglass: {
    name: 'StormGlass',
    category: 'weather',
    description: 'Meteorologia marítima de alta precisão (fallback)',
    icon: 'CloudRain',
    docsUrl: 'https://stormglass.io/docs',
    hasQuota: true,
    quotaLimit: 50
  },
  'marine-traffic': {
    name: 'MarineTraffic',
    category: 'maritime',
    description: 'Rastreamento AIS global e dados de embarcações',
    icon: 'Ship',
    docsUrl: 'https://www.marinetraffic.com/en/ais-api-services',
    hasQuota: true,
    quotaLimit: 100
  },
  amadeus: {
    name: 'Amadeus',
    category: 'logistics',
    description: 'Busca de voos e logística de tripulação',
    icon: 'Plane',
    docsUrl: 'https://developers.amadeus.com',
    hasQuota: true,
    quotaLimit: 200
  },
  shodan: {
    name: 'Shodan',
    category: 'security',
    description: 'Monitoramento de dispositivos e vulnerabilidades',
    icon: 'Shield',
    docsUrl: 'https://developer.shodan.io',
    hasQuota: true,
    quotaLimit: 100
  },
  'have-i-been-pwned': {
    name: 'HaveIBeenPwned',
    category: 'security',
    description: 'Verificação de credenciais vazadas',
    icon: 'Lock',
    docsUrl: 'https://haveibeenpwned.com/API/v3',
    hasQuota: true,
    quotaLimit: 10
  },
  slack: {
    name: 'Slack',
    category: 'communication',
    description: 'Notificações e alertas para equipes',
    icon: 'MessageSquare',
    docsUrl: 'https://api.slack.com',
    hasQuota: false
  },
  huggingface: {
    name: 'HuggingFace',
    category: 'ai',
    description: 'Modelos de IA para NLP e classificação',
    icon: 'Brain',
    docsUrl: 'https://huggingface.co/docs/api-inference',
    hasQuota: true,
    quotaLimit: 1000
  },
  replicate: {
    name: 'Replicate',
    category: 'ai',
    description: 'Modelos de IA open-source (Whisper, StableDiffusion)',
    icon: 'Cpu',
    docsUrl: 'https://replicate.com/docs',
    hasQuota: true,
    quotaLimit: 100
  }
};
