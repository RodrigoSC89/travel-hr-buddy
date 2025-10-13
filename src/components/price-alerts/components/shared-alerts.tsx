import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  TrendingUp, 
  Users,
  Plus,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SharedAlert {
  id: string;
  alert_id: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  is_featured: boolean;
  created_at: string;
  shared_by: string;
  alert: {
    product_name: string;
    product_url: string;
    target_price: number;
    current_price: number;
    discount_percentage: number;
    store_name: string;
    category: string;
  };
  user_vote?: "upvote" | "downvote";
}

interface ShareAlertForm {
  alert_id: string;
  title: string;
  description: string;
}

export const SharedAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sharedAlerts, setSharedAlerts] = useState<SharedAlert[]>([]);
  const [userAlerts, setUserAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareForm, setShareForm] = useState<ShareAlertForm>({
    alert_id: "",
    title: "",
    description: "",
  });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSharedAlerts();
    if (user) {
      loadUserAlerts();
    }
  }, [user]);

  const loadSharedAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("shared_alerts")
        .select(`
          *,
          alert:price_alerts (
            product_name,
            product_url,
            target_price,
            current_price,
            discount_percentage,
            store_name,
            category
          )
        `)
        .order("upvotes", { ascending: false })
        .limit(20);

      if (error) {
        return;
      }

      if (data && user) {
        // Carregar votos do usuário
        const alertIds = data.map(alert => alert.id);
        const { data: votes } = await supabase
          .from("alert_votes")
          .select("shared_alert_id, vote_type")
          .eq("user_id", user.id)
          .in("shared_alert_id", alertIds);

        const votesMap = votes?.reduce((acc, vote) => {
          acc[vote.shared_alert_id] = vote.vote_type;
          return acc;
        }, {} as Record<string, string>) || {};

        const alertsWithVotes = data.map(alert => ({
          ...alert,
          user_vote: votesMap[alert.id] as "upvote" | "downvote" | undefined,
        }));

        setSharedAlerts(alertsWithVotes);
      } else {
        setSharedAlerts(data || []);
      }
    } catch (error) {
      console.error("Error in shared-alerts.tsx:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("id, product_name, current_price, target_price")
        .eq("user_id", user?.id)
        .eq("is_active", true);

      if (error) {
        return;
      }

      setUserAlerts(data || []);
    } catch (error) {
      console.error("Error in shared-alerts.tsx:", error);
    }
  };

  const handleVote = async (sharedAlertId: string, voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para votar nos alertas compartilhados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentAlert = sharedAlerts.find(a => a.id === sharedAlertId);
      const currentVote = currentAlert?.user_vote;

      // Se está votando no mesmo tipo, remove o voto
      if (currentVote === voteType) {
        const { error } = await supabase
          .from("alert_votes")
          .delete()
          .eq("shared_alert_id", sharedAlertId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Atualizar contadores
        const updateField = voteType === "upvote" ? "upvotes" : "downvotes";
        const newCount = Math.max(0, (currentAlert?.[updateField] || 0) - 1);
        
        await supabase
          .from("shared_alerts")
          .update({ [updateField]: newCount })
          .eq("id", sharedAlertId);

        // Atualizar estado local
        setSharedAlerts(prev => prev.map(alert => 
          alert.id === sharedAlertId 
            ? { ...alert, [updateField]: newCount, user_vote: undefined }
            : alert
        ));
      } else {
        // Inserir ou atualizar voto
        const { error } = await supabase
          .from("alert_votes")
          .upsert({
            shared_alert_id: sharedAlertId,
            user_id: user.id,
            vote_type: voteType,
          });

        if (error) throw error;

        // Atualizar contadores
        let upvoteDelta = 0;
        let downvoteDelta = 0;

        if (voteType === "upvote") {
          upvoteDelta = 1;
          if (currentVote === "downvote") downvoteDelta = -1;
        } else {
          downvoteDelta = 1;
          if (currentVote === "upvote") upvoteDelta = -1;
        }

        const newUpvotes = Math.max(0, (currentAlert?.upvotes || 0) + upvoteDelta);
        const newDownvotes = Math.max(0, (currentAlert?.downvotes || 0) + downvoteDelta);

        await supabase
          .from("shared_alerts")
          .update({ 
            upvotes: newUpvotes,
            downvotes: newDownvotes
          })
          .eq("id", sharedAlertId);

        // Atualizar estado local
        setSharedAlerts(prev => prev.map(alert => 
          alert.id === sharedAlertId 
            ? { 
              ...alert, 
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              user_vote: voteType 
            }
            : alert
        ));
      }

      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar seu voto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleShareAlert = async () => {
    if (!user || !shareForm.alert_id || !shareForm.title) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("shared_alerts")
        .insert({
          alert_id: shareForm.alert_id,
          shared_by: user.id,
          title: shareForm.title,
          description: shareForm.description,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Alerta compartilhado com a comunidade!",
      });

      setShareForm({ alert_id: "", title: "", description: "" });
      setIsShareDialogOpen(false);
      loadSharedAlerts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao compartilhar alerta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const copyProductUrl = async (url: string, productName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
      
      toast({
        title: "Link copiado",
        description: `Link do produto "${productName}" copiado!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alertas da Comunidade</h2>
          <p className="text-muted-foreground">
            Descubra e compartilhe ofertas incríveis com outros usuários
          </p>
        </div>
        
        {user && userAlerts.length > 0 && (
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar Alerta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar Alerta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alert-select">Selecionar Alerta *</Label>
                  <select
                    id="alert-select"
                    className="w-full p-2 border rounded-md"
                    value={shareForm.alert_id}
                    onChange={(e) => setShareForm(prev => ({ ...prev, alert_id: e.target.value }))}
                  >
                    <option value="">Escolha um alerta</option>
                    {userAlerts.map(alert => (
                      <option key={alert.id} value={alert.id}>
                        {alert.product_name} - R$ {alert.target_price}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={shareForm.title}
                    onChange={(e) => setShareForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Ótima oportunidade para smartphone!"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={shareForm.description}
                    onChange={(e) => setShareForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Conte por que este é um bom negócio..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleShareAlert} className="flex-1">
                    Compartilhar
                  </Button>
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Destaque
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          {sharedAlerts
            .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
            .map(alert => (
              <SharedAlertCard 
                key={alert.id} 
                alert={alert} 
                onVote={handleVote}
                onCopyUrl={copyProductUrl}
                copiedUrl={copiedUrl}
              />
            ))}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          {sharedAlerts
            .filter(alert => alert.is_featured)
            .map(alert => (
              <SharedAlertCard 
                key={alert.id} 
                alert={alert} 
                onVote={handleVote}
                onCopyUrl={copyProductUrl}
                copiedUrl={copiedUrl}
              />
            ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {sharedAlerts
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(alert => (
              <SharedAlertCard 
                key={alert.id} 
                alert={alert} 
                onVote={handleVote}
                onCopyUrl={copyProductUrl}
                copiedUrl={copiedUrl}
              />
            ))}
        </TabsContent>
      </Tabs>

      {sharedAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum alerta compartilhado ainda</h3>
            <p className="text-muted-foreground mb-4">
              Seja o primeiro a compartilhar uma oferta incrível com a comunidade!
            </p>
            {user && userAlerts.length > 0 && (
              <Button onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar Alerta
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SharedAlertCardProps {
  alert: SharedAlert;
  onVote: (alertId: string, voteType: "upvote" | "downvote") => void;
  onCopyUrl: (url: string, productName: string) => void;
  copiedUrl: string | null;
}

const SharedAlertCard: React.FC<SharedAlertCardProps> = ({ 
  alert, 
  onVote, 
  onCopyUrl,
  copiedUrl 
}) => {
  const { user } = useAuth();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{alert.title}</h3>
              {alert.is_featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {alert.shared_by.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>Compartilhado em {new Date(alert.created_at).toLocaleDateString()}</span>
            </div>
            
            {alert.description && (
              <p className="text-muted-foreground">{alert.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{alert.alert.product_name}</h4>
            <div className="flex gap-2">
              {alert.alert.store_name && (
                <Badge variant="outline">{alert.alert.store_name}</Badge>
              )}
              {alert.alert.category && (
                <Badge variant="outline">{alert.alert.category}</Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Preço Atual:</span>
              <p className="font-bold">
                R$ {alert.alert.current_price?.toFixed(2) || "N/A"}
              </p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Preço Meta:</span>
              <p className="font-bold text-primary">
                R$ {alert.alert.target_price.toFixed(2)}
              </p>
            </div>
            
            {alert.alert.discount_percentage > 0 && (
              <div>
                <span className="text-muted-foreground">Economia:</span>
                <p className="font-bold text-green-600">
                  {alert.alert.discount_percentage.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Button
                  variant={alert.user_vote === "upvote" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVote(alert.id, "upvote")}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {alert.upvotes}
                </Button>
                
                <Button
                  variant={alert.user_vote === "downvote" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onVote(alert.id, "downvote")}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {alert.downvotes}
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyUrl(alert.alert.product_url, alert.alert.product_name)}
              className="flex items-center gap-1"
            >
              {copiedUrl === alert.alert.product_url ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copiar Link
            </Button>
            
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <a 
                href={alert.alert.product_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Produto
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};