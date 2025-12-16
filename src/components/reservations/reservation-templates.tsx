import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  Plus, 
  Star, 
  Edit, 
  Trash2, 
  Copy,
  Building,
  Plane,
  Car,
  Ship,
  FileText,
  Users,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ReservationTemplate {
  id: string;
  name: string;
  template_type: string;
  template_data: {
    title: string;
    description?: string;
    reservation_type: string;
    location?: string;
    address?: string;
    contact_info?: string;
    supplier_url?: string;
    room_type?: string;
    currency?: string;
    notes?: string;
  };
  is_public: boolean;
  created_by?: string;
  organization_id?: string;
  created_at: string;
}

interface ReservationTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateData: any) => void;
}

export const ReservationTemplates: React.FC<ReservationTemplatesProps> = ({
  isOpen,
  onClose,
  onUseTemplate
}) => {
  const [templates, setTemplates] = useState<ReservationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReservationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    template_type: "hotel",
    title: "",
    description: "",
    reservation_type: "hotel" as const,
    location: "",
    address: "",
    contact_info: "",
    supplier_url: "",
    room_type: "",
    currency: "BRL",
    notes: "",
    is_public: false
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservation_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setTemplates(data.map(item => ({
          ...item,
          is_public: item.is_public ?? false,
          created_by: item.created_by ?? undefined,
          organization_id: item.organization_id ?? undefined,
          template_data: item.template_data as any
        })));
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !formData.name.trim() || !formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome e título são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const templateData = {
        name: formData.name.trim(),
        template_type: formData.template_type,
        template_data: {
          title: formData.title,
          description: formData.description || null,
          reservation_type: formData.reservation_type,
          location: formData.location || null,
          address: formData.address || null,
          contact_info: formData.contact_info || null,
          supplier_url: formData.supplier_url || null,
          room_type: formData.room_type || null,
          currency: formData.currency,
          notes: formData.notes || null
        },
        is_public: formData.is_public,
        created_by: user.id
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("reservation_templates")
          .update(templateData)
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Template atualizado com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from("reservation_templates")
          .insert([templateData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Template criado com sucesso!"
        });
      }

      resetForm();
      setShowCreateDialog(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    try {
      const { error } = await supabase
        .from("reservation_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!"
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive"
      });
    }
  };

  const handleUseTemplate = (template: ReservationTemplate) => {
    onUseTemplate(template.template_data);
    onClose();
    toast({
      title: "Template aplicado",
      description: "Os dados do template foram preenchidos no formulário"
    });
  };

  const handleEditTemplate = (template: ReservationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      title: template.template_data.title,
      description: template.template_data.description || "",
      reservation_type: template.template_data.reservation_type as any,
      location: template.template_data.location || "",
      address: template.template_data.address || "",
      contact_info: template.template_data.contact_info || "",
      supplier_url: template.template_data.supplier_url || "",
      room_type: template.template_data.room_type || "",
      currency: template.template_data.currency || "BRL",
      notes: template.template_data.notes || "",
      is_public: template.is_public
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      template_type: "hotel",
      title: "",
      description: "",
      reservation_type: "hotel",
      location: "",
      address: "",
      contact_info: "",
      supplier_url: "",
      room_type: "",
      currency: "BRL",
      notes: "",
      is_public: false
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "hotel": return <Building className="h-4 w-4" />;
    case "flight": return <Plane className="h-4 w-4" />;
    case "transport": return <Car className="h-4 w-4" />;
    case "embarkation": return <Ship className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
    case "hotel": return "Hotel";
    case "flight": return "Voo";
    case "transport": return "Transporte";
    case "embarkation": return "Embarque";
    case "other": return "Outro";
    default: return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Templates de Reservas
            </DialogTitle>
            <DialogDescription>
              Use templates pré-configurados para criar reservas rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Templates Disponíveis</h3>
              <Button onClick={() => {
                resetForm();
                setEditingTemplate(null);
                setShowCreateDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro template para agilizar futuras reservas
                </p>
                <Button onClick={() => {
                  resetForm();
                  setEditingTemplate(null);
                  setShowCreateDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getTypeIcon(template.template_data.reservation_type)}
                          <span className="truncate">{template.name}</span>
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {template.is_public && (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Público
                            </Badge>
                          )}
                          {template.created_by === user?.id && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              Meu
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium">{template.template_data.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getTypeLabel(template.template_data.reservation_type)}
                        </p>
                      </div>

                      {template.template_data.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {template.template_data.location}
                        </p>
                      )}

                      {template.template_data.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.template_data.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar
                        </Button>
                        
                        {template.created_by === user?.id && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              Configure um template para reutilizar em futuras reservas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Template *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Hotel Padrão Santos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Reserva</label>
                <select
                  value={formData.reservation_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    reservation_type: e.target.value as any,
                    template_type: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="hotel">Hotel</option>
                  <option value="flight">Voo</option>
                  <option value="transport">Transporte</option>
                  <option value="embarkation">Embarque</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Reserva *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Hotel Santos Dumont"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição padrão para este tipo de reserva..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Local</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Santos, SP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Quarto/Serviço</label>
                <Input
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  placeholder="Ex: Quarto duplo standard"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contato</label>
                <Input
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  placeholder="Telefone, email..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link do Fornecedor</label>
                <Input
                  value={formData.supplier_url}
                  onChange={(e) => setFormData({ ...formData, supplier_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações padrão..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <label htmlFor="is_public" className="text-sm">
                Tornar este template público (outros usuários poderão vê-lo)
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveTemplate} className="flex-1">
              {editingTemplate ? "Atualizar Template" : "Criar Template"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingTemplate(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};