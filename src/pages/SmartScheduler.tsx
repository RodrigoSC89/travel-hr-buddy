// @ts-nocheck
// PATCH 597: Smart Scheduler Page
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartSchedulerService } from '@/services/smart-scheduler.service';
import type { ScheduledTask, TaskModule, TaskStatus } from '@/types/smart-scheduler';
import { toast } from 'sonner';

const SmartScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<TaskModule | 'all'>('all');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [selectedModule]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filter = selectedModule !== 'all' ? { module: selectedModule as TaskModule } : {};
      const data = await SmartSchedulerService.getTasks(filter);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await SmartSchedulerService.getTaskStatsByModule();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleGenerateTasks = async () => {
    try {
      toast.info('Generating tasks with AI...');
      const module = selectedModule !== 'all' ? selectedModule as TaskModule : 'PSC';
      const response = await SmartSchedulerService.generateTasks({ module });
      
      if (response.tasks.length > 0) {
        // Create the generated tasks
        for (const task of response.tasks) {
          await SmartSchedulerService.createTask({
            ...task,
            ai_generated: true,
          });
        }
        toast.success(`Generated ${response.tasks.length} tasks`);
        loadTasks();
      } else {
        toast.info('No tasks to generate at this time');
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error('Failed to generate tasks');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await SmartSchedulerService.completeTask(taskId);
      toast.success('Task completed');
      loadTasks();
      loadStats();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const modules: Array<TaskModule | 'all'> = ['all', 'PSC', 'MLC', 'LSA', 'OVID'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Smart Scheduler
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered task scheduling and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateTasks}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Tasks
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {modules.filter(m => m !== 'all').map((module) => {
          const moduleStat = stats[module] || { total: 0, pending: 0, completed: 0, overdue: 0 };
          return (
            <Card key={module}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{module}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moduleStat.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {moduleStat.pending} pending • {moduleStat.completed} completed
                  {moduleStat.overdue > 0 && ` • ${moduleStat.overdue} overdue`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module Tabs */}
      <Tabs value={selectedModule} onValueChange={(v) => setSelectedModule(v as TaskModule | 'all')}>
        <TabsList>
          {modules.map((module) => (
            <TabsTrigger key={module} value={module}>
              {module.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedModule} className="space-y-4 mt-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading tasks...</p>
              </CardContent>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {task.title}
                          {task.ai_generated && (
                            <Badge variant="outline" className="text-xs">AI Generated</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {task.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <Badge variant="secondary">{task.module}</Badge>
                        {task.status === 'overdue' && (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            Overdue
                          </div>
                        )}
                      </div>
                      {task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartScheduler;
