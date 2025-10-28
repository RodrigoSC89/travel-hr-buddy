// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download,
  MapPin,
  Clock,
  User,
  Edit,
  Check,
  Image as ImageIcon,
  PenTool
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';

interface IncidentDetailDialogEnhancedProps {
  incident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const IncidentDetailDialogEnhanced: React.FC<IncidentDetailDialogEnhancedProps> = ({
  incident,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(incident);
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState({ description: '', assignedTo: '', dueDate: '' });
  const [showSignature, setShowSignature] = useState(false);
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryRole, setSignatoryRole] = useState('');
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (incident) {
      setFormData(incident);
      loadActions();
    }
  }, [incident]);

  const loadActions = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_actions')
        .select('*')
        .eq('incident_id', incident.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('incident_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', incident.id);

      if (error) throw error;

      sonnerToast.success(`Status updated to ${newStatus}`);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      sonnerToast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('incident_reports')
        .update(formData)
        .eq('id', incident.id);

      if (error) throw error;

      sonnerToast.success('Incident updated successfully');
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating incident:', error);
      sonnerToast.error('Failed to update incident');
    }
  };

  const handleAddAction = async () => {
    if (!newAction.description) {
      sonnerToast.error('Action description is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('incident_actions')
        .insert({
          incident_id: incident.id,
          description: newAction.description,
          assigned_to: newAction.assignedTo,
          due_date: newAction.dueDate || null,
          status: 'pending'
        });

      if (error) throw error;

      sonnerToast.success('Action added successfully');
      setNewAction({ description: '', assignedTo: '', dueDate: '' });
      loadActions();
    } catch (error) {
      console.error('Error adding action:', error);
      sonnerToast.error('Failed to add action');
    }
  };

  const handleSaveSignature = async () => {
    if (!signatoryName || !signatoryRole) {
      sonnerToast.error('Please enter name and role');
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      sonnerToast.error('Please provide a signature');
      return;
    }

    try {
      const signatureData = signatureRef.current.toDataURL();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('incident_signatures')
        .insert({
          incident_id: incident.id,
          signatory_name: signatoryName,
          signatory_role: signatoryRole,
          signature_data: signatureData,
          signed_by: user?.id,
          signed_at: new Date().toISOString()
        });

      if (error) throw error;

      sonnerToast.success('Signature saved successfully');
      setShowSignature(false);
      setSignatoryName('');
      setSignatoryRole('');
      signatureRef.current?.clear();
    } catch (error) {
      console.error('Error saving signature:', error);
      sonnerToast.error('Failed to save signature');
    }
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Incident Report', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Incident #: ${incident.incident_number || incident.id}`, 14, 32);
      doc.text(`Title: ${incident.title}`, 14, 40);
      doc.text(`Date: ${format(new Date(incident.incident_date), 'PPpp')}`, 14, 48);
      doc.text(`Status: ${incident.status}`, 14, 56);
      doc.text(`Severity: ${incident.severity}`, 14, 64);
      
      // Details
      doc.setFontSize(14);
      doc.text('Description:', 14, 76);
      doc.setFontSize(11);
      const splitDescription = doc.splitTextToSize(incident.description, 180);
      doc.text(splitDescription, 14, 84);

      const fileName = `incident_${incident.incident_number || incident.id}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);
      
      sonnerToast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      sonnerToast.error('Failed to export PDF');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600';
      case 'under_analysis': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{incident.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
                <Badge className={getStatusColor(incident.status)} variant="outline">
                  {incident.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {incident.incident_number || `#${incident.id}`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="signature">Signatures</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    {isEditing ? (
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="personnel">Personnel</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm font-medium mt-2">{incident.category}</div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={handleStatusUpdate}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="under_analysis">Under Analysis</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(new Date(incident.incident_date), 'PPp')}
                    </span>
                  </div>
                  
                  {incident.incident_location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{incident.incident_location}</span>
                    </div>
                  )}
                </div>

                {incident.vessel_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Vessel:</span>
                    <span className="font-medium">{incident.vessel_name}</span>
                  </div>
                )}

                {incident.gps_coordinates && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">GPS:</span>
                    <span className="font-medium">{incident.gps_coordinates}</span>
                  </div>
                )}

                <div>
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                    />
                  ) : (
                    <div className="text-sm mt-2 whitespace-pre-wrap">{incident.description}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Corrective Actions</CardTitle>
                <CardDescription>Track actions taken to address this incident</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label>Add New Action</Label>
                  <Textarea
                    placeholder="Describe the action to be taken..."
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Assigned to"
                      value={newAction.assignedTo}
                      onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="Due date"
                      value={newAction.dueDate}
                      onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddAction} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>

                <div className="space-y-3">
                  {actions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No actions recorded yet
                    </p>
                  ) : (
                    actions.map((action) => (
                      <div key={action.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium">{action.description}</div>
                          <Badge variant="outline">{action.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {action.assigned_to && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {action.assigned_to}
                            </span>
                          )}
                          {action.due_date && (
                            <span>Due: {format(new Date(action.due_date), 'PP')}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incident Photos</CardTitle>
              </CardHeader>
              <CardContent>
                {incident.photos && incident.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {incident.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Incident photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No photos attached to this incident</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Signatures</CardTitle>
                <CardDescription>Signatures of responsible parties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showSignature ? (
                  <Button onClick={() => setShowSignature(true)}>
                    <PenTool className="h-4 w-4 mr-2" />
                    Add Signature
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={signatoryName}
                          onChange={(e) => setSignatoryName(e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={signatoryRole}
                          onChange={(e) => setSignatoryRole(e.target.value)}
                          placeholder="Position/Role"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Signature</Label>
                      <div className="border rounded-lg bg-white">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            className: 'w-full h-32',
                          }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => signatureRef.current?.clear()}
                        >
                          Clear
                        </Button>
                        <Button size="sm" onClick={handleSaveSignature}>
                          Save Signature
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSignature(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialogEnhanced;
