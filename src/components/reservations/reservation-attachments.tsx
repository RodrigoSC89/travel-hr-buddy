import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Paperclip, Upload, Download, FileText, Image, File, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttachmentFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface ReservationAttachmentsProps {
  reservationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationAttachments: React.FC<ReservationAttachmentsProps> = ({
  reservationId,
  isOpen,
  onClose,
}) => {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && reservationId) {
      fetchAttachments();
    }
  }, [isOpen, reservationId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reservation_attachments")
        .select("*")
        .eq("reservation_id", reservationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar anexos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `${file.name} excede o limite de 10MB`,
            variant: "destructive",
          });
          continue;
        }

        // Upload file to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${reservationId}_${Date.now()}.${fileExt}`;
        const filePath = `reservations/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("certificates") // Using existing bucket
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("certificates").getPublicUrl(filePath);

        // Save attachment record
        const { error: dbError } = await supabase.from("reservation_attachments").insert({
          reservation_id: reservationId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        });

        if (dbError) throw dbError;
      }

      toast({
        title: "Sucesso",
        description: "Anexos enviados com sucesso!",
      });

      fetchAttachments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar anexos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, filePath: string) => {
    if (!confirm("Tem certeza que deseja excluir este anexo?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("certificates")
        .remove([filePath]);

      // Delete from database
      const { error: dbError } = await supabase
        .from("reservation_attachments")
        .delete()
        .eq("id", attachmentId);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Anexo excluído com sucesso!",
      });

      fetchAttachments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir anexo",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFilePathFromUrl = (url: string) => {
    // Extract file path from Supabase storage URL
    const urlParts = url.split("/");
    return urlParts.slice(-2).join("/"); // Get 'reservations/filename'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Anexos da Reserva
          </DialogTitle>
          <DialogDescription>
            Gerencie documentos, comprovantes e outros arquivos relacionados a esta reserva
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enviar Novos Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Suporte para PDF, imagens e documentos (máx. 10MB por arquivo)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Enviando..." : "Selecionar Arquivos"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attachments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anexos ({attachments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando anexos...</p>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Nenhum anexo encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-primary/10 rounded">
                            {getFileIcon(attachment.file_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate" title={attachment.file_name}>
                              {attachment.file_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {formatFileSize(attachment.file_size)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(attachment.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(attachment.file_url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = attachment.file_url;
                              link.download = attachment.file_name;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteAttachment(
                                attachment.id,
                                getFilePathFromUrl(attachment.file_url)
                              )
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
