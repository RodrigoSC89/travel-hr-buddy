import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText
} from "lucide-react";
let XLSX: any = null;
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
};
import jsPDF from "jspdf";

interface ProjectTask {
  id: string;
  project_id: string;
  project_name: string;
  task_name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assigned_to?: string;
  start_date: string;
  end_date: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";
}

interface ProjectTimelineProps {}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = () => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ProjectTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"gantt" | "list">("gantt");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    project_name: "",
    task_name: "",
    description: "",
    status: "pending" as const,
    priority: "medium" as const,
    assigned_to: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    progress: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchDependencies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterStatus, filterPriority, filterAssignee]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .order("start_date", { ascending: true }) as any;

      if (error) throw error;
      setTasks((data || []) as any);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const { data, error } = await supabase
        .from("project_dependencies")
        .select("*") as any;

      if (error) throw error;
      setDependencies((data || []) as any);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    if (filterAssignee !== "all") {
      filtered = filtered.filter(t => t.assigned_to === filterAssignee);
    }

    setFilteredTasks(filtered);
  };

  const createTask = async () => {
    try {
      const { error } = await supabase
        .from("project_tasks")
        .insert([{
          project_id: formData.project_name, // In a real app, this would be a proper UUID
          ...formData
        }]);

      if (error) throw error;

      toast({ title: "Success", description: "Task created successfully" });
      setIsCreateOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from("project_tasks")
        .update(formData)
        .eq("id", selectedTask.id);

      if (error) throw error;

      toast({ title: "Success", description: "Task updated successfully" });
      setIsEditOpen(false);
      setSelectedTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase
        .from("project_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Task deleted successfully" });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: "",
      task_name: "",
      description: "",
      status: "pending",
      priority: "medium",
      assigned_to: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0
    });
  };

  const openEditDialog = (task: ProjectTask) => {
    setSelectedTask(task);
    setFormData({
      project_name: task.project_name,
      task_name: task.task_name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || "",
      start_date: task.start_date.split("T")[0],
      end_date: task.end_date.split("T")[0],
      progress: task.progress
    });
    setIsEditOpen(true);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTasks.map(task => ({
      "Project": task.project_name,
      "Task": task.task_name,
      "Status": task.status,
      "Priority": task.priority,
      "Assigned To": task.assigned_to || "Unassigned",
      "Start Date": new Date(task.start_date).toLocaleDateString(),
      "End Date": new Date(task.end_date).toLocaleDateString(),
      "Progress": `${task.progress}%`
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, "project_timeline.xlsx");

    toast({ title: "Success", description: "Timeline exported to Excel" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Project Timeline", 14, 20);
    
    doc.setFontSize(10);
    let yPos = 35;
    
    filteredTasks.forEach((task, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${index + 1}. ${task.task_name}`, 14, yPos);
      yPos += 5;
      doc.text(`   Project: ${task.project_name}`, 14, yPos);
      yPos += 5;
      doc.text(`   Status: ${task.status} | Priority: ${task.priority}`, 14, yPos);
      yPos += 5;
      doc.text(`   Duration: ${new Date(task.start_date).toLocaleDateString()} - ${new Date(task.end_date).toLocaleDateString()}`, 14, yPos);
      yPos += 10;
    });
    
    doc.save("project_timeline.pdf");
    toast({ title: "Success", description: "Timeline exported to PDF" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "bg-green-500";
    case "in_progress":
      return "bg-blue-500";
    case "blocked":
      return "bg-red-500";
    case "cancelled":
      return "bg-gray-500";
    default:
      return "bg-yellow-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    default:
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    }
  };

  const getDatePosition = (startDate: string, endDate: string, minDate: string, maxDate: string) => {
    const total = new Date(maxDate).getTime() - new Date(minDate).getTime();
    const start = new Date(startDate).getTime() - new Date(minDate).getTime();
    const duration = new Date(endDate).getTime() - new Date(startDate).getTime();
    
    return {
      left: `${(start / total) * 100}%`,
      width: `${(duration / total) * 100}%`
    };
  };

  const minDate = filteredTasks.length > 0 
    ? filteredTasks.reduce((min, task) => task.start_date < min ? task.start_date : min, filteredTasks[0].start_date)
    : new Date().toISOString();
  
  const maxDate = filteredTasks.length > 0
    ? filteredTasks.reduce((max, task) => task.end_date > max ? task.end_date : max, filteredTasks[0].end_date)
    : new Date().toISOString();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-8 w-8" />
                Project Timeline
              </CardTitle>
              <CardDescription>
                Manage project tasks with Gantt chart visualization and dependencies
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button
                variant={viewMode === "gantt" ? "default" : "outline"}
                onClick={() => setViewMode("gantt")}
              >
                Gantt View
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found. Create your first task to get started.
            </div>
          ) : viewMode === "gantt" ? (
            /* Gantt Chart View */
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="flex border-b pb-2 mb-4">
                    <div className="w-64 font-semibold">Task</div>
                    <div className="flex-1 font-semibold">Timeline</div>
                    <div className="w-32 font-semibold text-center">Progress</div>
                    <div className="w-24"></div>
                  </div>

                  {/* Tasks */}
                  {filteredTasks.map((task) => {
                    const position = getDatePosition(task.start_date, task.end_date, minDate, maxDate);
                    const taskDeps = dependencies.filter(d => d.task_id === task.id || d.depends_on_task_id === task.id);

                    return (
                      <div key={task.id} className="flex items-center py-3 border-b hover:bg-muted/50">
                        <div className="w-64">
                          <div className="font-medium">{task.task_name}</div>
                          <div className="text-sm text-muted-foreground">{task.project_name}</div>
                          <div className="flex gap-1 mt-1">
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority}
                            </Badge>
                            {taskDeps.length > 0 && (
                              <Badge variant="outline">
                                <LinkIcon className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="relative h-8 bg-muted rounded">
                            <div
                              className={`absolute h-full ${getStatusColor(task.status)} rounded flex items-center px-2`}
                              style={position}
                            >
                              <span className="text-xs text-white truncate">
                                {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-32 text-center">
                          <div className="text-sm font-medium">{task.progress}%</div>
                        </div>
                        <div className="w-24 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{task.task_name}</CardTitle>
                        <div className="text-sm text-muted-foreground">{task.project_name}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                        {task.assigned_to && (
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {task.assigned_to}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                        </div>
                        <div>
                          Progress: {task.progress}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedTask(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="task_name">Task Name</Label>
              <Input
                id="task_name"
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                placeholder="Enter task name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Enter assignee"
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
                setSelectedTask(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={isEditOpen ? updateTask : createTask}>
                {isEditOpen ? "Update" : "Create"} Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
