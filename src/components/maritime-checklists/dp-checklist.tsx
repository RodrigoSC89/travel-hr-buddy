import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  FileText,
  Brain,
  QrCode,
  Zap,
  Activity,
  MapPin,
  Users,
  Save,
  Send,
  Eye,
  Edit,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Shield,
  Navigation,
  Anchor,
  Gauge,
  Wind,
  Waves,
  Signal,
  Battery,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { Checklist, ChecklistItem, Evidence } from './checklist-types';

interface DPChecklistProps {
  checklist: Checklist;
  onSave: (checklist: Checklist) => void;
  onSubmit: (checklist: Checklist) => void;
  onBack: () => void;
  readOnly?: boolean;
}

export const DPChecklist: React.FC<DPChecklistProps> = ({
  checklist: initialChecklist,
  onSave,
  onSubmit,
  onBack,
  readOnly = false
}) => {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isEvidenceDialogOpen, setIsEvidenceDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // DP Checklist specific sections
  const sections = [
    {
      id: 'pre_operation',
      title: 'Verificações Pré-Operacionais',
      icon: <Shield className="w-5 h-5" />,
      description: 'Verificações essenciais antes da operação DP'
    },
    {
      id: 'power_systems',
      title: 'Sistemas de Energia',
      icon: <Battery className="w-5 h-5" />,
      description: 'Verificação dos sistemas de energia e redundância'
    },
    {
      id: 'positioning_systems',
      title: 'Sistemas de Posicionamento',
      icon: <Target className="w-5 h-5" />,
      description: 'Sistemas de posicionamento e referência'
    },
    {
      id: 'thrusters',
      title: 'Propulsores',
      icon: <Navigation className="w-5 h-5" />,
      description: 'Verificação dos propulsores e sistemas de propulsão'
    },
    {
      id: 'control_systems',
      title: 'Sistemas de Controle',
      icon: <Settings className="w-5 h-5" />,
      description: 'Sistemas de controle DP e interfaces'
    },
    {
      id: 'sensors',
      title: 'Sensores e Referências',
      icon: <Signal className="w-5 h-5" />,
      description: 'Sensores de posição e sistemas de referência'
    },
    {
      id: 'environmental',
      title: 'Condições Ambientais',
      icon: <Wind className="w-5 h-5" />,
      description: 'Avaliação das condições ambientais'
    },
    {
      id: 'final_verification',
      title: 'Verificação Final',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Verificações finais e autorização operacional'
    }
  ];

  useEffect(() => {
    // Initialize DP checklist items if empty
    if (checklist.items.length === 0) {
      setChecklist(prev => ({
        ...prev,
        items: getDPChecklistItems()
      }));
    }
  }, []);

  useEffect(() => {
    // Auto-save functionality
    if (autoSaveEnabled && !readOnly) {
      const autoSaveTimer = setInterval(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveTimer);
    }
  }, [checklist, autoSaveEnabled, readOnly]);

  const getDPChecklistItems = (): ChecklistItem[] => {
    return [
      // Pre-Operation Checks
      {
        id: 'pre_001',
        title: 'DP Operating Manual Review',
        description: 'Verificar se o manual operacional DP está disponível e atualizado',
        type: 'boolean',
        required: true,
        category: 'pre_operation',
        order: 1,
        status: 'pending',
        validationRules: [
          {
            type: 'custom',
            value: true,
            message: 'Manual operacional DP é obrigatório',
            severity: 'error'
          }
        ]
      },
      {
        id: 'pre_002',
        title: 'Weather Conditions Assessment',
        description: 'Avaliar condições meteorológicas para operação DP',
        type: 'select',
        required: true,
        category: 'pre_operation',
        order: 2,
        status: 'pending',
        options: ['Excelente', 'Bom', 'Aceitável', 'Marginal', 'Inadequado'],
        validationRules: [
          {
            type: 'custom',
            value: ['Excelente', 'Bom', 'Aceitável'],
            message: 'Condições meteorológicas devem ser adequadas',
            severity: 'warning'
          }
        ]
      },
      {
        id: 'pre_003',
        title: 'DP Capability Plot Review',
        description: 'Revisar capability plot para condições atuais',
        type: 'boolean',
        required: true,
        category: 'pre_operation',
        order: 3,
        status: 'pending'
      },
      {
        id: 'pre_004',
        title: 'Personnel Competency Check',
        description: 'Verificar competência da equipe DP',
        type: 'multiselect',
        required: true,
        category: 'pre_operation',
        order: 4,
        status: 'pending',
        options: ['DPO Certificado', 'Bridge Team Treinado', 'Engenheiro Qualificado', 'Backup DPO']
      },

      // Power Systems
      {
        id: 'pwr_001',
        title: 'Main Generator Status',
        description: 'Status dos geradores principais',
        type: 'multiselect',
        required: true,
        category: 'power_systems',
        order: 1,
        status: 'pending',
        options: ['Gerador 1 OK', 'Gerador 2 OK', 'Gerador 3 OK', 'Load Sharing OK']
      },
      {
        id: 'pwr_002',
        title: 'Emergency Generator Test',
        description: 'Teste do gerador de emergência',
        type: 'boolean',
        required: true,
        category: 'power_systems',
        order: 2,
        status: 'pending'
      },
      {
        id: 'pwr_003',
        title: 'UPS System Status',
        description: 'Status do sistema UPS',
        type: 'select',
        required: true,
        category: 'power_systems',
        order: 3,
        status: 'pending',
        options: ['Normal', 'Battery Mode', 'Fault', 'Not Available']
      },
      {
        id: 'pwr_004',
        title: 'Power Management System',
        description: 'Verificação do sistema de gerenciamento de energia',
        type: 'boolean',
        required: true,
        category: 'power_systems',
        order: 4,
        status: 'pending'
      },

      // Positioning Systems
      {
        id: 'pos_001',
        title: 'GPS Primary System',
        description: 'Sistema GPS primário',
        type: 'select',
        required: true,
        category: 'positioning_systems',
        order: 1,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed', 'Not Available']
      },
      {
        id: 'pos_002',
        title: 'GPS Secondary System',
        description: 'Sistema GPS secundário/backup',
        type: 'select',
        required: true,
        category: 'positioning_systems',
        order: 2,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed', 'Not Available']
      },
      {
        id: 'pos_003',
        title: 'DGPS/RTK System',
        description: 'Sistema DGPS ou RTK',
        type: 'select',
        required: false,
        category: 'positioning_systems',
        order: 3,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed', 'Not Available']
      },
      {
        id: 'pos_004',
        title: 'Taut Wire System',
        description: 'Sistema de cabo tenso',
        type: 'select',
        required: false,
        category: 'positioning_systems',
        order: 4,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed', 'Not Available']
      },

      // Thrusters
      {
        id: 'thr_001',
        title: 'Main Thrusters Status',
        description: 'Status dos propulsores principais',
        type: 'multiselect',
        required: true,
        category: 'thrusters',
        order: 1,
        status: 'pending',
        options: ['Port Main OK', 'Starboard Main OK', 'Azimuth Control OK', 'RPM Control OK']
      },
      {
        id: 'thr_002',
        title: 'Bow Thrusters Status',
        description: 'Status dos propulsores de proa',
        type: 'multiselect',
        required: true,
        category: 'thrusters',
        order: 2,
        status: 'pending',
        options: ['Bow Thruster 1 OK', 'Bow Thruster 2 OK', 'Tunnel Clear', 'Control OK']
      },
      {
        id: 'thr_003',
        title: 'Stern Thrusters Status',
        description: 'Status dos propulsores de popa',
        type: 'multiselect',
        required: true,
        category: 'thrusters',
        order: 3,
        status: 'pending',
        options: ['Stern Thruster 1 OK', 'Stern Thruster 2 OK', 'Tunnel Clear', 'Control OK']
      },
      {
        id: 'thr_004',
        title: 'Thruster Performance Test',
        description: 'Teste de performance dos propulsores',
        type: 'boolean',
        required: true,
        category: 'thrusters',
        order: 4,
        status: 'pending'
      },

      // Control Systems
      {
        id: 'ctrl_001',
        title: 'DP Control System Primary',
        description: 'Sistema de controle DP primário',
        type: 'select',
        required: true,
        category: 'control_systems',
        order: 1,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed']
      },
      {
        id: 'ctrl_002',
        title: 'DP Control System Secondary',
        description: 'Sistema de controle DP secundário',
        type: 'select',
        required: true,
        category: 'control_systems',
        order: 2,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed']
      },
      {
        id: 'ctrl_003',
        title: 'Joystick Control Test',
        description: 'Teste dos controles joystick',
        type: 'boolean',
        required: true,
        category: 'control_systems',
        order: 3,
        status: 'pending'
      },
      {
        id: 'ctrl_004',
        title: 'Auto DP Mode Test',
        description: 'Teste do modo automático DP',
        type: 'boolean',
        required: true,
        category: 'control_systems',
        order: 4,
        status: 'pending'
      },

      // Sensors
      {
        id: 'sens_001',
        title: 'Gyro Compass Primary',
        description: 'Girocompasso primário',
        type: 'measurement',
        required: true,
        category: 'sensors',
        order: 1,
        status: 'pending',
        unit: '°',
        validationRules: [
          {
            type: 'range',
            value: { min: 0, max: 360 },
            message: 'Valor deve estar entre 0 e 360 graus',
            severity: 'error'
          }
        ]
      },
      {
        id: 'sens_002',
        title: 'Gyro Compass Secondary',
        description: 'Girocompasso secundário',
        type: 'measurement',
        required: true,
        category: 'sensors',
        order: 2,
        status: 'pending',
        unit: '°'
      },
      {
        id: 'sens_003',
        title: 'Wind Sensor',
        description: 'Sensor de vento',
        type: 'multiselect',
        required: true,
        category: 'sensors',
        order: 3,
        status: 'pending',
        options: ['Speed Accurate', 'Direction Accurate', 'No Obstruction', 'Calibrated']
      },
      {
        id: 'sens_004',
        title: 'Motion Reference Unit',
        description: 'Unidade de referência de movimento (MRU)',
        type: 'select',
        required: true,
        category: 'sensors',
        order: 4,
        status: 'pending',
        options: ['Operational', 'Degraded', 'Failed', 'Not Available']
      },

      // Environmental
      {
        id: 'env_001',
        title: 'Current Speed',
        description: 'Velocidade da corrente',
        type: 'measurement',
        required: true,
        category: 'environmental',
        order: 1,
        status: 'pending',
        unit: 'kts',
        validationRules: [
          {
            type: 'range',
            value: { min: 0, max: 10 },
            message: 'Velocidade deve estar entre 0 e 10 nós',
            severity: 'warning'
          }
        ]
      },
      {
        id: 'env_002',
        title: 'Current Direction',
        description: 'Direção da corrente',
        type: 'measurement',
        required: true,
        category: 'environmental',
        order: 2,
        status: 'pending',
        unit: '°'
      },
      {
        id: 'env_003',
        title: 'Wind Speed',
        description: 'Velocidade do vento',
        type: 'measurement',
        required: true,
        category: 'environmental',
        order: 3,
        status: 'pending',
        unit: 'kts',
        iotSensorId: 'WIND_SENSOR_001'
      },
      {
        id: 'env_004',
        title: 'Wind Direction',
        description: 'Direção do vento',
        type: 'measurement',
        required: true,
        category: 'environmental',
        order: 4,
        status: 'pending',
        unit: '°',
        iotSensorId: 'WIND_SENSOR_001'
      },
      {
        id: 'env_005',
        title: 'Wave Height',
        description: 'Altura significativa das ondas',
        type: 'measurement',
        required: true,
        category: 'environmental',
        order: 5,
        status: 'pending',
        unit: 'm',
        validationRules: [
          {
            type: 'range',
            value: { min: 0, max: 15 },
            message: 'Altura das ondas fora do limite operacional',
            severity: 'warning'
          }
        ]
      },

      // Final Verification
      {
        id: 'final_001',
        title: 'All Systems Ready',
        description: 'Todos os sistemas prontos para operação DP',
        type: 'boolean',
        required: true,
        category: 'final_verification',
        order: 1,
        status: 'pending',
        dependencies: ['pre_001', 'pwr_001', 'pos_001', 'thr_001', 'ctrl_001']
      },
      {
        id: 'final_002',
        title: 'DP Operation Authorization',
        description: 'Autorização para início da operação DP',
        type: 'signature',
        required: true,
        category: 'final_verification',
        order: 2,
        status: 'pending'
      },
      {
        id: 'final_003',
        title: 'Risk Assessment Complete',
        description: 'Avaliação de riscos concluída',
        type: 'boolean',
        required: true,
        category: 'final_verification',
        order: 3,
        status: 'pending'
      },
      {
        id: 'final_004',
        title: 'Emergency Procedures Review',
        description: 'Revisão dos procedimentos de emergência',
        type: 'boolean',
        required: true,
        category: 'final_verification',
        order: 4,
        status: 'pending'
      }
    ];
  };

  const getCurrentSectionItems = () => {
    const currentSectionId = sections[currentSection].id;
    return checklist.items
      .filter(item => item.category === currentSectionId)
      .sort((a, b) => a.order - b.order);
  };

  const getCompletionProgress = () => {
    const totalItems = checklist.items.length;
    const completedItems = checklist.items.filter(item => 
      item.status === 'completed' || item.status === 'failed' || item.status === 'na'
    ).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getSectionProgress = (sectionId: string) => {
    const sectionItems = checklist.items.filter(item => item.category === sectionId);
    const completedItems = sectionItems.filter(item => 
      item.status === 'completed' || item.status === 'failed' || item.status === 'na'
    ).length;
    return sectionItems.length > 0 ? (completedItems / sectionItems.length) * 100 : 0;
  };

  const handleItemValueChange = useCallback((itemId: string, value: any) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              value, 
              timestamp: new Date().toISOString(),
              inspector: prev.inspector.name,
              status: value !== undefined && value !== null && value !== '' ? 'completed' : 'pending'
            } 
          : item
      ),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleItemNotesChange = useCallback((itemId: string, notes: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, notes } : item
      ),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleItemStatusChange = useCallback((itemId: string, status: ChecklistItem['status']) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status,
              timestamp: new Date().toISOString(),
              inspector: prev.inspector.name
            } 
          : item
      ),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleAutoSave = async () => {
    try {
      await onSave(checklist);
      setLastSaved(new Date());
      toast({
        title: "Auto-save",
        description: "Checklist salvo automaticamente",
        duration: 2000
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSaveChecklist = async () => {
    try {
      await onSave(checklist);
      setLastSaved(new Date());
      toast({
        title: "Salvo com sucesso",
        description: "Checklist salvo com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o checklist",
        variant: "destructive"
      });
    }
  };

  const handleSubmitChecklist = async () => {
    const errors = validateChecklist();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validação falhou",
        description: `${errors.length} erro(s) encontrado(s)`,
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedChecklist = {
        ...checklist,
        status: 'pending_review' as const,
        completedAt: new Date().toISOString(),
        complianceScore: calculateComplianceScore()
      };
      
      await onSubmit(updatedChecklist);
      toast({
        title: "Enviado para revisão",
        description: "Checklist enviado para revisão com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o checklist",
        variant: "destructive"
      });
    }
  };

  const validateChecklist = (): string[] => {
    const errors: string[] = [];
    
    checklist.items.forEach(item => {
      if (item.required && (item.value === undefined || item.value === null || item.value === '')) {
        errors.push(`${item.title} é obrigatório`);
      }
      
      if (item.validationRules) {
        item.validationRules.forEach(rule => {
          if (rule.type === 'range' && typeof item.value === 'number') {
            const { min, max } = rule.value;
            if (item.value < min || item.value > max) {
              errors.push(`${item.title}: ${rule.message}`);
            }
          }
        });
      }
      
      if (item.dependencies) {
        const incompleteDependencies = item.dependencies.filter(depId => {
          const depItem = checklist.items.find(i => i.id === depId);
          return !depItem || depItem.status !== 'completed';
        });
        
        if (incompleteDependencies.length > 0) {
          errors.push(`${item.title} depende de outros itens não concluídos`);
        }
      }
    });
    
    return errors;
  };

  const calculateComplianceScore = (): number => {
    const totalItems = checklist.items.filter(item => item.required).length;
    const completedItems = checklist.items.filter(item => 
      item.required && item.status === 'completed'
    ).length;
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const handleAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    try {
      // TODO: Implement AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
      
      toast({
        title: "Análise IA concluída",
        description: "Verifique as sugestões na aba de análise"
      });
    } catch (error) {
      toast({
        title: "Erro na análise IA",
        description: "Não foi possível executar a análise",
        variant: "destructive"
      });
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleEvidenceUpload = async (itemId: string, files: FileList) => {
    try {
      // TODO: Implement file upload to Supabase Storage
      const evidence: Evidence[] = Array.from(files).map((file, index) => ({
        id: `${itemId}_evidence_${Date.now()}_${index}`,
        type: file.type.startsWith('image/') ? 'photo' : 'document',
        url: URL.createObjectURL(file), // Temporary URL
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        verified: false
      }));

      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId 
            ? { ...item, evidence: [...(item.evidence || []), ...evidence] }
            : item
        )
      }));

      toast({
        title: "Evidência anexada",
        description: `${files.length} arquivo(s) anexado(s) com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível anexar a evidência",
        variant: "destructive"
      });
    }
  };

  const renderItemInput = (item: ChecklistItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={item.value === true}
              onCheckedChange={(checked) => handleItemValueChange(item.id, checked)}
              disabled={readOnly}
            />
            <Label htmlFor={item.id} className="text-sm">
              Conforme
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={item.value || ''}
            onValueChange={(value) => handleItemValueChange(item.id, value)}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {item.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${item.id}_${option}`}
                  checked={Array.isArray(item.value) && item.value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(item.value) ? item.value : [];
                    if (checked) {
                      handleItemValueChange(item.id, [...currentValues, option]);
                    } else {
                      handleItemValueChange(item.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  disabled={readOnly}
                />
                <Label htmlFor={`${item.id}_${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'number':
      case 'measurement':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={item.value || ''}
              onChange={(e) => handleItemValueChange(item.id, parseFloat(e.target.value) || 0)}
              placeholder={`Valor${item.unit ? ` (${item.unit})` : ''}`}
              disabled={readOnly}
              min={item.minValue}
              max={item.maxValue}
            />
            {item.unit && (
              <Badge variant="outline" className="self-center">
                {item.unit}
              </Badge>
            )}
            {item.iotSensorId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Fetch IoT sensor data
                  toast({
                    title: "Dados do sensor",
                    description: "Dados atualizados do sensor IoT"
                  });
                }}
                disabled={readOnly}
              >
                <Zap className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={item.value || ''}
            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
            placeholder="Digite sua resposta..."
            disabled={readOnly}
          />
        );

      case 'signature':
        return (
          <div className="space-y-2">
            <Input
              value={item.value || ''}
              onChange={(e) => handleItemValueChange(item.id, e.target.value)}
              placeholder="Nome completo para assinatura"
              disabled={readOnly}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement digital signature
                handleItemValueChange(item.id, `${checklist.inspector.name} - ${new Date().toISOString()}`);
              }}
              disabled={readOnly}
            >
              <Edit className="w-3 h-3 mr-1" />
              Assinar Digitalmente
            </Button>
          </div>
        );

      default:
        return (
          <Input
            value={item.value || ''}
            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
            disabled={readOnly}
          />
        );
    }
  };

  const getItemStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'failed': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'na': return 'bg-muted/20 text-muted-foreground border-muted/30';
      case 'review_required': return 'bg-warning/20 text-warning border-warning/30';
      case 'pending': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const progress = getCompletionProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {checklist.title}
            </h1>
            <p className="text-muted-foreground">
              {checklist.vessel.name} • {checklist.inspector.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {checklist.status}
          </Badge>
          {!readOnly && (
            <>
              <Button variant="outline" onClick={handleAIAnalysis} disabled={isAIAnalyzing}>
                <Brain className="w-4 h-4 mr-2" />
                {isAIAnalyzing ? 'Analisando...' : 'Análise IA'}
              </Button>
              <Button variant="outline" onClick={handleSaveChecklist}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleSubmitChecklist}>
                <Send className="w-4 h-4 mr-2" />
                Enviar para Revisão
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Progresso Geral</h3>
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total de Itens</p>
                <p className="font-semibold">{checklist.items.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Concluídos</p>
                <p className="font-semibold text-success">
                  {checklist.items.filter(i => i.status === 'completed').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendentes</p>
                <p className="font-semibold text-warning">
                  {checklist.items.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Auto-save</p>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                    disabled={readOnly}
                  />
                  <span className="text-xs text-muted-foreground">
                    {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Erros de validação encontrados:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Section Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {sections.map((section, index) => {
              const sectionProgress = getSectionProgress(section.id);
              return (
                <Button
                  key={section.id}
                  variant={currentSection === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  {section.icon}
                  <span className="text-xs text-center leading-tight">
                    {section.title}
                  </span>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${sectionProgress}%` }}
                    />
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Section Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {sections[currentSection].icon}
            <div>
              <CardTitle>{sections[currentSection].title}</CardTitle>
              <CardDescription>{sections[currentSection].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {getCurrentSectionItems().map((item) => (
            <div key={item.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    {item.required && (
                      <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                    )}
                    {item.qrCode && (
                      <Button variant="outline" size="sm">
                        <QrCode className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    {renderItemInput(item)}
                    
                    <Textarea
                      value={item.notes || ''}
                      onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                      placeholder="Observações adicionais..."
                      className="min-h-[60px]"
                      disabled={readOnly}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Select
                    value={item.status}
                    onValueChange={(value: ChecklistItem['status']) => 
                      handleItemStatusChange(item.id, value)
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="na">N/A</SelectItem>
                      <SelectItem value="review_required">Requer Revisão</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Badge variant="outline" className={getItemStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setIsEvidenceDialogOpen(true);
                      }}
                      disabled={readOnly}
                    >
                      <Camera className="w-3 h-3" />
                      <span className="ml-1">{item.evidence?.length || 0}</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              {item.evidence && item.evidence.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.evidence.map((evidence) => (
                    <Badge key={evidence.id} variant="secondary" className="text-xs">
                      {evidence.type === 'photo' ? '📷' : '📄'} {evidence.filename}
                    </Badge>
                  ))}
                </div>
              )}
              
              {item.aiSuggestion && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sugestão IA:</strong> {item.aiSuggestion}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Evidence Upload Dialog */}
      <Dialog open={isEvidenceDialogOpen} onOpenChange={setIsEvidenceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anexar Evidências</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files) {
                    handleEvidenceUpload(selectedItemId, e.target.files);
                  }
                }}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar fotos, vídeos ou documentos
                </p>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          ← Seção Anterior
        </Button>
        <Button
          onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
          disabled={currentSection === sections.length - 1}
        >
          Próxima Seção →
        </Button>
      </div>
    </div>
  );
};