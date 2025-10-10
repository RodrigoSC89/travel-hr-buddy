import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Paperclip,
  Users,
  User,
  Hash,
  AlertTriangle,
  Star,
  Clock,
  FileText,
  Image,
  Mic,
  Smile,
  AtSign,
  Save,
  Eye,
  Zap,
  Building,
  UserCheck,
  Globe,
  Shield
} from "lucide-react";

interface MessageComposerProps {
  onMessageSent: () => void;
}

interface Recipient {
  id: string;
  name: string;
  role?: string;
  type: "user" | "channel" | "department" | "broadcast";
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onMessageSent
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "critical">("normal");
  const [category, setCategory] = useState<"general" | "hr" | "operations" | "emergency">("general");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Real-time validation
  useEffect(() => {
    const errors: string[] = [];
    
    if (messageContent.length > 5000) {
      errors.push("Mensagem excede o limite de 5000 caracteres");
    }
    
    if (selectedRecipients.length === 0 && messageContent.trim()) {
      errors.push("Selecione ao menos um destinatário");
    }
    
    if (attachments.length > 10) {
      errors.push("Máximo de 10 anexos permitidos");
    }
    
    const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      errors.push("Tamanho total dos anexos excede 50MB");
    }
    
    setValidationErrors(errors);
  }, [messageContent, selectedRecipients, attachments]);

  useEffect(() => {
    loadRecipients();
    loadTemplates();
  }, []);

  const loadRecipients = async () => {
    try {
      // Mock recipients data - replace with real Supabase query
      const mockRecipients: Recipient[] = [
        // Users
        { id: "user-1", name: "Ana Silva", role: "Gerente de RH", type: "user" },
        { id: "user-2", name: "Carlos Mendes", role: "Coordenador de Operações", type: "user" },
        { id: "user-3", name: "Marina Santos", role: "Capitã", type: "user" },
        { id: "user-4", name: "João Oliveira", role: "DPO", type: "user" },
        { id: "user-5", name: "Pedro Costa", role: "Engenheiro Chefe", type: "user" },
        
        // Channels
        { id: "channel-1", name: "Geral", type: "channel" },
        { id: "channel-2", name: "RH - Recursos Humanos", type: "channel" },
        { id: "channel-3", name: "Operações Marítimas", type: "channel" },
        { id: "channel-4", name: "Emergência", type: "channel" },
        
        // Departments
        { id: "dept-1", name: "Departamento de RH", type: "department" },
        { id: "dept-2", name: "Operações", type: "department" },
        { id: "dept-3", name: "Engenharia e Máquinas", type: "department" },
        { id: "dept-4", name: "Deck e Navegação", type: "department" },
        
        // Broadcast
        { id: "broadcast-1", name: "Todos os Usuários", type: "broadcast" },
        { id: "broadcast-2", name: "Tripulantes Embarcados", type: "broadcast" },
        { id: "broadcast-3", name: "Equipe em Terra", type: "broadcast" }
      ];

      setRecipients(mockRecipients);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const loadTemplates = async () => {
    try {
      // Mock templates data
      const mockTemplates: MessageTemplate[] = [
        {
          id: "1",
          name: "Confirmação de Embarque",
          content: "Prezado {{nome}}, confirmo seu embarque para o dia {{data}} na embarcação {{embarcacao}}. Favor confirmar recebimento.",
          category: "operations",
          variables: ["nome", "data", "embarcacao"]
        },
        {
          id: "2",
          name: "Lembrete de Certificação",
          content: "Olá {{nome}}, sua certificação {{certificacao}} vence em {{dias}} dias. Favor providenciar a renovação.",
          category: "hr",
          variables: ["nome", "certificacao", "dias"]
        },
        {
          id: "3",
          name: "Comunicado Geral",
          content: "Comunicamos que {{assunto}}. Para mais informações, entre em contato com {{contato}}.",
          category: "general",
          variables: ["assunto", "contato"]
        },
        {
          id: "4",
          name: "Alerta de Emergência",
          content: "ALERTA: {{situacao}}. Todos devem {{acao}}. Confirmem recebimento imediatamente.",
          category: "emergency",
          variables: ["situacao", "acao"]
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
      setSelectedTemplate(templateId);
      setIsTemplateDialogOpen(false);
      
      // Auto-set category based on template
      if (["general", "hr", "operations", "emergency"].includes(template.category)) {
        setCategory(template.category as any);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      
      // Validate file sizes (max 10MB per image)
      const invalidFiles = files.filter(f => f.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast({
          title: "Erro",
          description: `${invalidFiles.length} arquivo(s) excedem o tamanho máximo de 10MB`,
          variant: "destructive"
        });
        return;
      }
      
      setAttachments(prev => [...prev, ...files]);
      toast({
        title: "Sucesso",
        description: `${files.length} imagem(ns) adicionada(s)`
      });
    };
    input.click();
  };

  const handleAudioUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.multiple = true;
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      
      // Validate file sizes (max 25MB per audio)
      const invalidFiles = files.filter(f => f.size > 25 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast({
          title: "Erro",
          description: `${invalidFiles.length} arquivo(s) excedem o tamanho máximo de 25MB`,
          variant: "destructive"
        });
        return;
      }
      
      setAttachments(prev => [...prev, ...files]);
      toast({
        title: "Sucesso",
        description: `${files.length} áudio(s) adicionado(s)`
      });
    };
    input.click();
  };

  const toggleEmojiPicker = () => {
    toast({
      title: "Emoji Picker",
      description: "Funcionalidade de emojis em breve!"
    });
  };

  const saveDraft = async () => {
    try {
      if (!messageContent.trim() && attachments.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há conteúdo para salvar",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      // Mock saving draft - replace with real Supabase operations
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Sucesso",
        description: "Rascunho salvo com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar rascunho",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      if (!messageContent.trim() || selectedRecipients.length === 0) {
        toast({
          title: "Erro",
          description: "Selecione destinatários e escreva uma mensagem",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      // Mock message sending - replace with real Supabase operations
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      setMessageContent("");
      setSubject("");
      setSelectedRecipients([]);
      setAttachments([]);
      setPriority("normal");
      setCategory("general");
      setIsUrgent(false);
      setIsBroadcast(false);
      setSelectedTemplate("");

      onMessageSent();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
    case "user": return User;
    case "channel": return Hash;
    case "department": return Building;
    case "broadcast": return Globe;
    default: return Users;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "text-destructive";
    case "high": return "text-warning";
    case "normal": return "text-primary";
    case "low": return "text-muted-foreground";
    default: return "text-muted-foreground";
    }
  };

  const filteredRecipients = recipients.filter(r => 
    r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    r.role?.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compor Nova Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipients Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Destinatários</Label>
            
            {/* Recipient Search */}
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários, canais ou departamentos..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Recipients */}
            {selectedRecipients.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Selecionados ({selectedRecipients.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipients.map(id => {
                    const recipient = recipients.find(r => r.id === id);
                    if (!recipient) return null;
                    
                    const Icon = getRecipientIcon(recipient.type);
                    
                    return (
                      <Badge 
                        key={id} 
                        variant="secondary" 
                        className="gap-1 cursor-pointer"
                        onClick={() => handleRecipientToggle(id)}
                      >
                        <Icon className="h-3 w-3" />
                        {recipient.name}
                        <span className="text-xs ml-1">×</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recipients List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {filteredRecipients.map(recipient => {
                const Icon = getRecipientIcon(recipient.type);
                const isSelected = selectedRecipients.includes(recipient.id);
                
                return (
                  <div
                    key={recipient.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleRecipientToggle(recipient.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{recipient.name}</p>
                      {recipient.role && (
                        <p className="text-xs opacity-75 truncate">{recipient.role}</p>
                      )}
                    </div>
                    {isSelected && <UserCheck className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="emergency">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Urgente</Label>
                <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Transmissão</Label>
                <Switch checked={isBroadcast} onCheckedChange={setIsBroadcast} />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label>Assunto (Opcional)</Label>
            <Input
              placeholder="Assunto da mensagem..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mensagem</Label>
              <div className="flex items-center gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Selecionar Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className="p-3 border rounded cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.content}
                          </p>
                          {template.variables.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-xs text-muted-foreground">Variáveis:</span>
                              {template.variables.map(variable => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={toggleEmojiPicker} aria-label="Adicionar emoji">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Digite sua mensagem aqui..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-32"
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className={messageContent.length > 5000 ? "text-destructive" : "text-muted-foreground"}>
                {messageContent.length} / 5000 caracteres
              </span>
              {messageContent.length > 4500 && messageContent.length <= 5000 && (
                <span className="text-amber-600">Próximo ao limite</span>
              )}
              {messageContent.length > 5000 && (
                <span className="text-destructive font-medium">Limite excedido!</span>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Anexos</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Adicionar Arquivo
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" onClick={handleImageUpload} aria-label="Adicionar imagem">
                <Image className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              <Button variant="outline" size="sm" onClick={handleAudioUpload} aria-label="Adicionar áudio">
                <Mic className="h-4 w-4 mr-2" />
                Áudio
              </Button>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive mb-2">Erros de Validação:</p>
                  <ul className="space-y-1 text-sm text-destructive/90">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Message Preview */}
          {(isUrgent || priority === "critical" || isBroadcast) && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Pré-visualização</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {priority === "critical" && (
                    <Badge variant="destructive">CRÍTICA</Badge>
                  )}
                  {isUrgent && (
                    <Badge variant="destructive">URGENTE</Badge>
                  )}
                  {isBroadcast && (
                    <Badge variant="secondary">TRANSMISSÃO</Badge>
                  )}
                </div>
                {subject && (
                  <p><strong>Assunto:</strong> {subject}</p>
                )}
                <p className="text-muted-foreground">{messageContent}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Salvar como rascunho</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={saveDraft}
                disabled={loading}
                aria-label="Salvar rascunho"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button 
                onClick={sendMessage} 
                disabled={loading || selectedRecipients.length === 0 || validationErrors.length > 0}
                className="gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};