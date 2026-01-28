/**
 * Terms of Service Page
 * Termos de Uso - Nauti One
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
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
              <FileText className="h-6 w-6" />
              Termos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <div className="prose prose-sm dark:prose-invert max-w-none pr-4">
                <h2>1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e utilizar a plataforma Nauti One, você concorda com estes
                  Termos de Uso e nossa Política de Privacidade. Se você não concordar
                  com qualquer parte destes termos, não utilize nossos serviços.
                </p>

                <h2>2. Descrição do Serviço</h2>
                <p>
                  O Nauti One é uma plataforma de gestão de recursos humanos marítimos
                  que oferece funcionalidades de gestão de tripulação, documentos,
                  folha de pagamento, compliance (MLC 2006, STCW), treinamento e
                  agendamento.
                </p>

                <h2>3. Cadastro e Conta</h2>
                <p>
                  Para utilizar nossos serviços, você deve criar uma conta fornecendo
                  informações precisas e completas. Você é responsável por manter a
                  confidencialidade de suas credenciais de acesso.
                </p>

                <h2>4. Uso Aceitável</h2>
                <p>Você concorda em não:</p>
                <ul>
                  <li>Violar leis ou regulamentos aplicáveis</li>
                  <li>Transmitir malware ou código malicioso</li>
                  <li>Tentar acessar sistemas não autorizados</li>
                  <li>Compartilhar credenciais de acesso</li>
                  <li>Usar o serviço para fins ilegais</li>
                </ul>

                <h2>5. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo, código, design e funcionalidades do Nauti One são
                  propriedade exclusiva da empresa e protegidos por leis de propriedade
                  intelectual.
                </p>

                <h2>6. Proteção de Dados</h2>
                <p>
                  Tratamos seus dados de acordo com a Lei Geral de Proteção de Dados
                  (LGPD - Lei nº 13.709/2018). Consulte nossa Política de Privacidade
                  para mais detalhes.
                </p>

                <h2>7. Limitação de Responsabilidade</h2>
                <p>
                  O Nauti One é fornecido "como está". Não garantimos que o serviço
                  será ininterrupto ou livre de erros. Nossa responsabilidade é
                  limitada ao máximo permitido por lei.
                </p>

                <h2>8. Modificações</h2>
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento.
                  Alterações significativas serão comunicadas por email ou através
                  da plataforma.
                </p>

                <h2>9. Contato</h2>
                <p>
                  Para dúvidas sobre estes termos, entre em contato através de
                  suporte@nautione.com
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
