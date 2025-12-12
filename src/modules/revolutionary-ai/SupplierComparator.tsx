/**
 * REVOLUTIONARY AI - Supplier Comparator
 * Funcionalidade 14: Comparador de fornecedores com IA
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Building2, Star, TrendingUp, Clock, DollarSign,
  ThumbsUp, ThumbsDown, Brain, Search, Filter,
  CheckCircle, AlertTriangle, Award, Package, Truck
} from "lucide-react";
import { motion } from "framer-motion";

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  scores: {
    price: number;
    quality: number;
    delivery: number;
    reliability: number;
    support: number;
  };
  averageDeliveryDays: number;
  onTimeDelivery: number;
  defectRate: number;
  totalOrders: number;
  priceCompetitiveness: number;
  aiRecommendation: boolean;
  aiReason?: string;
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Marine Parts Global",
    category: "Peças de Motor",
    rating: 4.8,
    scores: { price: 85, quality: 95, delivery: 90, reliability: 92, support: 88 },
    averageDeliveryDays: 5,
    onTimeDelivery: 96,
    defectRate: 0.5,
    totalOrders: 245,
    priceCompetitiveness: 92,
    aiRecommendation: true,
    aiReason: "Melhor equilíbrio entre custo e qualidade. Histórico excelente de entregas."
  },
  {
    id: "2",
    name: "NavalTech Solutions",
    category: "Peças de Motor",
    rating: 4.5,
    scores: { price: 95, quality: 85, delivery: 80, reliability: 85, support: 75 },
    averageDeliveryDays: 7,
    onTimeDelivery: 88,
    defectRate: 1.2,
    totalOrders: 180,
    priceCompetitiveness: 98,
    aiRecommendation: false,
    aiReason: "Preço competitivo mas taxa de defeitos acima da média."
  },
  {
    id: "3",
    name: "Premium Maritime",
    category: "Peças de Motor",
    rating: 4.9,
    scores: { price: 70, quality: 98, delivery: 95, reliability: 98, support: 95 },
    averageDeliveryDays: 3,
    onTimeDelivery: 99,
    defectRate: 0.2,
    totalOrders: 320,
    priceCompetitiveness: 75,
    aiRecommendation: false,
    aiReason: "Qualidade premium mas preço 20% acima da média do mercado."
  },
  {
    id: "4",
    name: "FastShip Marine",
    category: "Peças de Motor",
    rating: 4.2,
    scores: { price: 88, quality: 80, delivery: 95, reliability: 78, support: 70 },
    averageDeliveryDays: 2,
    onTimeDelivery: 94,
    defectRate: 2.1,
    totalOrders: 95,
    priceCompetitiveness: 85,
    aiRecommendation: false,
    aiReason: "Entrega rápida mas menor confiabilidade em pedidos recorrentes."
  }
];

export function SupplierComparator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("aiScore");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const sortedSuppliers = useMemo(() => {
    const sorted = [...MOCK_SUPPLIERS];
    switch (sortBy) {
    case "price":
      sorted.sort((a, b) => b.priceCompetitiveness - a.priceCompetitiveness);
      break;
    case "quality":
      sorted.sort((a, b) => b.scores.quality - a.scores.quality);
      break;
    case "delivery":
      sorted.sort((a, b) => a.averageDeliveryDays - b.averageDeliveryDays);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "aiScore":
    default:
      sorted.sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((acc, v) => acc + v, 0) / 5;
        const scoreB = Object.values(b.scores).reduce((acc, v) => acc + v, 0) / 5;
        return scoreB - scoreA;
      });
    }
    return sorted;
  }, [sortBy]);

  const calculateOverallScore = (supplier: Supplier): number => {
    return Math.round(Object.values(supplier.scores).reduce((acc, v) => acc + v, 0) / 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Comparador de Fornecedores</h2>
                <p className="text-muted-foreground">
                  IA avalia preço, qualidade, entrega e histórico de performance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              {[
                { key: "aiScore", label: "Score IA" },
                { key: "price", label: "Preço" },
                { key: "quality", label: "Qualidade" },
                { key: "delivery", label: "Entrega" },
                { key: "rating", label: "Avaliação" }
              ].map(option => (
                <Button
                  key={option.key}
                  variant={sortBy === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-2 space-y-4">
          {sortedSuppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  selectedSupplier?.id === supplier.id ? "border-primary ring-2 ring-primary/20" : ""
                } ${supplier.aiRecommendation ? "bg-gradient-to-r from-primary/5 to-transparent" : ""}`}
                onClick={() => setSelectedSupplier(supplier)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${supplier.aiRecommendation ? "bg-primary/20" : "bg-muted"}`}>
                        <Building2 className={`h-6 w-6 ${supplier.aiRecommendation ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          {supplier.aiRecommendation && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Brain className="h-3 w-3 mr-1" />
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xl font-bold">{supplier.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{supplier.totalOrders} pedidos</p>
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {[
                      { key: "price", label: "Preço", icon: DollarSign },
                      { key: "quality", label: "Qualidade", icon: Award },
                      { key: "delivery", label: "Entrega", icon: Truck },
                      { key: "reliability", label: "Confiab.", icon: CheckCircle },
                      { key: "support", label: "Suporte", icon: ThumbsUp }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <p className={`font-bold ${getScoreColor(supplier.scores[key as keyof typeof supplier.scores])}`}>
                          {supplier.scores[key as keyof typeof supplier.scores]}
                        </p>
                        <Progress 
                          value={supplier.scores[key as keyof typeof supplier.scores]} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-400" />
                        {supplier.averageDeliveryDays} dias
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        {supplier.onTimeDelivery}% pontual
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className={`h-4 w-4 ${supplier.defectRate < 1 ? "text-green-400" : "text-amber-400"}`} />
                        {supplier.defectRate}% defeitos
                      </span>
                    </div>
                    <div className="text-lg font-bold">
                      Score: <span className={getScoreColor(calculateOverallScore(supplier))}>{calculateOverallScore(supplier)}</span>
                    </div>
                  </div>

                  {supplier.aiReason && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      supplier.aiRecommendation ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                    }`}>
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{supplier.aiReason}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison Summary */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise Comparativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Best in Category */}
              <div>
                <h4 className="text-sm font-medium mb-3">Melhores por Categoria</h4>
                <div className="space-y-2">
                  {[
                    { label: "Melhor Preço", supplier: "NavalTech Solutions", score: 98 },
                    { label: "Melhor Qualidade", supplier: "Premium Maritime", score: 98 },
                    { label: "Entrega Mais Rápida", supplier: "FastShip Marine", score: 2 },
                    { label: "Mais Confiável", supplier: "Premium Maritime", score: 98 },
                    { label: "Melhor Custo-Benefício", supplier: "Marine Parts Global", score: 90 }
                  ].map((item, i) => (
                    <div key={i} className="p-2 rounded bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <Badge variant="outline" className="text-xs">{item.score}{item.label.includes("Entrega") ? " dias" : ""}</Badge>
                      </div>
                      <p className="text-sm font-medium">{item.supplier}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Recomendação IA</span>
                </div>
                <p className="text-sm mb-2">
                  <strong>Marine Parts Global</strong> é a melhor escolha para a maioria dos cenários.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Score geral de 90/100</li>
                  <li>✓ Taxa de defeitos mais baixa</li>
                  <li>✓ Preço 8% acima mas qualidade superior</li>
                  <li>✓ Histórico de 245 pedidos sem problemas</li>
                </ul>
              </div>

              <Button className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Iniciar Cotação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SupplierComparator;
