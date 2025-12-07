import React from "react";
import { Navigate } from "react-router-dom";

// PATCH: UNIFY-ACADEMY - Redirect to Nautilus Academy
const Academy = () => {
  return <Navigate to="/nautilus-academy" replace />;
};

export default Academy;
