import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface QuickLoadCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  status?: string;
  isLoading?: boolean;
  badge?: string;
}

export const QuickLoadCard: React.FC<QuickLoadCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  status = 'Disponível',
  isLoading = false,
  badge
}) => {
  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-600">{status}</span>
          <Button 
            onClick={onClick}
            disabled={isLoading}
            className="transition-all duration-300"
            size="sm"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Carregando...
              </>
            ) : (
              'Acessar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};