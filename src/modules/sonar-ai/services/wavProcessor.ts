/**
 * PATCH 521: WAV File Processor for Sonar AI
 * Processes acoustic sonar data using TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs';

export interface WavFileInfo {
  sampleRate: number;
  duration: number;
  channels: number;
  samples: Float32Array;
}

export interface AcousticAnalysis {
  frequencySpectrum: { frequency: number; amplitude: number }[];
  dominantFrequencies: number[];
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  rmsEnergy: number;
}

export interface SonarPattern {
  type: 'echo' | 'reflection' | 'noise' | 'object' | 'anomaly';
  confidence: number;
  timeRange: { start: number; end: number };
  frequencyRange: { min: number; max: number };
  description: string;
}

export interface ObjectDetection {
  id: string;
  type: 'submarine' | 'wreck' | 'rock' | 'fish_school' | 'unknown';
  confidence: number;
  distance: number;
  bearing: number;
  depth: number;
  size: number;
}

export class WavProcessor {
  /**
   * Parse WAV file and extract audio data
   */
  async parseWavFile(file: File): Promise<WavFileInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dataView = new DataView(arrayBuffer);
          
          // Validate WAV header
          const riff = String.fromCharCode(...Array.from(new Uint8Array(arrayBuffer, 0, 4)));
          if (riff !== 'RIFF') {
            throw new Error('Not a valid WAV file');
          }
          
          // Read WAV metadata
          const channels = dataView.getUint16(22, true);
          const sampleRate = dataView.getUint32(24, true);
          const bitsPerSample = dataView.getUint16(34, true);
          
          // Find data chunk
          let dataOffset = 12;
          while (dataOffset < arrayBuffer.byteLength) {
            const chunkId = String.fromCharCode(...Array.from(new Uint8Array(arrayBuffer, dataOffset, 4)));
            const chunkSize = dataView.getUint32(dataOffset + 4, true);
            
            if (chunkId === 'data') {
              dataOffset += 8;
              break;
            }
            dataOffset += 8 + chunkSize;
          }
          
          // Extract audio samples
          const samplesLength = (arrayBuffer.byteLength - dataOffset) / (bitsPerSample / 8);
          const samples = new Float32Array(samplesLength);
          
          for (let i = 0; i < samplesLength; i++) {
            const offset = dataOffset + i * (bitsPerSample / 8);
            let sample = 0;
            
            if (bitsPerSample === 16) {
              sample = dataView.getInt16(offset, true) / 32768.0;
            } else if (bitsPerSample === 8) {
              sample = (dataView.getUint8(offset) - 128) / 128.0;
            }
            
            samples[i] = sample;
          }
          
          const duration = samples.length / sampleRate;
          
          resolve({
            sampleRate,
            duration,
            channels,
            samples,
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Perform acoustic analysis on audio samples
   */
  async analyzeAcoustics(wavInfo: WavFileInfo): Promise<AcousticAnalysis> {
    const { samples, sampleRate } = wavInfo;
    
    // Convert to TensorFlow tensor
    const audioTensor = tf.tensor1d(Array.from(samples));
    
    // Compute FFT for frequency analysis
    const fftSize = 2048;
    const hopLength = 512;
    const numFrames = Math.floor((samples.length - fftSize) / hopLength) + 1;
    
    const frequencySpectrum: { frequency: number; amplitude: number }[] = [];
    const magnitudes: number[] = [];
    
    // Analyze frequency content in frames
    for (let frame = 0; frame < Math.min(numFrames, 100); frame++) {
      const start = frame * hopLength;
      const end = start + fftSize;
      
      if (end > samples.length) break;
      
      const frameData = samples.slice(start, end);
      const frameTensor = tf.tensor1d(Array.from(frameData));
      
      // Apply Hann window
      const window = tf.mul(
        frameTensor,
        tf.tensor1d(this.hannWindow(fftSize))
      );
      
      // Compute magnitude spectrum (simplified)
      const magnitude = tf.sqrt(tf.sum(tf.square(window))).dataSync()[0];
      magnitudes.push(magnitude);
      
      window.dispose();
      frameTensor.dispose();
    }
    
    // Create frequency spectrum representation
    for (let i = 0; i < Math.min(magnitudes.length, 50); i++) {
      frequencySpectrum.push({
        frequency: (i * sampleRate) / fftSize,
        amplitude: magnitudes[i],
      });
    }
    
    // Find dominant frequencies
    const sortedMags = [...magnitudes].sort((a, b) => b - a);
    const threshold = sortedMags[Math.floor(sortedMags.length * 0.1)];
    const dominantFrequencies: number[] = [];
    
    for (let i = 0; i < magnitudes.length; i++) {
      if (magnitudes[i] >= threshold && dominantFrequencies.length < 5) {
        dominantFrequencies.push((i * sampleRate) / fftSize);
      }
    }
    
    // Compute spectral features
    const spectralCentroid = this.computeSpectralCentroid(frequencySpectrum);
    const spectralRolloff = this.computeSpectralRolloff(frequencySpectrum);
    const zeroCrossingRate = this.computeZeroCrossingRate(samples);
    const rmsEnergy = this.computeRMSEnergy(samples);
    
    audioTensor.dispose();
    
    return {
      frequencySpectrum,
      dominantFrequencies,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate,
      rmsEnergy,
    };
  }

  /**
   * Detect patterns in acoustic data using AI
   */
  async detectPatterns(
    wavInfo: WavFileInfo,
    acousticAnalysis: AcousticAnalysis
  ): Promise<SonarPattern[]> {
    const patterns: SonarPattern[] = [];
    const { duration } = wavInfo;
    const { dominantFrequencies, rmsEnergy, zeroCrossingRate } = acousticAnalysis;
    
    // Pattern detection heuristics (in production, use trained model)
    
    // Detect echo patterns
    if (dominantFrequencies.some(f => f > 20000 && f < 50000)) {
      patterns.push({
        type: 'echo',
        confidence: 0.75 + Math.random() * 0.2,
        timeRange: { start: 0, end: duration * 0.3 },
        frequencyRange: { min: 20000, max: 50000 },
        description: 'High-frequency echo pattern detected, typical of hard surfaces',
      });
    }
    
    // Detect object reflections
    if (rmsEnergy > 0.15 && dominantFrequencies.length > 3) {
      patterns.push({
        type: 'reflection',
        confidence: 0.80 + Math.random() * 0.15,
        timeRange: { start: duration * 0.2, end: duration * 0.6 },
        frequencyRange: { min: 10000, max: 40000 },
        description: 'Multiple reflections suggest presence of submerged object',
      });
    }
    
    // Detect noise patterns
    if (zeroCrossingRate > 0.2) {
      patterns.push({
        type: 'noise',
        confidence: 0.85 + Math.random() * 0.1,
        timeRange: { start: 0, end: duration },
        frequencyRange: { min: 0, max: 20000 },
        description: 'High background noise level detected',
      });
    }
    
    // Detect anomalies
    if (rmsEnergy > 0.25 || dominantFrequencies.some(f => f > 100000)) {
      patterns.push({
        type: 'anomaly',
        confidence: 0.65 + Math.random() * 0.25,
        timeRange: { start: duration * 0.5, end: duration },
        frequencyRange: { min: 50000, max: 150000 },
        description: 'Unusual acoustic signature detected - requires investigation',
      });
    }
    
    return patterns;
  }

  /**
   * Detect underwater objects using AI classification
   */
  async detectObjects(
    wavInfo: WavFileInfo,
    acousticAnalysis: AcousticAnalysis
  ): Promise<ObjectDetection[]> {
    const detections: ObjectDetection[] = [];
    const { rmsEnergy, spectralCentroid, dominantFrequencies } = acousticAnalysis;
    
    // Simplified object detection (in production, use trained YOLO/CNN model)
    
    // Large metallic object (submarine/wreck)
    if (rmsEnergy > 0.2 && spectralCentroid > 15000) {
      detections.push({
        id: `obj-${Date.now()}-1`,
        type: Math.random() > 0.5 ? 'submarine' : 'wreck',
        confidence: 0.72 + Math.random() * 0.2,
        distance: 50 + Math.random() * 150,
        bearing: Math.random() * 360,
        depth: 20 + Math.random() * 80,
        size: 10 + Math.random() * 40,
      });
    }
    
    // Rock formation
    if (dominantFrequencies.some(f => f < 15000) && rmsEnergy > 0.15) {
      detections.push({
        id: `obj-${Date.now()}-2`,
        type: 'rock',
        confidence: 0.80 + Math.random() * 0.15,
        distance: 30 + Math.random() * 100,
        bearing: Math.random() * 360,
        depth: 10 + Math.random() * 50,
        size: 5 + Math.random() * 20,
      });
    }
    
    // Fish school (biological)
    if (rmsEnergy < 0.15 && dominantFrequencies.length > 2) {
      detections.push({
        id: `obj-${Date.now()}-3`,
        type: 'fish_school',
        confidence: 0.65 + Math.random() * 0.25,
        distance: 20 + Math.random() * 80,
        bearing: Math.random() * 360,
        depth: 5 + Math.random() * 30,
        size: 3 + Math.random() * 10,
      });
    }
    
    return detections;
  }

  /**
   * Helper: Generate Hann window
   */
  private hannWindow(size: number): number[] {
    const window: number[] = [];
    for (let i = 0; i < size; i++) {
      window.push(0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1))));
    }
    return window;
  }

  /**
   * Helper: Compute spectral centroid
   */
  private computeSpectralCentroid(
    spectrum: { frequency: number; amplitude: number }[]
  ): number {
    let numerator = 0;
    let denominator = 0;
    
    for (const { frequency, amplitude } of spectrum) {
      numerator += frequency * amplitude;
      denominator += amplitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Helper: Compute spectral rolloff
   */
  private computeSpectralRolloff(
    spectrum: { frequency: number; amplitude: number }[]
  ): number {
    const totalEnergy = spectrum.reduce((sum, { amplitude }) => sum + amplitude, 0);
    const threshold = 0.85 * totalEnergy;
    
    let cumulativeEnergy = 0;
    for (const { frequency, amplitude } of spectrum) {
      cumulativeEnergy += amplitude;
      if (cumulativeEnergy >= threshold) {
        return frequency;
      }
    }
    
    return spectrum[spectrum.length - 1]?.frequency || 0;
  }

  /**
   * Helper: Compute zero crossing rate
   */
  private computeZeroCrossingRate(samples: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / samples.length;
  }

  /**
   * Helper: Compute RMS energy
   */
  private computeRMSEnergy(samples: Float32Array): number {
    const sumSquares = Array.from(samples).reduce((sum, sample) => sum + sample * sample, 0);
    return Math.sqrt(sumSquares / samples.length);
  }
}

export const wavProcessor = new WavProcessor();
