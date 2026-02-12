/**
 * HR Benefits Manager Component
 * Gestão de Benefícios Flexíveis com IA
 * MIGRATED: Uses real Supabase data with fallback
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  Utensils, 
  Bus, 
  Heart, 
  GraduationCap,
  Dumbbell,
  Sparkles,
  Brain,
  Wallet,
  TrendingUp,
  Gift,
  Settings,
  Database
} from "lucide-react";
import { useHRBenefits } from "@/hooks/useHRRealData";

const getIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'alimentação': return <Utensils className="h-5 w-5" />;
    case 'mobilidade': return <Bus className="h-5 w-5" />;
    case 'saúde': return <Heart className="h-5 w-5" />;
    case 'desenvolvimento': return <GraduationCap className="h-5 w-5" />;
    case 'bem-estar': return <Dumbbell className="h-5 w-5" />;
    default: return <CreditCard className="h-5 w-5" />;
  }
};

const flexDistribution = [
  { name: "Vale Refeição", value: 40, color: "bg-warning" },
  { name: "Vale Alimentação", value: 25, color: "bg-success" },
  { name: "Wellhub", value: 15, color: "bg-accent" },
  { name: "Educação", value: 20, color: "bg-info" },
];

export function HRBenefitsManager() {
  const { data: benefits = [], isLoading } = useHRBenefits();
  const [activeTab, setActiveTab] = useState("overview");
  const [flexValues, setFlexValues] = useState({
    vr: 40,
    va: 25,
    gym: 15,
    edu: 20,
  });

  const totalBenefits = benefits.reduce((sum, b) => sum + b.monthly_value, 0);
  const totalBalance = benefits.reduce((sum, b) => sum + b.current_balance, 0);
  const flexCount = benefits.filter(b => b.is_flex).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meus Benefícios</h2>
          <p className="text-muted-foreground">Gerencie e personalize seus benefícios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            2ª Via Cartão
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configurar Flex
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalBenefits.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Em benefícios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {totalBalance.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">Para usar este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefícios Flex</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">4</div>
            <p className="text-xs text-muted-foreground">Personalizáveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 320</div>
            <p className="text-xs text-muted-foreground">Desconto em folha</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="flex">Benefícios Flex</TabsTrigger>
          <TabsTrigger value="statements">Extratos</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* AI Recommendation */}
           <Card className="bg-gradient-to-r from-accent/10 to-info/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Brain className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Recomendação da IA</h3>
                  <p className="text-sm text-muted-foreground">Baseada no seu perfil de uso</p>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                  <span className="font-medium text-sm">Sugestão de Otimização</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você não está utilizando o Wellhub. Considere ativar e transferir 10% do VA para academia - 
                  colaboradores que usam benefícios de bem-estar têm 23% menos faltas.
                </p>
                <Button size="sm" className="mt-2">
                  Aplicar Sugestão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(benefit => (
              <Card key={benefit.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getIcon(benefit.category)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{benefit.name}</CardTitle>
                        <CardDescription>{benefit.category}</CardDescription>
                      </div>
                    </div>
                    {benefit.is_flex && (
                      <Badge variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Flex
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Valor Mensal</span>
                      <span className="font-medium">R$ {benefit.monthly_value.toLocaleString("pt-BR")}</span>
                    </div>
                    {benefit.current_balance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Saldo</span>
                        <span className="font-medium text-success">
                          R$ {benefit.current_balance.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>

                  {benefit.usage_percent > 0 && benefit.usage_percent < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uso este mês</span>
                        <span>{benefit.usage_percent}%</span>
                      </div>
                      <Progress value={benefit.usage_percent} className="h-2" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Extrato
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flex" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Benefícios Flex</CardTitle>
              <CardDescription>
                Personalize como você quer distribuir R$ 1.980 em benefícios flexíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Distribution */}
              <div className="h-4 rounded-full overflow-hidden flex">
                {flexDistribution.map((item, i) => (
                  <div 
                    key={item.name}
                    className={`${item.color} transition-all`}
                    style={{ width: `${item.value}%` }}
                  />
                ))}
              </div>
              
              <div className="grid gap-2 grid-cols-4">
                {flexDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Sliders */}
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      <span className="font-medium">Vale Refeição</span>
                    </div>
                    <span className="font-bold">R$ {(1980 * flexValues.vr / 100).toFixed(0)}</span>
                  </div>
                  <Slider
                    value={[flexValues.vr]}
                    onValueChange={([value]) => setFlexValues(prev => ({ ...prev, vr: value }))}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Vale Alimentação</span>
                    </div>
                    <span className="font-bold">R$ {(1980 * flexValues.va / 100).toFixed(0)}</span>
                  </div>
                  <Slider
                    value={[flexValues.va]}
                    onValueChange={([value]) => setFlexValues(prev => ({ ...prev, va: value }))}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      <span className="font-medium">Wellhub</span>
                    </div>
                    <span className="font-bold">R$ {(1980 * flexValues.gym / 100).toFixed(0)}</span>
                  </div>
                  <Slider
                    value={[flexValues.gym]}
                    onValueChange={([value]) => setFlexValues(prev => ({ ...prev, gym: value }))}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">Educação</span>
                    </div>
                    <span className="font-bold">R$ {(1980 * flexValues.edu / 100).toFixed(0)}</span>
                  </div>
                  <Slider
                    value={[flexValues.edu]}
                    onValueChange={([value]) => setFlexValues(prev => ({ ...prev, edu: value }))}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Total Distribuído</p>
                  <p className="text-sm text-muted-foreground">
                    {flexValues.vr + flexValues.va + flexValues.gym + flexValues.edu}% de 100%
                  </p>
                </div>
                <Button 
                  disabled={flexValues.vr + flexValues.va + flexValues.gym + flexValues.edu !== 100}
                >
                  Salvar Distribuição
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extrato de Benefícios</CardTitle>
              <CardDescription>Últimas transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "08/01", desc: "iFood - Almoço", value: -42.90, benefit: "VR", icon: <Utensils className="h-4 w-4" /> },
                  { date: "07/01", desc: "Extra Supermercados", value: -156.40, benefit: "VA", icon: <CreditCard className="h-4 w-4" /> },
                  { date: "06/01", desc: "Uber", value: -28.50, benefit: "VT", icon: <Bus className="h-4 w-4" /> },
                  { date: "05/01", desc: "Smart Fit - Mensalidade", value: -99.90, benefit: "Wellhub", icon: <Dumbbell className="h-4 w-4" /> },
                  { date: "01/01", desc: "Crédito Mensal", value: 1980.00, benefit: "Flex", icon: <Gift className="h-4 w-4" /> },
                ].map((tx) => (
                  <div key={tx.desc} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-medium">{tx.desc}</p>
                        <p className="text-sm text-muted-foreground">{tx.date} • {tx.benefit}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.value > 0 ? "text-success" : ""}`}>
                      {tx.value > 0 ? "+" : ""}R$ {Math.abs(tx.value).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Alura", desc: "Cursos de tecnologia", discount: "30%", category: "Educação" },
              { name: "Smart Fit", desc: "Academia", discount: "50%", category: "Bem-estar" },
              { name: "Zenklub", desc: "Terapia online", discount: "40%", category: "Saúde Mental" },
              { name: "Coursera", desc: "Cursos universitários", discount: "25%", category: "Educação" },
              { name: "99", desc: "Corridas", discount: "15%", category: "Mobilidade" },
              { name: "Netflix", desc: "Streaming", discount: "20%", category: "Lazer" },
            ].map((partner, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{partner.name}</CardTitle>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      -{partner.discount}
                    </Badge>
                  </div>
                  <CardDescription>{partner.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{partner.category}</Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Resgatar</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
