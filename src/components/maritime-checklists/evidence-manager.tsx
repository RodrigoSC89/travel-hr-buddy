import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  Mic, 
  File, 
  Upload, 
  X, 
  CheckCircle,
  AlertTriangle,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EvidenceItem {
  id: string;
  type: "photo" | "audio" | "document";
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface EvidenceManagerProps {
  checklistItemId: string;
  existingEvidence?: EvidenceItem[];
  onEvidenceUpdate?: (evidence: EvidenceItem[]) => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  checklistItemId,
  existingEvidence = [],
  onEvidenceUpdate
}) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(existingEvidence);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleFileUpload = async (files: FileList, type: "photo" | "document") => {
    if (!files.length) return;

    const file = files[0];
    const maxSize = type === "photo" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for photos, 50MB for documents

    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${checklistItemId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("checklist-evidence")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("checklist-evidence")
        .getPublicUrl(fileName);

      const newEvidence: EvidenceItem = {
        id: Date.now().toString(),
        type,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      // Save to database
      const { error: dbError } = await supabase
        .from("checklist_evidence")
        .insert({
          checklist_item_id: checklistItemId,
          file_type: type,
          file_url: urlData.publicUrl,
          description: file.name,
          file_size: file.size
        });

      if (dbError) throw dbError;

      const updatedEvidence = [...evidence, newEvidence];
      setEvidence(updatedEvidence);
      onEvidenceUpdate?.(updatedEvidence);

      toast.success("Evidência enviada com sucesso!");
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast.error("Erro ao enviar evidência");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        await uploadAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      toast.info("Gravação iniciada...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
      toast.success("Gravação finalizada");
    }
  };

  const uploadAudioBlob = async (blob: Blob) => {
    try {
      setUploading(true);

      const fileName = `${checklistItemId}/audio_${Date.now()}.wav`;
      
      const { data, error } = await supabase.storage
        .from("checklist-evidence")
        .upload(fileName, blob);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("checklist-evidence")
        .getPublicUrl(fileName);

      const newEvidence: EvidenceItem = {
        id: Date.now().toString(),
        type: "audio",
        name: `Audio_${new Date().toLocaleTimeString()}.wav`,
        url: urlData.publicUrl,
        size: blob.size,
        uploadedAt: new Date().toISOString()
      };

      // Save to database
      const { error: dbError } = await supabase
        .from("checklist_evidence")
        .insert({
          checklist_item_id: checklistItemId,
          file_type: "audio",
          file_url: urlData.publicUrl,
          description: `Audio recording ${new Date().toLocaleTimeString()}`,
          file_size: blob.size
        });

      if (dbError) throw dbError;

      const updatedEvidence = [...evidence, newEvidence];
      setEvidence(updatedEvidence);
      onEvidenceUpdate?.(updatedEvidence);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Erro ao enviar áudio");
    } finally {
      setUploading(false);
    }
  };

  const removeEvidence = async (evidenceId: string) => {
    try {
      const item = evidence.find(e => e.id === evidenceId);
      if (!item) return;

      // Remove from storage
      const fileName = item.url.split("/").pop();
      if (fileName) {
        await supabase.storage
          .from("checklist-evidence")
          .remove([`${checklistItemId}/${fileName}`]);
      }

      // Remove from database
      await supabase
        .from("checklist_evidence")
        .delete()
        .eq("file_url", item.url);

      const updatedEvidence = evidence.filter(e => e.id !== evidenceId);
      setEvidence(updatedEvidence);
      onEvidenceUpdate?.(updatedEvidence);

      toast.success("Evidência removida");
    } catch (error) {
      console.error("Error removing evidence:", error);
      toast.error("Erro ao remover evidência");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
    case "photo": return <Camera className="w-4 h-4" />;
    case "audio": return <Mic className="w-4 h-4" />;
    case "document": return <File className="w-4 h-4" />;
    default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evidências</CardTitle>
        <CardDescription>
          Adicione fotos, áudios ou documentos como evidência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Actions */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, "photo")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button variant="outline" size="sm" disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />
              Foto
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className={recording ? "bg-red-50 border-red-200" : ""}
          >
            <Mic className={`w-4 h-4 mr-2 ${recording ? "text-red-500" : ""}`} />
            {recording ? "Parar" : "Gravar"}
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, "document")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button variant="outline" size="sm" disabled={uploading}>
              <File className="w-4 h-4 mr-2" />
              Documento
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="w-4 h-4 animate-spin" />
            Enviando evidência...
          </div>
        )}

        {/* Evidence List */}
        {evidence.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Evidências anexadas:</h4>
            {evidence.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEvidenceIcon(item.type)}
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidence(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {evidence.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma evidência anexada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};