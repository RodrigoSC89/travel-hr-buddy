/**
 * Crew Members Component - List and manage crew members
 * PATCH 446: Consolidated crew management with Supabase integration
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  onboard_status: boolean;
  health_status: string;
  vessel_id: string | null;
  email: string | null;
  phone: string | null;
  certifications: string[];
}

interface CrewMemberWithVessel extends CrewMember {
  vessel_name?: string;
}

export function CrewMembers() {
  const [members, setMembers] = useState<CrewMemberWithVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCrewMembers();
  }, []);

  const fetchCrewMembers = async () => {
    try {
      const { data: crewData, error } = await supabase
        .from("crew_members")
        .select(`
          *,
          vessels (
            name
          )
        `)
        .order("name");

      if (error) throw error;

      const formattedData = crewData?.map((member: any) => ({
        ...member,
        vessel_name: member.vessels?.name || null,
      })) || [];

      setMembers(formattedData);
    } catch (error) {
      console.error("Error fetching crew members:", error);
      toast({
        title: "Error",
        description: "Failed to load crew members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (member: CrewMember) => {
    if (member.health_status !== "fit") {
      return <Badge variant="destructive">{member.health_status}</Badge>;
    }
    if (member.onboard_status) {
      return <Badge variant="default">Onboard</Badge>;
    }
    return <Badge variant="secondary">Shore Leave</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crew members..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crew Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No crew members found" : "No crew members yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{member.name}</p>
                      {getStatusBadge(member)}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                    {member.vessel_name && (
                      <p className="text-xs text-muted-foreground">
                        Assigned to: {member.vessel_name}
                      </p>
                    )}
                    {member.certifications && member.certifications.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {member.certifications.slice(0, 3).map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {member.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.certifications.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
