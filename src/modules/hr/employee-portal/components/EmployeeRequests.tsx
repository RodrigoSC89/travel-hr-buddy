
import { memo, memo, useState, useCallback } from "react";;;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, FileText, Plane } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RequestType = "vacation" | "certificate" | "travel";
type RequestStatus = "pending" | "approved" | "rejected";

interface EmployeeRequest {
  id: string;
  user_id: string;
  request_type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  metadata: {
    start_date?: string;
    end_date?: string;
    certificate_type?: string;
    destination?: string;
  };
}

export const EmployeeRequests = memo(function() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("vacation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [destination, setDestination] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["employee-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("employee_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as unknown;

      if (error) throw error;
      return (data || []) as EmployeeRequest[];
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const metadata: unknown = {};
      if (requestType === "vacation") {
        metadata.start_date = startDate;
        metadata.end_date = endDate;
      } else if (requestType === "certificate") {
        metadata.certificate_type = certificateType;
      } else if (requestType === "travel") {
        metadata.destination = destination;
        metadata.start_date = startDate;
        metadata.end_date = endDate;
      }

      const { data, error } = await supabase
        .from("employee_requests")
        .insert({
          user_id: user.id,
          request_type: requestType,
          title,
          description,
          status: "pending",
          metadata,
        } as unknown)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
      toast({
        title: "Solicitação criada",
        description: "Sua solicitação foi enviada para aprovação.",
      });
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setCertificateType("");
    setDestination("");
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
    case "approved":
      return <Badge variant="default">Aprovada</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejeitada</Badge>;
    default:
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getRequestIcon = (type: RequestType) => {
    switch (type) {
    case "vacation":
      return <Calendar className="h-5 w-5" />;
    case "certificate":
      return <FileText className="h-5 w-5" />;
    case "travel":
      return <Plane className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Solicitações</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Solicitação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Solicitação</label>
                <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Férias</SelectItem>
                    <SelectItem value="certificate">Certificado</SelectItem>
                    <SelectItem value="travel">Viagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={title}
                  onChange={handleChange}
                  placeholder="Ex: Férias de Janeiro"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={description}
                  onChange={handleChange}
                  placeholder="Descreva sua solicitação..."
                  rows={3}
                />
              </div>

              {requestType === "vacation" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data Início</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Fim</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {requestType === "certificate" && (
                <div>
                  <label className="text-sm font-medium">Tipo de Certificado</label>
                  <Input
                    value={certificateType}
                    onChange={handleChange}
                    placeholder="Ex: STCW, ISO..."
                  />
                </div>
              )}

              {requestType === "travel" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Destino</label>
                    <Input
                      value={destination}
                      onChange={handleChange}
                      placeholder="Ex: Santos, SP"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Data Início</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data Fim</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={() => createRequestMutation.mutate()}
                disabled={!title || createRequestMutation.isPending}
                className="w-full"
              >
                {createRequestMutation.isPending ? "Criando..." : "Criar Solicitação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando solicitações...</div>
      ) : (
        <div className="grid gap-4">
          {requests?.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getRequestIcon(request.request_type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.description}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Criado: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.metadata?.start_date && (
                        <span>Período: {new Date(request.metadata.start_date).toLocaleDateString()} - {new Date(request.metadata.end_date!).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
