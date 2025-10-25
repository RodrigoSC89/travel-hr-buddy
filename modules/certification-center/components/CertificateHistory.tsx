/**
 * Certificate History Component
 * PATCH 151.0 - Display certificate history
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Loader2 } from 'lucide-react';
import { listCertificates } from '../services/certification-service';
import { CertificationData } from '../types';
import { downloadCertificatePDF } from '../utils/pdf-generator';
import { Button } from '@/components/ui/button';

export const CertificateHistory: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await listCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (certificate: CertificationData) => {
    try {
      await downloadCertificatePDF(certificate);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: 'default',
      'non-compliant': 'destructive',
      conditional: 'secondary'
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Certificate History
        </CardTitle>
        <CardDescription>
          View all issued certificates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No certificates found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>IMO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-xs">{cert.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.type}</Badge>
                  </TableCell>
                  <TableCell>{cert.vesselName}</TableCell>
                  <TableCell>{cert.imoNumber}</TableCell>
                  <TableCell>{getStatusBadge(cert.operationDetails.status)}</TableCell>
                  <TableCell>{new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(cert.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(cert)}
                    >
                      Download PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
