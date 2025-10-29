/**
 * PATCH 164.0 / PATCH 456 - Navigation Copilot Export
 */

export { navigationCopilot } from "./index";
export { NavigationMap } from "./components/NavigationMap";
export { NavigationCopilotPanel } from "./components/NavigationCopilotPanel";
export { navigationAILogsService } from "./services/navigationAILogsService";
export { default as NavigationCopilotPage } from "./NavigationCopilotPage";

export type {
  Coordinates,
  RoutePoint,
  WeatherData,
  WeatherForecast,
  NavigationRoute,
  WeatherAlert,
  RouteOptimizationOptions
} from "./index";

export type { NavigationLog, NavigationLogInput } from "./services/navigationAILogsService";
