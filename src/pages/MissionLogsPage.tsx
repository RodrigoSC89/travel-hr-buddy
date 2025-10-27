/**
 * PATCH 266 - Mission Logs Page
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { missionLogsService, type MissionLog } from "@/modules/mission-logs/services/mission-logs-service";
import { FileText, Plus, Edit, Trash2, Filter } from "lucide-react";

export default function MissionLogsPage() {
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MissionLog | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<MissionLog>>({
    missionName: '',
    missionDate: new Date().toISOString().split('T')[0],
    crewMembers: [],
    status: 'planned',
    description: '',
    location: ''
  });

  useEffect(() => {
    loadLogs();
  }, [statusFilter]);

  const loadLogs = async () => {
    setLoading(true);
    const filters = statusFilter ? { status: statusFilter } : undefined;
    const data = await missionLogsService.getLogs(filters);
    setLogs(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLog?.id) {
        await missionLogsService.updateLog(editingLog.id, formData);
        toast.success('Mission log updated');
      } else {
        await missionLogsService.createLog(formData as MissionLog);
        toast.success('Mission log created');
      }
      setIsDialogOpen(false);
      resetForm();
      loadLogs();
    } catch (error) {
      toast.error('Failed to save mission log');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this log?')) {
      try {
        await missionLogsService.deleteLog(id);
        toast.success('Mission log deleted');
        loadLogs();
      } catch (error) {
        toast.error('Failed to delete mission log');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      missionName: '',
      missionDate: new Date().toISOString().split('T')[0],
      crewMembers: [],
      status: 'planned',
      description: '',
      location: ''
    });
    setEditingLog(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'planned': 'outline',
      'in-progress': 'default',
      'completed': 'secondary',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mission Logs</h1>
          <p className="text-muted-foreground">Track and manage mission operations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> New Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLog ? 'Edit Mission Log' : 'Create Mission Log'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Mission Name</Label>
                <Input
                  value={formData.missionName}
                  onChange={(e) => setFormData({ ...formData, missionName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.missionDate}
                    onChange={(e) => setFormData({ ...formData, missionDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label>Crew Members (comma-separated)</Label>
                <Input
                  value={formData.crewMembers?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, crewMembers: e.target.value.split(',').map(s => s.trim()) })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingLog ? 'Update' : 'Create'} Mission Log
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center">Loading...</Card>
        ) : logs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mission logs found. Create your first one!</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{log.missionName}</h3>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📅 {new Date(log.missionDate).toLocaleDateString()}</p>
                    {log.location && <p>📍 {log.location}</p>}
                    {log.crewMembers.length > 0 && (
                      <p>👥 {log.crewMembers.join(', ')}</p>
                    )}
                  </div>
                  {log.description && (
                    <p className="text-sm mt-2">{log.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLog(log);
                      setFormData(log);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => log.id && handleDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
