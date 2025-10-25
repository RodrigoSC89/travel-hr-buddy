/**
 * PATCH 161.0 - Mission Dashboard Component
 * Summarized mission control panel for mobile
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { MissionDashboard } from '../types';

interface MissionDashboardProps {
  mission: MissionDashboard;
  onViewDetails?: () => void;
}

export const MissionDashboardComponent: React.FC<MissionDashboardProps> = ({
  mission,
  onViewDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{mission.missionName}</CardTitle>
          </div>
          <Badge className={getStatusColor(mission.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(mission.status)}
              <span>{mission.status}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{Math.round(mission.progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                mission.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Checklists */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Checklists</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {mission.checklistsCompleted}/{mission.checklistsTotal}
            </div>
          </div>

          {/* Critical Items */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-600 font-medium">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {mission.criticalItems}
            </div>
          </div>
        </div>

        {/* Estimated Completion */}
        {mission.estimatedCompletion && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Est. Completion
              </span>
            </div>
            <span className="text-sm font-semibold text-green-900">
              {mission.estimatedCompletion}
            </span>
          </div>
        )}

        {/* Last Update */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last update</span>
          </div>
          <span>{formatLastUpdate(mission.lastUpdate)}</span>
        </div>

        {/* Action Button */}
        {onViewDetails && (
          <Button 
            onClick={onViewDetails} 
            className="w-full"
            variant="outline"
          >
            View Full Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
