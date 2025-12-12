import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Building, Calendar } from "lucide-react";

interface UserProfileBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({ 
  showDetails = false,
  className = ""
}) => {
  const { user } = useAuth();
  const { userRole, getRoleDisplayName, isLoading } = usePermissions();

  if (!user || isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="w-20 h-4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
  
  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-24">
            {displayName}
          </span>
          {userRole && (
            <Badge variant="outline" className="text-xs h-5">
              {getRoleDisplayName(userRole)}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold">{displayName}</h3>
            {userRole && (
              <Badge variant="secondary">
                {getRoleDisplayName(userRole)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        {user.user_metadata?.department && (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>{user.user_metadata.department}</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}</span>
        </div>
      </CardContent>
    </Card>
  );
};