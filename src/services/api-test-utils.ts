/**
 * API Integration Test Utilities
 * Test and validate all external API integrations
 */

import { openaiService } from './openai';
import { voiceService } from './voice';
import { mapboxService } from './mapbox';
import { windyService } from './windy';
import { marineTrafficService } from './marinetraffic';
import { skyscannerService } from './skyscanner';
import { bookingService } from './booking';
import { integrationManager } from '@/lib/integration-manager';

export interface ServiceTestResult {
  service: string;
  configured: boolean;
  available: boolean;
  responseTime?: number;
  error?: string;
  details?: any;
}

export interface TestReport {
  timestamp: string;
  totalServices: number;
  configured: number;
  available: number;
  failed: number;
  results: ServiceTestResult[];
  summary: {
    aiServices: ServiceTestResult[];
    voiceServices: ServiceTestResult[];
    travelServices: ServiceTestResult[];
    weatherServices: ServiceTestResult[];
    mapServices: ServiceTestResult[];
    fleetServices: ServiceTestResult[];
  };
}

export class APIIntegrationTester {
  /**
   * Test all services
   */
  async testAllServices(): Promise<TestReport> {
    const results: ServiceTestResult[] = [];

    // Test AI Services
    results.push(await this.testOpenAI());

    // Test Voice Services
    results.push(await this.testWebSpeech());
    results.push(await this.testWhisper());
    results.push(await this.testElevenLabs());

    // Test Travel Services
    results.push(await this.testAmadeus());
    results.push(await this.testSkyscanner());

    // Test Hotel Services
    results.push(await this.testBooking());

    // Test Weather Services
    results.push(await this.testOpenWeather());
    results.push(await this.testWindy());

    // Test Map Services
    results.push(await this.testMapbox());

    // Test Fleet Services
    results.push(await this.testMarineTraffic());

    // Calculate statistics
    const configured = results.filter(r => r.configured).length;
    const available = results.filter(r => r.available).length;
    const failed = results.filter(r => !r.available && r.configured).length;

    return {
      timestamp: new Date().toISOString(),
      totalServices: results.length,
      configured,
      available,
      failed,
      results,
      summary: {
        aiServices: results.filter(r => ['OpenAI'].includes(r.service)),
        voiceServices: results.filter(r => ['Web Speech', 'Whisper', 'ElevenLabs'].includes(r.service)),
        travelServices: results.filter(r => ['Amadeus', 'Skyscanner'].includes(r.service)),
        weatherServices: results.filter(r => ['OpenWeatherMap', 'Windy'].includes(r.service)),
        mapServices: results.filter(r => ['Mapbox'].includes(r.service)),
        fleetServices: results.filter(r => ['MarineTraffic'].includes(r.service)),
      },
    };
  }

  /**
   * Test OpenAI service
   */
  async testOpenAI(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    try {
      const configured = openaiService.isConfigured();
      if (!configured) {
        return {
          service: 'OpenAI',
          configured: false,
          available: false,
          error: 'API key not configured',
        };
      }

      // Simple test: list models
      await openaiService.listModels();

      return {
        service: 'OpenAI',
        configured: true,
        available: true,
        responseTime: Date.now() - startTime,
        details: { models: 'available' },
      };
    } catch (error) {
      return {
        service: 'OpenAI',
        configured: openaiService.isConfigured(),
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test Web Speech API
   */
  async testWebSpeech(): Promise<ServiceTestResult> {
    return {
      service: 'Web Speech',
      configured: true, // Browser native
      available: voiceService.isBrowserRecognitionAvailable() && voiceService.isBrowserSynthesisAvailable(),
      details: {
        recognition: voiceService.isBrowserRecognitionAvailable(),
        synthesis: voiceService.isBrowserSynthesisAvailable(),
        voices: voiceService.getPortugueseVoices().length,
      },
    };
  }

  /**
   * Test Whisper (part of OpenAI)
   */
  async testWhisper(): Promise<ServiceTestResult> {
    return {
      service: 'Whisper',
      configured: voiceService.isWhisperConfigured(),
      available: voiceService.isWhisperConfigured(),
      details: {
        note: 'Requires audio file to fully test',
      },
    };
  }

  /**
   * Test ElevenLabs
   */
  async testElevenLabs(): Promise<ServiceTestResult> {
    return {
      service: 'ElevenLabs',
      configured: voiceService.isElevenLabsConfigured(),
      available: voiceService.isElevenLabsConfigured(),
      details: {
        note: 'Requires text input to fully test',
      },
    };
  }

  /**
   * Test Amadeus
   */
  async testAmadeus(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    try {
      const service = integrationManager.getServiceStatus('amadeus');
      if (!service) {
        return {
          service: 'Amadeus',
          configured: false,
          available: false,
          error: 'Not configured in integration manager',
        };
      }

      // Try to connect
      await integrationManager.connectService('amadeus');
      const status = integrationManager.getServiceStatus('amadeus');

      return {
        service: 'Amadeus',
        configured: true,
        available: status?.status === 'connected',
        responseTime: Date.now() - startTime,
        details: status,
      };
    } catch (error) {
      return {
        service: 'Amadeus',
        configured: true,
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test Skyscanner
   */
  async testSkyscanner(): Promise<ServiceTestResult> {
    return {
      service: 'Skyscanner',
      configured: skyscannerService.isConfigured(),
      available: skyscannerService.isConfigured(),
      details: {
        note: 'Requires search parameters to fully test',
      },
    };
  }

  /**
   * Test Booking.com
   */
  async testBooking(): Promise<ServiceTestResult> {
    return {
      service: 'Booking.com',
      configured: bookingService.isConfigured(),
      available: bookingService.isConfigured(),
      details: {
        note: 'Requires search parameters to fully test',
      },
    };
  }

  /**
   * Test OpenWeatherMap
   */
  async testOpenWeather(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    try {
      const service = integrationManager.getServiceStatus('openweather');
      if (!service) {
        return {
          service: 'OpenWeatherMap',
          configured: false,
          available: false,
          error: 'Not configured in integration manager',
        };
      }

      // Try to connect
      await integrationManager.connectService('openweather');
      const status = integrationManager.getServiceStatus('openweather');

      return {
        service: 'OpenWeatherMap',
        configured: true,
        available: status?.status === 'connected',
        responseTime: Date.now() - startTime,
        details: status,
      };
    } catch (error) {
      return {
        service: 'OpenWeatherMap',
        configured: true,
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test Windy
   */
  async testWindy(): Promise<ServiceTestResult> {
    return {
      service: 'Windy',
      configured: windyService.isConfigured(),
      available: windyService.isConfigured(),
      details: {
        note: 'Requires coordinates to fully test',
      },
    };
  }

  /**
   * Test Mapbox
   */
  async testMapbox(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    try {
      const service = integrationManager.getServiceStatus('mapbox');
      if (!service) {
        return {
          service: 'Mapbox',
          configured: false,
          available: false,
          error: 'Not configured in integration manager',
        };
      }

      const configured = mapboxService.isConfigured();
      if (!configured) {
        return {
          service: 'Mapbox',
          configured: false,
          available: false,
          error: 'Access token not configured',
        };
      }

      return {
        service: 'Mapbox',
        configured: true,
        available: true,
        responseTime: Date.now() - startTime,
        details: {
          token: 'configured',
        },
      };
    } catch (error) {
      return {
        service: 'Mapbox',
        configured: mapboxService.isConfigured(),
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test MarineTraffic
   */
  async testMarineTraffic(): Promise<ServiceTestResult> {
    return {
      service: 'MarineTraffic',
      configured: marineTrafficService.isConfigured(),
      available: marineTrafficService.isConfigured(),
      details: {
        note: 'Requires MMSI or coordinates to fully test',
      },
    };
  }

  /**
   * Generate test report as markdown
   */
  generateMarkdownReport(report: TestReport): string {
    const { summary } = report;

    const sections = [
      { title: 'AI Services', results: summary.aiServices },
      { title: 'Voice Services', results: summary.voiceServices },
      { title: 'Travel Services', results: summary.travelServices },
      { title: 'Weather Services', results: summary.weatherServices },
      { title: 'Map Services', results: summary.mapServices },
      { title: 'Fleet Services', results: summary.fleetServices },
    ];

    let markdown = `# API Integration Test Report\n\n`;
    markdown += `**Date:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Total Services:** ${report.totalServices}\n`;
    markdown += `- **Configured:** ${report.configured} (${Math.round((report.configured / report.totalServices) * 100)}%)\n`;
    markdown += `- **Available:** ${report.available} (${Math.round((report.available / report.totalServices) * 100)}%)\n`;
    markdown += `- **Failed:** ${report.failed}\n\n`;

    for (const section of sections) {
      markdown += `## ${section.title}\n\n`;
      markdown += `| Service | Configured | Available | Response Time | Status |\n`;
      markdown += `|---------|------------|-----------|---------------|--------|\n`;

      for (const result of section.results) {
        const configured = result.configured ? '✅' : '❌';
        const available = result.available ? '✅' : '❌';
        const responseTime = result.responseTime ? `${result.responseTime}ms` : '-';
        const status = result.error ? `❌ ${result.error}` : '✅ OK';
        markdown += `| ${result.service} | ${configured} | ${available} | ${responseTime} | ${status} |\n`;
      }
      markdown += `\n`;
    }

    markdown += `## Detailed Results\n\n`;
    markdown += `\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n`;

    return markdown;
  }

  /**
   * Generate test report as HTML
   */
  generateHTMLReport(report: TestReport): string {
    const { summary } = report;

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>API Integration Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2563eb; }
    h2 { color: #1e40af; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #2563eb; color: white; }
    .success { color: #16a34a; }
    .error { color: #dc2626; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>API Integration Test Report</h1>
  <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Services:</strong> ${report.totalServices}</p>
    <p><strong>Configured:</strong> ${report.configured} (${Math.round((report.configured / report.totalServices) * 100)}%)</p>
    <p><strong>Available:</strong> ${report.available} (${Math.round((report.available / report.totalServices) * 100)}%)</p>
    <p><strong>Failed:</strong> ${report.failed}</p>
  </div>
`;

    const sections = [
      { title: 'AI Services', results: summary.aiServices },
      { title: 'Voice Services', results: summary.voiceServices },
      { title: 'Travel Services', results: summary.travelServices },
      { title: 'Weather Services', results: summary.weatherServices },
      { title: 'Map Services', results: summary.mapServices },
      { title: 'Fleet Services', results: summary.fleetServices },
    ];

    for (const section of sections) {
      html += `<h2>${section.title}</h2>\n`;
      html += `<table>\n`;
      html += `<tr><th>Service</th><th>Configured</th><th>Available</th><th>Response Time</th><th>Status</th></tr>\n`;

      for (const result of section.results) {
        const configured = result.configured ? '<span class="success">✅</span>' : '<span class="error">❌</span>';
        const available = result.available ? '<span class="success">✅</span>' : '<span class="error">❌</span>';
        const responseTime = result.responseTime ? `${result.responseTime}ms` : '-';
        const status = result.error ? `<span class="error">❌ ${result.error}</span>` : '<span class="success">✅ OK</span>';
        html += `<tr><td>${result.service}</td><td>${configured}</td><td>${available}</td><td>${responseTime}</td><td>${status}</td></tr>\n`;
      }
      html += `</table>\n`;
    }

    html += `</body>\n</html>`;
    return html;
  }
}

// Export singleton instance
export const apiTester = new APIIntegrationTester();
