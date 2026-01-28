/**
 * Privacy Policy Page
 * Política de Privacidade (LGPD) - Nauti One
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/landing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Política de Privacidade (LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                <h2>1. Introdução</h2>
                <p>
                  Esta Política de Privacidade descreve como o Nauti One coleta,
                  usa, armazena e protege seus dados pessoais, em conformidade com
                  a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>

                <h2>2. Dados Coletados</h2>
                <p>Coletamos os seguintes tipos de dados:</p>
                <ul>
                  <li><strong>Dados de identificação:</strong> nome, email, telefone</li>
                  <li><strong>Dados profissionais:</strong> cargo, certificações, histórico</li>
                  <li><strong>Dados de navegação:</strong> IP, dispositivo, cookies</li>
                  <li><strong>Dados de documentos:</strong> certificados, contratos</li>
                </ul>

                <h2>3. Finalidade do Tratamento</h2>
                <p>Utilizamos seus dados para:</p>
                <ul>
                  <li>Prestação dos serviços contratados</li>
                  <li>Gestão de tripulação e documentação</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Comunicações sobre o serviço</li>
                  <li>Melhorias e personalização da plataforma</li>
                </ul>

                <h2>4. Base Legal</h2>
                <p>
                  O tratamento de dados é realizado com base no consentimento,
                  execução de contrato, cumprimento de obrigação legal e interesse
                  legítimo, conforme aplicável.
                </p>

                <h2>5. Compartilhamento de Dados</h2>
                <p>Seus dados podem ser compartilhados com:</p>
                <ul>
                  <li>Órgãos reguladores (ANTAQ, DPC, IMO)</li>
                  <li>Empresas contratantes (para tripulantes)</li>
                  <li>Prestadores de serviços (cloud, pagamentos)</li>
                </ul>

                <h2>6. Segurança</h2>
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger
                  seus dados, incluindo criptografia, controle de acesso e
                  monitoramento contínuo.
                </p>

                <h2>7. Seus Direitos</h2>
                <p>Você tem direito a:</p>
                <ul>
                  <li>Confirmar a existência de tratamento</li>
                  <li>Acessar seus dados</li>
                  <li>Corrigir dados incompletos ou incorretos</li>
                  <li>Solicitar anonimização ou exclusão</li>
                  <li>Portabilidade de dados</li>
                  <li>Revogar consentimento</li>
                </ul>

                <h2>8. Retenção de Dados</h2>
                <p>
                  Mantemos seus dados pelo período necessário para cumprir as
                  finalidades descritas ou obrigações legais (ex: registros de
                  embarque por 10 anos).
                </p>

                <h2>9. Cookies</h2>
                <p>
                  Utilizamos cookies essenciais para funcionamento e cookies
                  analíticos (com consentimento) para melhorar a experiência.
                </p>

                <h2>10. Encarregado de Dados (DPO)</h2>
                <p>
                  Para exercer seus direitos ou esclarecer dúvidas, entre em
                  contato com nosso Encarregado de Dados através de
                  privacidade@nautione.com
                </p>

                <h2>11. Alterações</h2>
                <p>
                  Esta política pode ser atualizada periodicamente. Notificaremos
                  sobre alterações significativas através da plataforma ou email.
                </p>

                <p className="text-muted-foreground text-xs mt-8">
                  Última atualização: Janeiro de 2026
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
