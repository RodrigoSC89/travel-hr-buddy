import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackToDashboardProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export const BackToDashboard: React.FC<BackToDashboardProps> = ({ 
  className = "", 
  variant = "outline" 
}) => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <Button
      onClick={handleBackToDashboard}
      variant={variant}
      className={`group flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
      <Home className="h-4 w-4" />
      <span>Dashboard Principal</span>
    </Button>
  );
};