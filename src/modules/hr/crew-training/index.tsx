/**
 * PATCH 112.0 - Crew Training & Certification System
 * Crew Training - Training records, certifications, and compliance tracking
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  RefreshCw,
  Plus,
  Search,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { runAIContext } from "@/ai/kernel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TrainingRecord {
  id: string;
  crew_id: string;
  course_name: string;
  completion_date: string | null;
  expires_at: string | null;
  certification_file: string | null;
  provider: string | null;
  certificate_number: string | null;
  training_type: string | null;
  status: 'valid' | 'expired' | 'expiring_soon' | 'pending';
  notes: string | null;
  crew_name?: string;
  crew_position?: string;
  crew_email?: string;
  vessel_name?: string;
  days_expired?: number;
  days_until_expiry?: number;
}

const CrewTraining = () => {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadTrainingRecords();
    loadAIInsights();
  }, []);

  const loadTrainingRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_expiry_status' as any)
        .select('*');

      if (error) throw error;

      setRecords((data || []) as any);
    } catch (error) {
      console.error('Error loading training records:', error);
      toast({
        title: "Error",
        description: "Failed to load training records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const expiredCount = records.filter(r => r.status === 'expired').length;
      const expiringCount = records.filter(r => r.status === 'expiring_soon').length;
      
      const response = await runAIContext({
        module: 'training-validator',
        action: 'validate',
        context: { 
          expiredCount,
          expiringCount,
          totalCrew: new Set(records.map(r => r.crew_id)).size
        }
      });
      
      if (response.message) {
        setAiInsight(response.message);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Expired
        </Badge>;
      case 'expiring_soon':
        return <Badge variant="outline" className="flex items-center gap-1 text-orange-600 border-orange-600">
          <Clock className="h-3 w-3" /> Expiring Soon
        </Badge>;
      case 'valid':
        return <Badge variant="secondary" className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-3 w-3" /> Valid
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    const matchesType = filterType === "all" || record.training_type === filterType;
    const matchesSearch = searchQuery === "" || 
      record.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.crew_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.crew_position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const types = Array.from(new Set(records.map(r => r.training_type).filter(Boolean)));

  const totalRecords = records.length;
  const expiredCount = records.filter(r => r.status === 'expired').length;
  const expiringCount = records.filter(r => r.status === 'expiring_soon').length;
  const validCount = records.filter(r => r.status === 'valid').length;
  const complianceRate = totalRecords > 0 ? ((validCount / totalRecords) * 100).toFixed(1) : '0';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Crew Training</h1>
            <p className="text-muted-foreground">Certification & Training Management</p>
          </div>
        </div>
        <Button onClick={loadTrainingRecords} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Training records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
            <p className="text-xs text-muted-foreground">Require renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringCount}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">{validCount} valid certs</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              AI Training Validator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course or crew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type!}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Training Records List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Training Records</CardTitle>
            <CardDescription>
              {filteredRecords.length} records {filteredRecords.length !== totalRecords && `(filtered from ${totalRecords})`}
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading training records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No training records found matching your filters
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{record.course_name}</h3>
                          {getStatusBadge(record.status)}
                          {record.training_type && (
                            <Badge variant="outline" className="text-xs">
                              {record.training_type}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                          <div>
                            <span className="font-medium">Crew Member:</span> {record.crew_name || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Position:</span> {record.crew_position || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Completion:</span>{' '}
                            {record.completion_date ? format(new Date(record.completion_date), 'PP') : 'Pending'}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span>{' '}
                            {record.expires_at ? format(new Date(record.expires_at), 'PP') : 'N/A'}
                          </div>
                          {record.provider && (
                            <div>
                              <span className="font-medium">Provider:</span> {record.provider}
                            </div>
                          )}
                          {record.certificate_number && (
                            <div>
                              <span className="font-medium">Certificate #:</span> {record.certificate_number}
                            </div>
                          )}
                        </div>
                        {record.status === 'expired' && record.days_expired && (
                          <p className="text-xs text-destructive font-medium">
                            Expired {record.days_expired} days ago
                          </p>
                        )}
                        {record.status === 'expiring_soon' && record.days_until_expiry && (
                          <p className="text-xs text-orange-600 font-medium">
                            Expires in {record.days_until_expiry} days
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Certificate
                        </Button>
                        {record.certification_file && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View File
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewTraining;
