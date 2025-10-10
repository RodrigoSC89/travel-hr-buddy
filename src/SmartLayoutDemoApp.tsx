import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SmartLayout } from "@/components/layout/SmartLayout";
import SmartLayoutDemo from "@/pages/SmartLayoutDemo";

/**
 * Standalone demo app to showcase the SmartLayout
 * This demonstrates the Smart Sidebar and Smart Header in action
 */
function SmartLayoutDemoApp() {
  return (
    <Router>
      <Routes>
        <Route element={<SmartLayout />}>
          <Route path="/" element={<SmartLayoutDemo />} />
          <Route path="/smart-layout-demo" element={<SmartLayoutDemo />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default SmartLayoutDemoApp;
