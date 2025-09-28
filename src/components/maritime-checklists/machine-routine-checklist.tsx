import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Cog, 
  Wrench, 
  Gauge, 
  Thermometer,
  Fuel,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  FileText,
  Brain,
  QrCode,
  Zap,
  MapPin,
  Users,
  Save,
  Send,
  Eye,
  Edit,
  Upload,
  Download,
  RefreshCw,
  Droplets,
  Battery,
  Radio,
  Shield
} from 'lucide-react';
import type { Checklist, ChecklistItem } from './checklist-types';

interface MachineRoutineChecklistProps {
  checklist: Checklist;
  onSave: (checklist: Checklist) => void;
  onSubmit: (checklist: Checklist) => void;
  onBack: () => void;
  readOnly?: boolean;
}

export const MachineRoutineChecklist: React.FC<MachineRoutineChecklistProps> = ({
  checklist: initialChecklist,
  onSave,
  onSubmit,
  onBack,
  readOnly = false
}) => {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
  const [currentSection, setCurrentSection] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // Machine Routine specific sections
  const sections = [
    {
      id: 'main_engine',
      title: 'Motor Principal',
      icon: <Cog className="w-5 h-5" />,
      description: 'Verificações do motor principal e sistemas relacionados'
    },
    {
      id: 'auxiliary_engines',
      title: 'Motores Auxiliares',
      icon: <Settings className="w-5 h-5" />,
      description: 'Verificação dos geradores e motores auxiliares'
    },
    {
      id: 'fuel_systems',
      title: 'Sistema de Combustível',
      icon: <Fuel className="w-5 h-5" />,
      description: 'Verificação do sistema de combustível e tanques'
    },
    {
      id: 'lubrication',
      title: 'Sistema de Lubrificação',
      icon: <Droplets className="w-5 h-5" />,
      description: 'Verificação do sistema de óleo lubrificante'
    },
    {
      id: 'cooling_system',
      title: 'Sistema de Resfriamento',
      icon: <Thermometer className="w-5 h-5" />,
      description: 'Verificação do sistema de água de resfriamento'
    },
    {
      id: 'electrical',
      title: 'Sistema Elétrico',
      icon: <Battery className="w-5 h-5" />,
      description: 'Verificação dos sistemas elétricos e baterias'
    },
    {
      id: 'hydraulic',
      title: 'Sistema Hidráulico',
      icon: <Gauge className="w-5 h-5" />,
      description: 'Verificação do sistema hidráulico'
    },
    {
      id: 'safety_systems',
      title: 'Sistemas de Segurança',
      icon: <Shield className="w-5 h-5" />,
      description: 'Verificação dos sistemas de segurança da praça de máquinas'
    }
  ];

  useEffect(() => {
    // Initialize machine routine checklist items if empty
    if (checklist.items.length === 0) {
      setChecklist(prev => ({
        ...prev,
        items: getMachineRoutineItems()
      }));
    }
  }, []);

  useEffect(() => {
    // Auto-save functionality
    if (autoSaveEnabled && !readOnly) {
      const autoSaveTimer = setInterval(() => {
        handleAutoSave();
      }, 30000);

      return () => clearInterval(autoSaveTimer);
    }
  }, [checklist, autoSaveEnabled, readOnly]);

  const getMachineRoutineItems = (): ChecklistItem[] => {
    return [
      // Main Engine
      {
        id: 'me_001',
        title: 'Temperatura da Água de Resfriamento',
        description: 'Verificar temperatura da água de resfriamento do motor principal',
        type: 'measurement',
        required: true,
        category: 'main_engine',
        order: 1,
        status: 'pending',
        unit: '°C',
        minValue: 70,
        maxValue: 85,
        iotSensorId: 'TEMP_MAIN_ENGINE_001',
        validationRules: [
          {
            type: 'range',
            value: { min: 70, max: 85 },
            message: 'Temperatura fora do range operacional normal',
            severity: 'warning'
          }
        ]
      },
      {
        id: 'me_002',
        title: 'Pressão do Óleo Lubrificante',
        description: 'Verificar pressão do óleo lubrificante do motor principal',
        type: 'measurement',
        required: true,
        category: 'main_engine',
        order: 2,
        status: 'pending',
        unit: 'bar',
        minValue: 3.5,
        maxValue: 6.0,
        iotSensorId: 'PRESS_OIL_ME_001'
      },
      {
        id: 'me_003',
        title: 'RPM do Motor',
        description: 'Verificar RPM atual do motor principal',
        type: 'measurement',
        required: true,
        category: 'main_engine',
        order: 3,
        status: 'pending',
        unit: 'RPM',
        iotSensorId: 'RPM_MAIN_ENGINE_001'
      },
      {
        id: 'me_004',
        title: 'Vibração do Motor',
        description: 'Verificar nível de vibração do motor principal',
        type: 'select',
        required: true,
        category: 'main_engine',
        order: 4,
        status: 'pending',
        options: ['Normal', 'Ligeiramente Elevada', 'Elevada', 'Crítica']
      },
      {
        id: 'me_005',
        title: 'Ruído Anormal',
        description: 'Verificar presença de ruídos anormais no motor',
        type: 'boolean',
        required: true,
        category: 'main_engine',
        order: 5,
        status: 'pending'
      },

      // Auxiliary Engines
      {
        id: 'aux_001',
        title: 'Gerador 1 - Status',
        description: 'Verificar status operacional do gerador 1',
        type: 'select',
        required: true,
        category: 'auxiliary_engines',
        order: 1,
        status: 'pending',
        options: ['Operacional', 'Standby', 'Manutenção', 'Falha']
      },
      {
        id: 'aux_002',
        title: 'Gerador 1 - Voltagem',
        description: 'Verificar voltagem de saída do gerador 1',
        type: 'measurement',
        required: true,
        category: 'auxiliary_engines',
        order: 2,
        status: 'pending',
        unit: 'V',
        minValue: 380,
        maxValue: 420,
        iotSensorId: 'VOLT_GEN1_001'
      },
      {
        id: 'aux_003',
        title: 'Gerador 1 - Frequência',
        description: 'Verificar frequência de saída do gerador 1',
        type: 'measurement',
        required: true,
        category: 'auxiliary_engines',
        order: 3,
        status: 'pending',
        unit: 'Hz',
        minValue: 58,
        maxValue: 62,
        iotSensorId: 'FREQ_GEN1_001'
      },
      {
        id: 'aux_004',
        title: 'Gerador 2 - Status',
        description: 'Verificar status operacional do gerador 2',
        type: 'select',
        required: true,
        category: 'auxiliary_engines',
        order: 4,
        status: 'pending',
        options: ['Operacional', 'Standby', 'Manutenção', 'Falha']
      },

      // Fuel Systems
      {
        id: 'fuel_001',
        title: 'Nível Tanque Combustível Principal',
        description: 'Verificar nível do tanque de combustível principal',
        type: 'measurement',
        required: true,
        category: 'fuel_systems',
        order: 1,
        status: 'pending',
        unit: '%',
        minValue: 0,
        maxValue: 100,
        iotSensorId: 'LEVEL_FUEL_MAIN_001'
      },
      {
        id: 'fuel_002',
        title: 'Pressão Sistema Combustível',
        description: 'Verificar pressão no sistema de combustível',
        type: 'measurement',
        required: true,
        category: 'fuel_systems',
        order: 2,
        status: 'pending',
        unit: 'bar',
        minValue: 2.0,
        maxValue: 8.0,
        iotSensorId: 'PRESS_FUEL_001'
      },
      {
        id: 'fuel_003',
        title: 'Filtros de Combustível',
        description: 'Verificar estado dos filtros de combustível',
        type: 'select',
        required: true,
        category: 'fuel_systems',
        order: 3,
        status: 'pending',
        options: ['Limpo', 'Sujo', 'Precisa Troca', 'Trocado']
      },
      {
        id: 'fuel_004',
        title: 'Vazamentos de Combustível',
        description: 'Verificar presença de vazamentos no sistema',
        type: 'boolean',
        required: true,
        category: 'fuel_systems',
        order: 4,
        status: 'pending'
      },

      // Lubrication
      {
        id: 'lub_001',
        title: 'Nível Óleo Motor Principal',
        description: 'Verificar nível do óleo do motor principal',
        type: 'select',
        required: true,
        category: 'lubrication',
        order: 1,
        status: 'pending',
        options: ['Mínimo', 'Normal', 'Máximo', 'Acima do Máximo']
      },
      {
        id: 'lub_002',
        title: 'Temperatura Óleo',
        description: 'Verificar temperatura do óleo lubrificante',
        type: 'measurement',
        required: true,
        category: 'lubrication',
        order: 2,
        status: 'pending',
        unit: '°C',
        minValue: 60,
        maxValue: 90,
        iotSensorId: 'TEMP_OIL_001'
      },
      {
        id: 'lub_003',
        title: 'Filtro de Óleo',
        description: 'Verificar estado do filtro de óleo',
        type: 'select',
        required: true,
        category: 'lubrication',
        order: 3,
        status: 'pending',
        options: ['Novo', 'Bom', 'Regular', 'Precisa Troca']
      },

      // Cooling System
      {
        id: 'cool_001',
        title: 'Nível Água Resfriamento',
        description: 'Verificar nível do tanque de expansão',
        type: 'select',
        required: true,
        category: 'cooling_system',
        order: 1,
        status: 'pending',
        options: ['Baixo', 'Normal', 'Alto']
      },
      {
        id: 'cool_002',
        title: 'Bomba Água Mar',
        description: 'Verificar funcionamento da bomba de água do mar',
        type: 'boolean',
        required: true,
        category: 'cooling_system',
        order: 2,
        status: 'pending'
      },
      {
        id: 'cool_003',
        title: 'Trocador de Calor',
        description: 'Verificar condição do trocador de calor',
        type: 'select',
        required: true,
        category: 'cooling_system',
        order: 3,
        status: 'pending',
        options: ['Limpo', 'Sujo', 'Obstruído', 'Manutenção Necessária']
      },

      // Electrical
      {
        id: 'elec_001',
        title: 'Voltagem Bateria Principal',
        description: 'Verificar voltagem da bateria principal',
        type: 'measurement',
        required: true,
        category: 'electrical',
        order: 1,
        status: 'pending',
        unit: 'V',
        minValue: 22,
        maxValue: 28,
        iotSensorId: 'VOLT_BATTERY_MAIN_001'
      },
      {
        id: 'elec_002',
        title: 'Alternador',
        description: 'Verificar funcionamento do alternador',
        type: 'boolean',
        required: true,
        category: 'electrical',
        order: 2,
        status: 'pending'
      },
      {
        id: 'elec_003',
        title: 'Painel Elétrico',
        description: 'Verificar alarmes no painel elétrico',
        type: 'boolean',
        required: true,
        category: 'electrical',
        order: 3,
        status: 'pending'
      },

      // Hydraulic
      {
        id: 'hyd_001',
        title: 'Pressão Sistema Hidráulico',
        description: 'Verificar pressão do sistema hidráulico',
        type: 'measurement',
        required: true,
        category: 'hydraulic',
        order: 1,
        status: 'pending',
        unit: 'bar',
        minValue: 150,
        maxValue: 200,
        iotSensorId: 'PRESS_HYD_001'
      },
      {
        id: 'hyd_002',
        title: 'Nível Óleo Hidráulico',
        description: 'Verificar nível do reservatório de óleo hidráulico',
        type: 'select',
        required: true,
        category: 'hydraulic',
        order: 2,
        status: 'pending',
        options: ['Baixo', 'Normal', 'Alto']
      },
      {
        id: 'hyd_003',
        title: 'Vazamentos Hidráulicos',
        description: 'Verificar presença de vazamentos hidráulicos',
        type: 'boolean',
        required: true,
        category: 'hydraulic',
        order: 3,
        status: 'pending'
      },

      // Safety Systems
      {
        id: 'safe_001',
        title: 'Sistema Combate Incêndio',
        description: 'Verificar sistema de combate a incêndio da praça de máquinas',
        type: 'boolean',
        required: true,
        category: 'safety_systems',
        order: 1,
        status: 'pending'
      },
      {
        id: 'safe_002',
        title: 'Ventilação Praça Máquinas',
        description: 'Verificar funcionamento da ventilação',
        type: 'boolean',
        required: true,
        category: 'safety_systems',
        order: 2,
        status: 'pending'
      },
      {
        id: 'safe_003',
        title: 'Iluminação Emergência',
        description: 'Verificar funcionamento da iluminação de emergência',
        type: 'boolean',
        required: true,
        category: 'safety_systems',
        order: 3,
        status: 'pending'
      },
      {
        id: 'safe_004',
        title: 'Detectores Fumaça',
        description: 'Verificar funcionamento dos detectores de fumaça',
        type: 'boolean',
        required: true,
        category: 'safety_systems',
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

  const handleItemValueChange = (itemId: string, value: any) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              value, 
              timestamp: new Date().toISOString(),
              inspector: checklist.inspector.name,
              status: value !== undefined && value !== null && value !== '' ? 'completed' : 'pending'
            } 
          : item
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAutoSave = async () => {
    try {
      await onSave(checklist);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
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
              <Cog className="w-6 h-6 text-primary" />
              {checklist.title}
            </h1>
            <p className="text-muted-foreground">
              {checklist.vessel.name} • {checklist.inspector.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="outline" onClick={() => onSave(checklist)}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => onSubmit(checklist)}>
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
              <h3 className="text-lg font-semibold">Progresso da Rotina de Máquinas</h3>
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
                    {item.iotSensorId && (
                      <Button variant="outline" size="sm">
                        <Zap className="w-3 h-3 mr-1" />
                        IoT
                      </Button>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    {/* Render different input types based on item.type */}
                    {item.type === 'measurement' && (
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
                    )}

                    {item.type === 'boolean' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.value === true}
                          onCheckedChange={(checked) => handleItemValueChange(item.id, checked)}
                          disabled={readOnly}
                        />
                        <Label>
                          {item.value === true ? 'Conforme' : 'Não conforme'}
                        </Label>
                      </div>
                    )}

                    {item.type === 'select' && (
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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