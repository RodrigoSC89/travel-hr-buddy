/**
 * PATCH 428 - Sensor Simulator
 */

export class SensorSimulator {
  private running = false;

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  isRunning() {
    return this.running;
  }
}

export const sensorSimulator = new SensorSimulator();
