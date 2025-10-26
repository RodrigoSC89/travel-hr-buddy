/**
 * PATCH 203.0 - Unit Converter
 * 
 * Comprehensive unit conversion system for maritime operations:
 * - Distance: km/mi, nautical miles
 * - Temperature: °C/°F/K
 * - Volume: liters/gallons (US/UK)
 * - Speed: knots, km/h, mph
 * - Pressure: bar, psi, atm
 */

import { logger } from "@/lib/logger";

export type DistanceUnit = 'km' | 'mi' | 'nm' | 'm' | 'ft';
export type TemperatureUnit = 'C' | 'F' | 'K';
export type VolumeUnit = 'L' | 'gal_us' | 'gal_uk' | 'ml' | 'm3';
export type SpeedUnit = 'knots' | 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'bar' | 'psi' | 'atm' | 'pa';
export type WeightUnit = 'kg' | 'lb' | 'ton' | 'g';

export interface ConversionOptions {
  precision?: number;
  formatted?: boolean;
}

class UnitConverter {
  // ==================== DISTANCE ====================
  
  /**
   * Convert distance between units
   */
  convertDistance(
    value: number,
    from: DistanceUnit,
    to: DistanceUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 2;
    
    // Convert to meters first (base unit)
    const meters = this.toMeters(value, from);
    
    // Convert from meters to target unit
    const result = this.fromMeters(meters, to);
    
    return this.round(result, precision);
  }

  private toMeters(value: number, unit: DistanceUnit): number {
    const conversions: Record<DistanceUnit, number> = {
      m: 1,
      km: 1000,
      mi: 1609.344,
      nm: 1852, // Nautical mile
      ft: 0.3048,
    };
    return value * conversions[unit];
  }

  private fromMeters(meters: number, unit: DistanceUnit): number {
    const conversions: Record<DistanceUnit, number> = {
      m: 1,
      km: 1000,
      mi: 1609.344,
      nm: 1852,
      ft: 0.3048,
    };
    return meters / conversions[unit];
  }

  // ==================== TEMPERATURE ====================
  
  /**
   * Convert temperature between units
   */
  convertTemperature(
    value: number,
    from: TemperatureUnit,
    to: TemperatureUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 1;
    
    if (from === to) return value;
    
    // Convert to Celsius first (base unit)
    let celsius: number;
    
    switch (from) {
      case 'C':
        celsius = value;
        break;
      case 'F':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'K':
        celsius = value - 273.15;
        break;
    }
    
    // Convert from Celsius to target unit
    let result: number;
    
    switch (to) {
      case 'C':
        result = celsius;
        break;
      case 'F':
        result = celsius * 9 / 5 + 32;
        break;
      case 'K':
        result = celsius + 273.15;
        break;
    }
    
    return this.round(result, precision);
  }

  // ==================== VOLUME ====================
  
  /**
   * Convert volume between units
   */
  convertVolume(
    value: number,
    from: VolumeUnit,
    to: VolumeUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 2;
    
    // Convert to liters first (base unit)
    const liters = this.toLiters(value, from);
    
    // Convert from liters to target unit
    const result = this.fromLiters(liters, to);
    
    return this.round(result, precision);
  }

  private toLiters(value: number, unit: VolumeUnit): number {
    const conversions: Record<VolumeUnit, number> = {
      L: 1,
      ml: 0.001,
      m3: 1000,
      gal_us: 3.78541, // US gallon
      gal_uk: 4.54609, // UK/Imperial gallon
    };
    return value * conversions[unit];
  }

  private fromLiters(liters: number, unit: VolumeUnit): number {
    const conversions: Record<VolumeUnit, number> = {
      L: 1,
      ml: 0.001,
      m3: 1000,
      gal_us: 3.78541,
      gal_uk: 4.54609,
    };
    return liters / conversions[unit];
  }

  // ==================== SPEED ====================
  
  /**
   * Convert speed between units
   */
  convertSpeed(
    value: number,
    from: SpeedUnit,
    to: SpeedUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 2;
    
    // Convert to m/s first (base unit)
    const metersPerSecond = this.toMetersPerSecond(value, from);
    
    // Convert from m/s to target unit
    const result = this.fromMetersPerSecond(metersPerSecond, to);
    
    return this.round(result, precision);
  }

  private toMetersPerSecond(value: number, unit: SpeedUnit): number {
    const conversions: Record<SpeedUnit, number> = {
      ms: 1,
      kmh: 1 / 3.6,
      mph: 0.44704,
      knots: 0.514444, // Nautical miles per hour
    };
    return value * conversions[unit];
  }

  private fromMetersPerSecond(ms: number, unit: SpeedUnit): number {
    const conversions: Record<SpeedUnit, number> = {
      ms: 1,
      kmh: 1 / 3.6,
      mph: 0.44704,
      knots: 0.514444,
    };
    return ms / conversions[unit];
  }

  // ==================== PRESSURE ====================
  
  /**
   * Convert pressure between units
   */
  convertPressure(
    value: number,
    from: PressureUnit,
    to: PressureUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 2;
    
    // Convert to Pascals first (base unit)
    const pascals = this.toPascals(value, from);
    
    // Convert from Pascals to target unit
    const result = this.fromPascals(pascals, to);
    
    return this.round(result, precision);
  }

  private toPascals(value: number, unit: PressureUnit): number {
    const conversions: Record<PressureUnit, number> = {
      pa: 1,
      bar: 100000,
      psi: 6894.76,
      atm: 101325,
    };
    return value * conversions[unit];
  }

  private fromPascals(pascals: number, unit: PressureUnit): number {
    const conversions: Record<PressureUnit, number> = {
      pa: 1,
      bar: 100000,
      psi: 6894.76,
      atm: 101325,
    };
    return pascals / conversions[unit];
  }

  // ==================== WEIGHT ====================
  
  /**
   * Convert weight between units
   */
  convertWeight(
    value: number,
    from: WeightUnit,
    to: WeightUnit,
    options?: ConversionOptions
  ): number {
    const precision = options?.precision ?? 2;
    
    // Convert to kilograms first (base unit)
    const kilograms = this.toKilograms(value, from);
    
    // Convert from kilograms to target unit
    const result = this.fromKilograms(kilograms, to);
    
    return this.round(result, precision);
  }

  private toKilograms(value: number, unit: WeightUnit): number {
    const conversions: Record<WeightUnit, number> = {
      kg: 1,
      g: 0.001,
      lb: 0.453592,
      ton: 1000,
    };
    return value * conversions[unit];
  }

  private fromKilograms(kg: number, unit: WeightUnit): number {
    const conversions: Record<WeightUnit, number> = {
      kg: 1,
      g: 0.001,
      lb: 0.453592,
      ton: 1000,
    };
    return kg / conversions[unit];
  }

  // ==================== UTILITIES ====================
  
  /**
   * Round to specified precision
   */
  private round(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Format conversion result with unit label
   */
  formatWithUnit(
    value: number,
    unit: DistanceUnit | TemperatureUnit | VolumeUnit | SpeedUnit | PressureUnit | WeightUnit
  ): string {
    const unitLabels: Record<string, string> = {
      // Distance
      km: 'km',
      mi: 'mi',
      nm: 'NM',
      m: 'm',
      ft: 'ft',
      
      // Temperature
      C: '°C',
      F: '°F',
      K: 'K',
      
      // Volume
      L: 'L',
      gal_us: 'gal (US)',
      gal_uk: 'gal (UK)',
      ml: 'ml',
      m3: 'm³',
      
      // Speed
      knots: 'kn',
      kmh: 'km/h',
      mph: 'mph',
      ms: 'm/s',
      
      // Pressure
      bar: 'bar',
      psi: 'psi',
      atm: 'atm',
      pa: 'Pa',
      
      // Weight
      kg: 'kg',
      lb: 'lb',
      ton: 't',
      g: 'g',
    };
    
    return `${value} ${unitLabels[unit] || unit}`;
  }

  /**
   * Auto-detect and convert to user's preferred unit system
   */
  autoConvert(
    value: number,
    unit: DistanceUnit | TemperatureUnit | VolumeUnit,
    userLocale: 'metric' | 'imperial' = 'metric'
  ): { value: number; unit: string; formatted: string } {
    try {
      // Determine target unit based on user preference
      let targetUnit: any;
      let convertedValue: number;
      
      if (unit === 'km' || unit === 'mi') {
        targetUnit = userLocale === 'imperial' ? 'mi' : 'km';
        convertedValue = this.convertDistance(value, unit as DistanceUnit, targetUnit);
      } else if (unit === 'C' || unit === 'F') {
        targetUnit = userLocale === 'imperial' ? 'F' : 'C';
        convertedValue = this.convertTemperature(value, unit as TemperatureUnit, targetUnit);
      } else if (unit === 'L' || unit === 'gal_us') {
        targetUnit = userLocale === 'imperial' ? 'gal_us' : 'L';
        convertedValue = this.convertVolume(value, unit as VolumeUnit, targetUnit);
      } else {
        return { value, unit, formatted: this.formatWithUnit(value, unit) };
      }
      
      return {
        value: convertedValue,
        unit: targetUnit,
        formatted: this.formatWithUnit(convertedValue, targetUnit),
      };
    } catch (error) {
      logger.error('Error in autoConvert:', error);
      return { value, unit, formatted: this.formatWithUnit(value, unit) };
    }
  }
}

// Export singleton instance
export const unitConverter = new UnitConverter();

// Export helper functions
export const convertDistance = (value: number, from: DistanceUnit, to: DistanceUnit, options?: ConversionOptions) =>
  unitConverter.convertDistance(value, from, to, options);

export const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit, options?: ConversionOptions) =>
  unitConverter.convertTemperature(value, from, to, options);

export const convertVolume = (value: number, from: VolumeUnit, to: VolumeUnit, options?: ConversionOptions) =>
  unitConverter.convertVolume(value, from, to, options);

export const convertSpeed = (value: number, from: SpeedUnit, to: SpeedUnit, options?: ConversionOptions) =>
  unitConverter.convertSpeed(value, from, to, options);

export const convertPressure = (value: number, from: PressureUnit, to: PressureUnit, options?: ConversionOptions) =>
  unitConverter.convertPressure(value, from, to, options);

export const convertWeight = (value: number, from: WeightUnit, to: WeightUnit, options?: ConversionOptions) =>
  unitConverter.convertWeight(value, from, to, options);

export default unitConverter;
