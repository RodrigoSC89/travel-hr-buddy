import { useEffect, useMemo, useState, useCallback } from "react";;

/**
 * PATCH 416: Consolidated Crew Management Page
 * Unified crew management with performance, certifications, and mobile support
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Award, 
  TrendingUp, 
  Search,
  UserCheck,
  AlertTriangle,
  Calendar,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  rank?: string;
  status: string;
  vessel_id?: string;
  contact_email?: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  created_at: string;
}

interface Certification {
  id: string;
  crew_member_id: string;
  certification_name: string;
  issue_date: string;
  expiry_date: string;
  status: string;
}

interface PerformanceReview {
  id: string;
  crew_member_id: string;
  review_date: string;
  rating: number;
  reviewer_name?: string;
  comments?: string;
}

export const ConsolidatedCrewManagement = memo(() => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [performances, setPerformances] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load crew members
      const { data: crewData, error: crewError } = await supabase
        .from("crew_members")
        .select("*")
        .order("name");

      if (crewError) throw crewError;

      // Load certifications
      const { data: certData, error: certError } = await supabase
        .from("crew_certifications")
        .select("*")
        .order("expiry_date");

      if (certError) throw certError;

      // Load performance reviews
      const { data: perfData, error: perfError } = await supabase
        .from("crew_performance_reviews")
        .select("*")
        .order("review_date", { ascending: false });

      if (perfError) throw perfError;

      setCrewMembers(crewData || []);
      setCertifications(certData || []);
      setPerformances(perfData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load crew data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCrewStats = () => {
    const expiringCerts = certifications.filter(cert => {
      const daysUntilExpiry = Math.floor(
        (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    const avgRating = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.rating, 0) / performances.length
      : 0;

    return {
      totalCrew: crewMembers.length,
      activeCrew: crewMembers.filter(c => c.status === "active").length,
      expiringCerts,
      avgRating: avgRating.toFixed(1)
    };
  });

  const stats = getCrewStats();

  // Memoize certification expiry data to avoid recalculation
  const certificationsWithExpiry = useMemo(() => {
    return certifications.map(cert => {
      const daysUntilExpiry = Math.floor(
        (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...cert,
        daysUntilExpiry,
        isExpiring: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
        isExpired: daysUntilExpiry <= 0
      };
  });
  }, [certifications]);

  const filteredCrew = crewMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
    case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "on_leave": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "inactive": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Crew Management</h1>
            <p className="text-muted-foreground">Unified crew operations and performance tracking</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Crew
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCrew}</div>
            <p className="text-xs text-muted-foreground">{stats.activeCrew} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-400" />
              Active Crew
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats.activeCrew}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Expiring Certs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{stats.expiringCerts}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-400" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Crew Members</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crew members..."
              value={searchTerm}
              onChange={handleChange}
              className="max-w-sm"
            />
          </div>

          {/* Crew List */}
          <ScrollArea className="h-[600px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredCrew.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No crew members found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrew.map((member) => (
                  <Card key={member.id} className="hover:bg-zinc-800/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{member.position}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {member.rank && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Rank:</span> {member.rank}
                        </div>
                      )}
                      {member.nationality && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Nationality:</span> {member.nationality}
                        </div>
                      )}
                      {member.contact_email && (
                        <div className="text-sm text-muted-foreground truncate">
                          {member.contact_email}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {certifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No certifications found</p>
                </div>
              ) : (
                certificationsWithExpiry.map((cert) => (
                  <Card key={cert.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{cert.certification_name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>
                              <Calendar className="inline w-3 h-3 mr-1" />
                              Issued: {new Date(cert.issue_date).toLocaleDateString()}
                            </span>
                            <span>
                              Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            cert.isExpired
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : cert.isExpiring
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          };
                        >
                          {cert.isExpired ? "Expired" : cert.isExpiring ? "Expiring Soon" : "Valid"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {performances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No performance reviews found</p>
                </div>
              ) : (
                performances.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            Review Date: {new Date(review.review_date).toLocaleDateString()}
                          </h3>
                          {review.reviewer_name && (
                            <p className="text-sm text-muted-foreground">
                              By: {review.reviewer_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-bold">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {review.comments && (
                        <p className="text-sm text-muted-foreground">{review.comments}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedCrewManagement;
