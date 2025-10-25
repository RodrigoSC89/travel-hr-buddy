/**
 * Certification Form Component
 * PATCH 151.0 - Certificate issuance form
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileCheck, Loader2 } from 'lucide-react';
import { CertificationFormData } from '../types';
import { issueCertificate } from '../services/certification-service';
import { downloadCertificatePDF } from '../utils/pdf-generator';

export const CertificationForm: React.FC<{
  onSuccess?: () => void;
}> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CertificationFormData>({
    type: 'ISM',
    vesselId: '',
    vesselName: '',
    imoNumber: '',
    issuedBy: '',
    expiryDate: '',
    portName: '',
    operationType: '',
    inspectorName: '',
    inspectionDate: '',
    findings: [],
    status: 'compliant'
  });
  const [findingsText, setFindingsText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse findings
      const findings = findingsText
        .split('\n')
        .filter(f => f.trim())
        .map(f => f.trim());

      const dataToSubmit = {
        ...formData,
        findings
      };

      // Issue certificate
      const certificate = await issueCertificate(dataToSubmit);
      
      toast.success('Certificate issued successfully!');
      
      // Generate and download PDF
      await downloadCertificatePDF(certificate);
      
      // Reset form
      setFormData({
        type: 'ISM',
        vesselId: '',
        vesselName: '',
        imoNumber: '',
        issuedBy: '',
        expiryDate: '',
        portName: '',
        operationType: '',
        inspectorName: '',
        inspectionDate: '',
        findings: [],
        status: 'compliant'
      });
      setFindingsText('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Issue New Certificate
        </CardTitle>
        <CardDescription>
          Generate a digital certificate with QR code and cryptographic hash
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Certificate Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Certificate Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISM">ISM - International Safety Management</SelectItem>
                <SelectItem value="ISPS">ISPS - International Ship and Port Security</SelectItem>
                <SelectItem value="IMCA">IMCA - International Marine Contractors Association</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                value={formData.vesselName}
                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imoNumber">IMO Number</Label>
              <Input
                id="imoNumber"
                value={formData.imoNumber}
                onChange={(e) => setFormData({ ...formData, imoNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vesselId">Vessel ID</Label>
            <Input
              id="vesselId"
              value={formData.vesselId}
              onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
              required
            />
          </div>

          {/* Certification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuedBy">Issued By</Label>
              <Input
                id="issuedBy"
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Operation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portName">Port Name</Label>
              <Input
                id="portName"
                value={formData.portName}
                onChange={(e) => setFormData({ ...formData, portName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operationType">Operation Type</Label>
              <Input
                id="operationType"
                value={formData.operationType}
                onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspectorName">Inspector Name</Label>
              <Input
                id="inspectorName"
                value={formData.inspectorName}
                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspectionDate">Inspection Date</Label>
              <Input
                id="inspectionDate"
                type="date"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Compliance Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Findings */}
          <div className="space-y-2">
            <Label htmlFor="findings">Findings (one per line)</Label>
            <Textarea
              id="findings"
              value={findingsText}
              onChange={(e) => setFindingsText(e.target.value)}
              placeholder="Enter findings, one per line..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing Certificate...
              </>
            ) : (
              <>
                <FileCheck className="mr-2 h-4 w-4" />
                Issue Certificate
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
