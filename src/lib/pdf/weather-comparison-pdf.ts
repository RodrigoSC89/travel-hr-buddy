/**
 * Weather Comparison PDF Export
 * Generates professional PDF reports for city weather comparison
 * PATCH WINDY-2.1
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeatherLocation, CurrentWeather, DailyForecast } from '@/components/weather/windy/types';

interface CityComparisonData {
  location: WeatherLocation;
  current: CurrentWeather | null;
  daily: DailyForecast[];
}

interface WeatherComparisonPDFOptions {
  title?: string;
  includeHourly?: boolean;
  includeMarine?: boolean;
  language?: 'pt' | 'en';
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getWindArrow = (direction: number): string => {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const index = Math.round(direction / 45) % 8;
  return arrows[index];
};

export async function generateWeatherComparisonPDF(
  cities: CityComparisonData[],
  options: WeatherComparisonPDFOptions = {}
): Promise<Blob> {
  const {
    title = 'Comparação Meteorológica',
    language = 'pt'
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 16);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatDate(new Date())}`, pageWidth - margin, 16, { align: 'right' });

  // Current Weather Comparison Table
  let yPos = 35;
  
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Condições Atuais', margin, yPos);
  yPos += 8;

  const currentHeaders = ['Cidade', 'Temp.', 'Sensação', 'Umidade', 'Vento', 'Rajada', 'Pressão', 'Visibilidade', 'UV'];
  const currentData = cities.map(city => {
    const c = city.current;
    if (!c) return [city.location.name, '-', '-', '-', '-', '-', '-', '-', '-'];
    
    return [
      city.location.name.split(',')[0],
      `${Math.round(c.temperature)}°C`,
      `${Math.round(c.feelsLike)}°C`,
      `${c.humidity}%`,
      `${Math.round(c.wind.speed)} km/h ${getWindArrow(c.wind.direction)}`,
      `${Math.round(c.wind.gust)} km/h`,
      `${Math.round(c.pressure)} hPa`,
      `${c.visibility.toFixed(1)} km`,
      c.uvIndex.toFixed(1)
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [currentHeaders],
    body: currentData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240]
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // 7-Day Forecast Comparison
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Previsão 7 Dias', margin, yPos);
  yPos += 8;

  // Create forecast headers
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const today = new Date();
  const forecastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return days[d.getDay()];
  });

  const forecastHeaders = ['Cidade', ...forecastDays.map(d => `${d}\nMáx/Mín`)];
  
  const forecastData = cities.map(city => {
    const row: string[] = [city.location.name.split(',')[0]];
    
    for (let i = 0; i < 7; i++) {
      const forecast = city.daily[i];
      if (forecast) {
        row.push(`${Math.round(forecast.tempMax)}° / ${Math.round(forecast.tempMin)}°`);
      } else {
        row.push('-');
      }
    }
    
    return row;
  });

  autoTable(doc, {
    startY: yPos,
    head: [forecastHeaders],
    body: forecastData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      halign: 'center'
    },
    headStyles: {
      fillColor: [168, 85, 247],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Rain Probability Table
  if (yPos < pageHeight - 60) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Probabilidade de Chuva (%)', margin, yPos);
    yPos += 8;

    const rainHeaders = ['Cidade', ...forecastDays];
    const rainData = cities.map(city => {
      const row: string[] = [city.location.name.split(',')[0]];
      
      for (let i = 0; i < 7; i++) {
        const forecast = city.daily[i];
        if (forecast) {
          row.push(`${forecast.rainProbability}%`);
        } else {
          row.push('-');
        }
      }
      
      return row;
    });

    autoTable(doc, {
      startY: yPos,
      head: [rainHeaders],
      body: rainData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        halign: 'center'
      },
      headStyles: {
        fillColor: [34, 211, 238],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const value = parseInt(data.cell.text[0]);
          if (value >= 70) {
            data.cell.styles.fillColor = [254, 202, 202];
            data.cell.styles.textColor = [185, 28, 28];
          } else if (value >= 50) {
            data.cell.styles.fillColor = [254, 249, 195];
            data.cell.styles.textColor = [161, 98, 7];
          } else if (value >= 30) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
          }
        }
      }
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(241, 245, 249);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(
      'Dados: Open-Meteo API | Nautilus Maritime HR System',
      margin,
      pageHeight - 5
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 5,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}

export async function downloadWeatherComparisonPDF(
  cities: CityComparisonData[],
  filename?: string,
  options?: WeatherComparisonPDFOptions
): Promise<void> {
  const blob = await generateWeatherComparisonPDF(cities, options);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `comparacao-meteorologica-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export async function shareWeatherComparison(
  cities: CityComparisonData[]
): Promise<boolean> {
  try {
    // Create a text summary for sharing
    const summary = cities.map(city => {
      const c = city.current;
      if (!c) return `${city.location.name}: Dados indisponíveis`;
      return `${city.location.name.split(',')[0]}: ${Math.round(c.temperature)}°C, ${c.description}`;
    }).join('\n');

    const shareData = {
      title: 'Comparação Meteorológica',
      text: `Previsão do Tempo\n\n${summary}\n\nVia Nautilus Maritime System`,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`Comparação Meteorológica\n\n${summary}`);
      return true;
    }
  } catch (e) {
    console.error('Share failed:', e);
    return false;
  }
}
