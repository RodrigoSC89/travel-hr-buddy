import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { format } from 'date-fns';
import { 
  Camera as CameraIcon,
  Upload, 
  FileText, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface Certificate {
  id: string;
  employee_id: string;
  certificate_name: string;
  certificate_type: string;
  file_path: string;
  issue_date: string;
  expiry_date: string;
  issuer?: string;
  status: 'active' | 'expired' | 'expiring_soon';
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
}

interface CertificateManagerProps {
  employee: Employee;
  onClose: () => void;
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({ employee, onClose }) => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [newCertificate, setNewCertificate] = useState({
    certificate_name: '',
    certificate_type: '',
    issuer: '',
    issue_date: null as Date | null,
    expiry_date: null as Date | null
  });

  const certificateTypes = [
    'STCW Basic Safety',
    'DP Certificate',
    'Leadership',
    'IATA Certified',
    'Corporate Travel',
    'GDS Expert',
    'HR Management',
    'Recruitment Specialist',
    'Hotel Management',
    'Revenue Management',
    'Customer Service',
    'Outros'
  ];

  useEffect(() => {
    loadCertificates();
  }, [employee.id]);

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_certificates')
        .select('*')
        .eq('employee_id', employee.id)
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setCertificates((data || []) as Certificate[]);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar certificados',
        variant: 'destructive'
      });
    }
  };

  const captureFromCamera = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
        // Convert dataUrl to File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `certificate_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        
        toast({
          title: 'Foto capturada',
          description: 'Foto do certificado capturada com sucesso'
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: 'Erro na câmera',
        description: 'Não foi possível acessar a câmera. Tente fazer upload de um arquivo.',
        variant: 'destructive'
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCapturedImage(null);
      
      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const uploadCertificate = async () => {
    if (!selectedFile || !newCertificate.certificate_name || !newCertificate.certificate_type || 
        !newCertificate.issue_date || !newCertificate.expiry_date) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos e selecione um arquivo',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${employee.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save certificate record
      const { error: insertError } = await supabase
        .from('employee_certificates')
        .insert({
          employee_id: employee.id,
          certificate_name: newCertificate.certificate_name,
          certificate_type: newCertificate.certificate_type,
          file_path: fileName,
          issue_date: format(newCertificate.issue_date, 'yyyy-MM-dd'),
          expiry_date: format(newCertificate.expiry_date, 'yyyy-MM-dd'),
          issuer: newCertificate.issuer || null
        });

      if (insertError) throw insertError;

      toast({
        title: 'Certificado adicionado',
        description: 'Certificado enviado com sucesso'
      });

      // Reset form
      setNewCertificate({
        certificate_name: '',
        certificate_type: '',
        issuer: '',
        issue_date: null,
        expiry_date: null
      });
      setSelectedFile(null);
      setCapturedImage(null);
      setIsAddingCertificate(false);
      loadCertificates();

    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast({
        title: 'Erro no upload',
        description: 'Erro ao enviar certificado',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const { data, error } = await supabase.storage
        .from('certificates')
        .download(certificate.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = certificate.certificate_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Erro no download',
        description: 'Erro ao baixar certificado',
        variant: 'destructive'
      });
    }
  };

  const deleteCertificate = async (certificate: Certificate) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('certificates')
        .remove([certificate.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('employee_certificates')
        .delete()
        .eq('id', certificate.id);

      if (dbError) throw dbError;

      toast({
        title: 'Certificado removido',
        description: 'Certificado removido com sucesso'
      });

      loadCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Erro ao remover certificado',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white"><CheckCircle size={12} className="mr-1" />Ativo</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-warning text-white"><Clock size={12} className="mr-1" />Expirando</Badge>;
      case 'expired':
        return <Badge className="bg-destructive text-white"><AlertTriangle size={12} className="mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getExpiryDays = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificados - {employee.name}</DialogTitle>
          <DialogDescription>
            Gerencie os certificados e suas validades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Certificate Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Certificados ({certificates.length})</h3>
            <Button onClick={() => setIsAddingCertificate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Certificado
            </Button>
          </div>

          {/* Certificates List */}
          <div className="grid gap-4">
            {certificates.map((certificate) => {
              const expiryDays = getExpiryDays(certificate.expiry_date);
              return (
                <Card key={certificate.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{certificate.certificate_name}</h4>
                        {getStatusBadge(certificate.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Tipo:</span> {certificate.certificate_type}
                        </div>
                        {certificate.issuer && (
                          <div>
                            <span className="font-medium">Emissor:</span> {certificate.issuer}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Emissão:</span> {format(new Date(certificate.issue_date), 'dd/MM/yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Validade:</span> {format(new Date(certificate.expiry_date), 'dd/MM/yyyy')}
                          {expiryDays >= 0 && expiryDays <= 30 && (
                            <span className="ml-2 text-warning font-medium">
                              ({expiryDays} dias restantes)
                            </span>
                          )}
                          {expiryDays < 0 && (
                            <span className="ml-2 text-destructive font-medium">
                              (Expirado há {Math.abs(expiryDays)} dias)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadCertificate(certificate)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteCertificate(certificate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {certificates.length === 0 && (
              <Card className="p-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum certificado encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione certificados para este funcionário
                </p>
                <Button onClick={() => setIsAddingCertificate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Certificado
                </Button>
              </Card>
            )}
          </div>

          {/* Add Certificate Dialog */}
          <Dialog open={isAddingCertificate} onOpenChange={setIsAddingCertificate}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Certificado</DialogTitle>
                <DialogDescription>
                  Faça upload de um novo certificado
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* File Upload Options */}
                <div className="space-y-3">
                  <Label>Arquivo do Certificado</Label>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={captureFromCamera}
                      className="flex-1"
                    >
                      <CameraIcon className="mr-2 h-4 w-4" />
                      Câmera
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Arquivo
                    </Button>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {/* Preview */}
                  {capturedImage && (
                    <div className="mt-3">
                      <img 
                        src={capturedImage} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      Arquivo selecionado: {selectedFile.name}
                    </div>
                  )}
                </div>

                {/* Certificate Details */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cert-name">Nome do Certificado *</Label>
                    <Input
                      id="cert-name"
                      value={newCertificate.certificate_name}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, certificate_name: e.target.value }))}
                      placeholder="Ex: Certificado STCW Básico"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cert-type">Tipo *</Label>
                    <Select 
                      value={newCertificate.certificate_type} 
                      onValueChange={(value) => setNewCertificate(prev => ({ ...prev, certificate_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="issuer">Emissor</Label>
                    <Input
                      id="issuer"
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                      placeholder="Ex: IMO, IATA, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Data de Emissão *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCertificate.issue_date ? format(newCertificate.issue_date, 'dd/MM/yyyy') : 'Selecionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newCertificate.issue_date || undefined}
                            onSelect={(date) => setNewCertificate(prev => ({ ...prev, issue_date: date || null }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Data de Validade *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCertificate.expiry_date ? format(newCertificate.expiry_date, 'dd/MM/yyyy') : 'Selecionar'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newCertificate.expiry_date || undefined}
                            onSelect={(date) => setNewCertificate(prev => ({ ...prev, expiry_date: date || null }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCertificate(false)}>
                  Cancelar
                </Button>
                <Button onClick={uploadCertificate} disabled={isUploading}>
                  {isUploading ? 'Enviando...' : 'Salvar Certificado'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};