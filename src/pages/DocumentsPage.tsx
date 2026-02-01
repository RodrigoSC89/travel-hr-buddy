/**
 * Documents Page - Gestão de Documentos
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Upload, Download, Folder, File, Clock } from "lucide-react";

const documents = [
  { id: 1, name: "Contrato de Afretamento", type: "contract", size: "2.4 MB", date: "01/02/2026", folder: "Contratos" },
  { id: 2, name: "Certificado STCW", type: "certificate", size: "1.2 MB", date: "31/01/2026", folder: "Certificados" },
  { id: 3, name: "Manual de Operações", type: "manual", size: "5.8 MB", date: "30/01/2026", folder: "Manuais" },
  { id: 4, name: "Relatório de Inspeção", type: "report", size: "3.1 MB", date: "29/01/2026", folder: "Relatórios" },
  { id: 5, name: "Política de Segurança", type: "policy", size: "890 KB", date: "28/01/2026", folder: "Políticas" },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Documentos</h2>
            <p className="text-muted-foreground">Gerencie todos os documentos do sistema</p>
          </div>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar documentos..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{documents.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Armazenamento Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">13.4 MB</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Uploads Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">5</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Downloads Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">12</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Folder className="h-3 w-3" />
                      <span>{doc.folder}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
