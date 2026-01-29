/**
 * Gerenciador de Acesso a Embarcações
 * Permite HR/Admin atribuir usuários a embarcações específicas
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ship, Users, Plus, Trash2, Shield, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VesselAccessRecord {
  id: string;
  user_id: string;
  vessel_id: string;
  access_level: string;
  granted_at: string;
  is_active: boolean;
  user_email?: string;
  user_name?: string;
  vessel_name?: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Vessel {
  id: string;
  name: string;
}

const ACCESS_LEVELS = [
  { value: "member", label: "Tripulante", description: "Visualização básica" },
  { value: "officer", label: "Oficial", description: "Pode gerenciar tarefas" },
  { value: "captain", label: "Comandante", description: "Acesso completo à embarcação" },
  { value: "manager", label: "Gerente", description: "Acesso administrativo" },
];

export function VesselAccessManager() {
  const { toast } = useToast();
  const [accessRecords, setAccessRecords] = useState<VesselAccessRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("member");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar registros de acesso
      const { data: accessData, error: accessError } = await supabase
        .from("user_vessel_access")
        .select(`
          id,
          user_id,
          vessel_id,
          access_level,
          granted_at,
          is_active,
          vessels (name)
        `)
        .order("granted_at", { ascending: false });

      if (accessError) throw accessError;

      // Carregar usuários (profiles)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");

      // Carregar embarcações
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");

      // Mapear dados de acesso com nomes
      const mappedAccess: VesselAccessRecord[] = (accessData || []).map((record) => ({
        id: record.id,
        user_id: record.user_id,
        vessel_id: record.vessel_id,
        access_level: record.access_level,
        granted_at: record.granted_at ?? "",
        is_active: record.is_active ?? true,
        vessel_name: (record.vessels as { name?: string } | null)?.name,
        user_email: profilesData?.find((p) => p.id === record.user_id)?.email ?? undefined,
        user_name: profilesData?.find((p) => p.id === record.user_id)?.full_name ?? undefined,
      }));

      setAccessRecords(mappedAccess);
      setUsers(
        (profilesData || []).map((p) => ({
          id: p.id,
          email: p.email || "",
          full_name: p.full_name || undefined,
        }))
      );
      setVessels(vesselsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de acesso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccess = async () => {
    if (!selectedUser || !selectedVessel || !selectedLevel) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione usuário, embarcação e nível de acesso.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("user_vessel_access").upsert(
        {
          user_id: selectedUser,
          vessel_id: selectedVessel,
          access_level: selectedLevel,
          is_active: true,
          granted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,vessel_id" }
      );

      if (error) throw error;

      toast({
        title: "Acesso concedido",
        description: "O usuário agora tem acesso à embarcação selecionada.",
      });

      setIsDialogOpen(false);
      setSelectedUser("");
      setSelectedVessel("");
      setSelectedLevel("member");
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar acesso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível conceder o acesso.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAccess = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("user_vessel_access")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      toast({
        title: "Acesso removido",
        description: "O acesso do usuário foi revogado.",
      });

      loadData();
    } catch (error) {
      console.error("Erro ao remover acesso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o acesso.",
        variant: "destructive",
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const levelInfo = ACCESS_LEVELS.find((l) => l.value === level);
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      manager: "destructive",
      captain: "default",
      officer: "secondary",
      member: "outline",
    };
    return (
      <Badge variant={variants[level] || "outline"}>
        {levelInfo?.label || level}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Controle de Acesso por Embarcação
            </CardTitle>
            <CardDescription>
              Gerencie quais usuários têm acesso a cada embarcação
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Acesso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conceder Acesso a Embarcação</DialogTitle>
                <DialogDescription>
                  Selecione o usuário e a embarcação para conceder acesso.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{user.full_name || user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Embarcação</Label>
                  <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma embarcação" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>
                          <div className="flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            <span>{vessel.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <span className="font-medium">{level.label}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              - {level.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAccess} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Conceder Acesso"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Usuários com roles <strong>Admin</strong>, <strong>RH</strong>,{" "}
            <strong>Jurídico</strong>, <strong>Financeiro</strong> e{" "}
            <strong>Compras</strong> têm acesso automático a todas as embarcações.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : accessRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum acesso específico configurado.</p>
            <p className="text-sm">
              Clique em "Adicionar Acesso" para vincular usuários a embarcações.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {record.user_name || "Sem nome"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.user_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      {record.vessel_name || "Embarcação não encontrada"}
                    </div>
                  </TableCell>
                  <TableCell>{getAccessLevelBadge(record.access_level)}</TableCell>
                  <TableCell>
                    {new Date(record.granted_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.is_active ? "default" : "secondary"}>
                      {record.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccess(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default VesselAccessManager;
