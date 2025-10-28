// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface AuditsListProps {
  onRefresh?: () => void;
}

export function AuditsList({ onRefresh }: AuditsListProps) {
  const { toast } = useToast();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sgso_audits")
        .select("*")
        .order("audit_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAudits(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading audits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      "planned": { variant: "outline", icon: Clock },
      "in_progress": { variant: "default", icon: Clock },
      "completed": { variant: "default", icon: CheckCircle },
      "follow_up": { variant: "secondary", icon: Clock },
      "closed": { variant: "secondary", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig["planned"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const handleStatusChange = async (auditId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("sgso_audits")
        .update({ status: newStatus })
        .eq("id", auditId);

      if (error) throw error;

      // Log the status change
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({
        action: "audit_status_changed",
        entity_type: "sgso_audit",
        entity_id: auditId,
        details: { new_status: newStatus },
        user_id: user?.id
      });

      toast({
        title: "Status Updated",
        description: `Audit status changed to ${newStatus}`,
      });

      loadAudits();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Loading audits...</div>
        </CardContent>
      </Card>
    );
  }

  if (audits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No audits found. Create your first audit submission.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Audits</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audit Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Auditors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">{audit.audit_number}</TableCell>
                <TableCell>
                  <Badge variant="outline">{audit.audit_type}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{audit.audit_scope}</TableCell>
                <TableCell>
                  {audit.audit_date ? format(new Date(audit.audit_date), "PP") : "-"}
                </TableCell>
                <TableCell>{getStatusBadge(audit.status)}</TableCell>
                <TableCell>
                  {audit.auditors && Array.isArray(audit.auditors) 
                    ? audit.auditors.length 
                    : 0}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {audit.status === "planned" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(audit.id, "in_progress")}>
                          <Clock className="h-4 w-4 mr-2" />
                          Start Audit
                        </DropdownMenuItem>
                      )}
                      {audit.status === "in_progress" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(audit.id, "completed")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {audit.status === "completed" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(audit.id, "closed")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Close Audit
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
