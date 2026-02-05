/**
 * PMS Engine - Tier-1 Maintenance Component
 * Based on: DNV ShipManager, SERTICA, Bass Maritime
 * Features: Planned Maintenance System, running hours, class requirements
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wrench, Ship, Calendar, Clock, AlertTriangle, CheckCircle2, 
  Settings, FileText, Search, Filter, Plus, RefreshCw,
  TrendingUp, BarChart3, Timer, Target, Gauge, ArrowRight, Loader2
} from "lucide-react";
import { usePMSJobs, usePMSStats, PMSJob, PMSStats } from "@/hooks/usePMSData";

// Default stats for loading state
const defaultStats: PMSStats = {
  totalJobs: 0,
  overdue: 0,
  dueThisWeek: 0,
  dueThisMonth: 0,
  completed: 0,
  complianceRate: 100,
  classJobs: 0,
  avgCompletionTime: 0
};

export function PMSEngine() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSystem, setFilterSystem] = useState("all");
  
  // Use real data hooks
  const { data: pmsJobs = [], isLoading: jobsLoading } = usePMSJobs();
  const { data: pmsStats = defaultStats, isLoading: statsLoading } = usePMSStats();
  
  const isLoading = jobsLoading || statsLoading;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
      overdue: { variant: "destructive", label: "Overdue", className: "" },
      due: { variant: "secondary", label: "Due Now", className: "bg-amber-100 text-amber-700" },
      upcoming: { variant: "outline", label: "Upcoming", className: "border-blue-500 text-blue-600" },
      completed: { variant: "secondary", label: "Completed", className: "bg-emerald-100 text-emerald-700" },
      in_progress: { variant: "secondary", label: "In Progress", className: "bg-purple-100 text-purple-700" }
    };
    const config = statusMap[status] || statusMap.upcoming;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, string> = {
      critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    };
    return <Badge className={priorityMap[priority] || priorityMap.medium}>{priority}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  const getHoursProgress = (current: number, due: number) => {
    const percent = (current / due) * 100;
    return Math.min(percent, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            PMS Engine
          </h2>
          <p className="text-muted-foreground">
            Planned Maintenance System with running hours and class requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Hours
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{pmsStats.totalJobs}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{pmsStats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{pmsStats.dueThisWeek}</p>
              <p className="text-xs text-muted-foreground">Due This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{pmsStats.dueThisMonth}</p>
              <p className="text-xs text-muted-foreground">Due This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{pmsStats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{pmsStats.complianceRate}%</p>
              <p className="text-xs text-muted-foreground">Compliance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{pmsStats.classJobs}</p>
              <p className="text-xs text-muted-foreground">Class Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{pmsStats.avgCompletionTime}h</p>
              <p className="text-xs text-muted-foreground">Avg Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by code, title, or component..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Job List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="hours">Running Hours</TabsTrigger>
          <TabsTrigger value="class">Class Requirements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Jobs</CardTitle>
              <CardDescription>All planned maintenance jobs sorted by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {pmsJobs.map((job) => (
                    <Card 
                      key={job.id}
                      className={`hover:shadow-md transition-shadow ${
                        job.status === "overdue" ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" :
                        job.status === "due" ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="font-mono">{job.jobCode}</Badge>
                              <h4 className="font-semibold">{job.title}</h4>
                              {getStatusBadge(job.status)}
                              {getPriorityBadge(job.priority)}
                              {job.classRequired && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                  <Ship className="h-3 w-3 mr-1" />
                                  Class
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Component</p>
                                <p className="font-medium">{job.component}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">System</p>
                                <p className="font-medium">{job.system}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Interval</p>
                                <p className="font-medium">
                                  {job.interval.hours ? `${job.interval.hours.toLocaleString()} hrs` : ""}
                                  {job.interval.days ? `${job.interval.days} days` : ""}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Assigned To</p>
                                <p className="font-medium">{job.assignedTo || "Unassigned"}</p>
                              </div>
                            </div>

                            {/* Running hours progress */}
                            {job.currentHours && job.dueHours && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Running Hours: {job.currentHours.toLocaleString()}</span>
                                  <span>Due at: {job.dueHours.toLocaleString()}</span>
                                </div>
                                <Progress 
                                  value={getHoursProgress(job.currentHours, job.dueHours)} 
                                  className={`h-2 ${
                                    job.currentHours > job.dueHours ? "[&>div]:bg-red-500" : ""
                                  }`}
                                />
                              </div>
                            )}

                            {/* Dates */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              {job.lastDone && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Last: {formatDate(job.lastDone)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Next: {formatDate(job.nextDue)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Est. {job.estimatedTime}h
                              </span>
                            </div>
                          </div>

                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Maintenance Calendar
              </CardTitle>
              <CardDescription>Visual calendar view of scheduled maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Interactive maintenance calendar coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Running Hours Monitoring
              </CardTitle>
              <CardDescription>Track running hours across all equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { name: "Main Engine", hours: 45230, limit: 50000, status: "normal" },
                  { name: "Aux Gen 1", hours: 11850, limit: 12000, status: "warning" },
                  { name: "Aux Gen 2", hours: 9420, limit: 12000, status: "normal" },
                  { name: "Boiler 1", hours: 38500, limit: 40000, status: "warning" },
                  { name: "Boiler 2", hours: 22100, limit: 40000, status: "normal" },
                  { name: "Steering Gear", hours: 15600, limit: 20000, status: "normal" }
                ].map((equip) => (
                  <div key={equip.name} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{equip.name}</h4>
                      <Badge variant={equip.status === "warning" ? "secondary" : "outline"} className={equip.status === "warning" ? "bg-amber-100 text-amber-700" : ""}>
                        {equip.status === "warning" ? "Approaching" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{equip.hours.toLocaleString()} hrs</span>
                      <span className="text-muted-foreground">{equip.limit.toLocaleString()} hrs limit</span>
                    </div>
                    <Progress 
                      value={(equip.hours / equip.limit) * 100} 
                      className={`h-3 ${equip.status === "warning" ? "[&>div]:bg-amber-500" : ""}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {equip.limit - equip.hours} hours remaining
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Class Requirements
              </CardTitle>
              <CardDescription>Classification society survey requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pmsJobs.filter(j => j.classRequired).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">{job.jobCode}</Badge>
                        <h4 className="font-semibold">{job.title}</h4>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{job.component}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Due: {formatDate(job.nextDue)}</p>
                      <p className="text-sm text-muted-foreground">Class Survey Required</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Maintenance Analytics
              </CardTitle>
              <CardDescription>Performance metrics and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Jobs by System</h4>
                  <div className="space-y-3">
                    {[
                      { system: "Main Engine", jobs: 45, percent: 35 },
                      { system: "Power Generation", jobs: 32, percent: 25 },
                      { system: "Navigation", jobs: 28, percent: 22 },
                      { system: "Life Saving", jobs: 18, percent: 14 },
                      { system: "HVAC", jobs: 12, percent: 9 }
                    ].map((item) => (
                      <div key={item.system}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.system}</span>
                          <span className="font-medium">{item.jobs} jobs</span>
                        </div>
                        <Progress value={item.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Monthly Compliance Trend</h4>
                  <div className="space-y-4">
                    {[
                      { month: "January", rate: 97.2 },
                      { month: "December", rate: 95.8 },
                      { month: "November", rate: 96.5 },
                      { month: "October", rate: 94.1 }
                    ].map((item) => (
                      <div key={item.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span>{item.month}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={item.rate} className="w-24 h-2" />
                          <span className="font-medium text-emerald-600">{item.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
