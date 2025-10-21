// @ts-nocheck
/**
 * AI Model Loader
 * Helper for loading ONNX Runtime models for local inference
 * Used by Forecast Global AI engine
 */

import * as ort from "onnxruntime-web";

/**
 * Load a forecast model from the specified path
 * @param path - Path to the ONNX model file
 * @returns ONNX Runtime inference session
 */
export const loadForecastModel = async (path = "/models/nautilus_forecast.onnx") => {
  const session = await ort.InferenceSession.create(path);
  return session;
};
