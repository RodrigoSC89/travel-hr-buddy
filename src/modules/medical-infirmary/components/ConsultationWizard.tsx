/**
 * Consultation Wizard - Step-by-step medical consultation
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  User, Stethoscope, Activity, Pill, Brain, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, AlertTriangle, Heart,
  Thermometer, Wind, Droplets
} from 'lucide-react';
import { useCrewMembers } from '../hooks/useMedicalData';
import { useCreateConsultation, VitalSigns, PrescribedMedication } from '../hooks/useMedicalConsultations';
import { useMedicalAI } from '../hooks/useMedicalAI';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 1, title: 'Paciente', icon: User },
  { id: 2, title: 'Sintomas', icon: Stethoscope },
  { id: 3, title: 'Sinais Vitais', icon: Activity },
  { id: 4, title: 'Análise IA', icon: Brain },
  { id: 5, title: 'Tratamento', icon: Pill },
];

export function ConsultationWizard({ open, onOpenChange }: ConsultationWizardProps) {
  const { data: crewMembers = [] } = useCrewMembers();
  const createConsultation = useCreateConsultation();
  const { analyzeSymptoms, isLoading: aiLoading } = useMedicalAI();

  const [currentStep, setCurrentStep] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI analysis result has dynamic shape
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const [formData, setFormData] = useState({
    crewMemberId: '',
    crewMemberName: '',
    consultationType: 'consultation' as const,
    chiefComplaint: '',
    symptoms: [] as string[],
    symptomInput: '',
    vitalSigns: {
      blood_pressure: '',
      heart_rate: undefined as number | undefined,
      temperature: undefined as number | undefined,
      oxygen_saturation: undefined as number | undefined,
      respiratory_rate: undefined as number | undefined
    } as VitalSigns,
    severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
    diagnosis: '',
    treatment: '',
    prescribedMedications: [] as PrescribedMedication[],
    notes: '',
    followUpDate: ''
  });

  const handleCrewSelect = (crewId: string) => {
    const crew = crewMembers.find(c => c.id === crewId);
    setFormData(prev => ({
      ...prev,
      crewMemberId: crewId,
      crewMemberName: crew?.name || ''
    }));
  };

  const addSymptom = () => {
    if (formData.symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, prev.symptomInput.trim()],
        symptomInput: ''
      }));
    }
  };

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const runAIAnalysis = async () => {
    const crew = crewMembers.find(c => c.id === formData.crewMemberId);
    const result = await analyzeSymptoms(formData.symptoms, crew);
    if (result) {
      setAiAnalysis(result);
      // Auto-set severity based on AI analysis
      setFormData(prev => ({
        ...prev,
        severity: result.urgency as any
      }));
    }
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    await createConsultation.mutateAsync({
      crew_member_id: formData.crewMemberId,
      crew_member_name: formData.crewMemberName,
      consultation_type: formData.consultationType,
      chief_complaint: formData.chiefComplaint,
      symptoms: formData.symptoms,
      vital_signs: formData.vitalSigns,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      prescribed_medications: formData.prescribedMedications,
      ai_suggestions: aiAnalysis?.recommendations || [],
      follow_up_date: formData.followUpDate || undefined,
      status: 'in_progress',
      severity: formData.severity,
      notes: formData.notes
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setAiAnalysis(null);
    setFormData({
      crewMemberId: '',
      crewMemberName: '',
      consultationType: 'consultation',
      chiefComplaint: '',
      symptoms: [],
      symptomInput: '',
      vitalSigns: {},
      severity: 'low',
      diagnosis: '',
      treatment: '',
      prescribedMedications: [],
      notes: '',
      followUpDate: ''
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.crewMemberName && formData.consultationType;
      case 2: return formData.chiefComplaint && formData.symptoms.length > 0;
      case 3: return true; // Vital signs optional
      case 4: return true; // AI analysis optional
      case 5: return formData.diagnosis || formData.treatment;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Novo Atendimento Médico
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-0.5 mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-1" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Step 1: Patient Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Identificação do Paciente</h3>
                
                <div className="space-y-2">
                  <Label>Tripulante</Label>
                  <Select value={formData.crewMemberId} onValueChange={handleCrewSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tripulante" />
                    </SelectTrigger>
                    <SelectContent>
                      {crewMembers.map(crew => (
                        <SelectItem key={crew.id} value={crew.id}>
                          {crew.name} - {crew.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ou digite o nome (visitante/externo)</Label>
                  <Input
                    value={formData.crewMemberName}
                    onChange={(e) => setFormData(prev => ({ ...prev, crewMemberName: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Atendimento</Label>
                  <Select 
                    value={formData.consultationType} 
                    onValueChange={(v: string) => setFormData(prev => ({ ...prev, consultationType: v as typeof prev.consultationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="emergency">🚨 Emergência</SelectItem>
                      <SelectItem value="routine">Rotina / Checkup</SelectItem>
                      <SelectItem value="first_aid">Primeiros Socorros</SelectItem>
                      <SelectItem value="telemedicine">Telemedicina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Symptoms */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Queixa e Sintomas</h3>
                
                <div className="space-y-2">
                  <Label>Queixa Principal</Label>
                  <Textarea
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    placeholder="Descreva a queixa principal do paciente..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sintomas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.symptomInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, symptomInput: e.target.value }))}
                      placeholder="Digite um sintoma e pressione Enter"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                    />
                    <Button type="button" onClick={addSymptom}>Adicionar</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.symptoms.map((symptom, symptomIdx) => (
                      <Badge key={symptom} variant="secondary" className="gap-1">
                        {symptom}
                        <button onClick={() => removeSymptom(symptomIdx)} className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick symptom suggestions */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Sintomas comuns (clique para adicionar)</Label>
                  <div className="flex flex-wrap gap-1">
                    {['Dor de cabeça', 'Febre', 'Náusea', 'Tontura', 'Dor muscular', 'Tosse', 'Fadiga', 'Dor abdominal'].map(s => (
                      <Badge 
                        key={s} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => !formData.symptoms.includes(s) && setFormData(prev => ({ ...prev, symptoms: [...prev.symptoms, s] }))}
                      >
                        + {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vital Signs */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Sinais Vitais (opcional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Heart className="h-8 w-8 text-destructive" />
                      <div className="flex-1">
                        <Label className="text-xs">Pressão Arterial</Label>
                        <Input
                          value={formData.vitalSigns.blood_pressure || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            vitalSigns: { ...prev.vitalSigns, blood_pressure: e.target.value } 
                          }))}
                          placeholder="120/80 mmHg"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Activity className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <Label className="text-xs">Freq. Cardíaca</Label>
                        <Input
                          type="number"
                          value={formData.vitalSigns.heart_rate || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            vitalSigns: { ...prev.vitalSigns, heart_rate: parseInt(e.target.value) || undefined } 
                          }))}
                          placeholder="72 bpm"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Thermometer className="h-8 w-8 text-warning" />
                      <div className="flex-1">
                        <Label className="text-xs">Temperatura</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.vitalSigns.temperature || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            vitalSigns: { ...prev.vitalSigns, temperature: parseFloat(e.target.value) || undefined } 
                          }))}
                          placeholder="36.5 °C"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Droplets className="h-8 w-8 text-info" />
                      <div className="flex-1">
                        <Label className="text-xs">Saturação O₂</Label>
                        <Input
                          type="number"
                          value={formData.vitalSigns.oxygen_saturation || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            vitalSigns: { ...prev.vitalSigns, oxygen_saturation: parseInt(e.target.value) || undefined } 
                          }))}
                          placeholder="98%"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Wind className="h-8 w-8 text-accent" />
                      <div className="flex-1">
                        <Label className="text-xs">Freq. Respiratória</Label>
                        <Input
                          type="number"
                          value={formData.vitalSigns.respiratory_rate || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            vitalSigns: { ...prev.vitalSigns, respiratory_rate: parseInt(e.target.value) || undefined } 
                          }))}
                          placeholder="16 rpm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 4: AI Analysis */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Análise por Inteligência Artificial
                </h3>

                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Analisando sintomas...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <Card className={`border-l-4 ${
                    aiAnalysis.urgency === 'critical' ? 'border-l-destructive bg-destructive/5' :
                      aiAnalysis.urgency === 'high' ? 'border-l-warning bg-warning/5' :
                      aiAnalysis.urgency === 'medium' ? 'border-l-warning bg-warning/5' :
                      'border-l-success bg-success/5'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            aiAnalysis.urgency === 'critical' ? 'text-destructive' :
                            aiAnalysis.urgency === 'high' ? 'text-warning' :
                            aiAnalysis.urgency === 'medium' ? 'text-warning' :
                            'text-success'
                          }`} />
                          <span className="font-semibold">
                            Urgência: {aiAnalysis.urgency === 'critical' ? 'CRÍTICA' : 
                                      aiAnalysis.urgency === 'high' ? 'ALTA' : 
                                      aiAnalysis.urgency === 'medium' ? 'MÉDIA' : 'BAIXA'}
                          </span>
                        </div>

                        {aiAnalysis.possibleDiagnoses?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Possíveis Diagnósticos:</p>
                            <div className="flex flex-wrap gap-1">
                               {aiAnalysis.possibleDiagnoses.map((d: string) => (
                                <Badge key={d} variant="outline">{d}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiAnalysis.recommendations?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Recomendações:</p>
                            <ul className="text-sm space-y-1">
                              {aiAnalysis.recommendations.map((r: string) => (
                                <li key={r} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Clique para analisar os sintomas com IA</p>
                    <Button onClick={runAIAnalysis} disabled={formData.symptoms.length === 0}>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Sintomas
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Treatment */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Diagnóstico e Tratamento</h3>
                
                <div className="space-y-2">
                  <Label>Diagnóstico</Label>
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Diagnóstico ou hipótese diagnóstica..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tratamento / Conduta</Label>
                  <Textarea
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    placeholder="Descreva o tratamento prescrito..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severidade</Label>
                    <Select 
                      value={formData.severity} 
                      onValueChange={(v: string) => setFormData(prev => ({ ...prev, severity: v as typeof prev.severity }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Retorno (Follow-up)</Label>
                    <Input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações Adicionais</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionais, orientações ao paciente..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onOpenChange(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {currentStep < 5 ? (
            <Button 
              onClick={() => {
                if (currentStep === 3) {
                  runAIAnalysis();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed()}
            >
              {currentStep === 3 ? 'Analisar com IA' : 'Próximo'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={createConsultation.isPending || !canProceed()}
              className="bg-success hover:bg-success/90"
            >
              {createConsultation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Finalizar Atendimento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
