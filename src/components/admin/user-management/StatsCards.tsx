/**
 * UserManagementHub - Stats cards row
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Shield, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: { total: number; active: number; pending: number; admins: number; managers: number };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.total}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-success" />+2 este mês
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
        <CheckCircle className="h-4 w-4 text-success" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.active}</div>
        <p className="text-xs text-muted-foreground">
          {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
        <Clock className="h-4 w-4 text-warning" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.pending}</div>
        <p className="text-xs text-muted-foreground">Aguardando aceitação</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
        <Shield className="h-4 w-4 text-info" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.admins}</div>
        <p className="text-xs text-muted-foreground">+{stats.managers} gerentes</p>
      </CardContent>
    </Card>
  </div>
);
