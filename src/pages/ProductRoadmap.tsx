/**
 * ProductRoadmap Redirect
 * PATCH 990: Module merged into SystemHub
 */
import { Navigate } from "react-router-dom";

export default function ProductRoadmapPage() {
  return <Navigate to="/system-hub" replace />;
}
