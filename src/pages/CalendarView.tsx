// PATCH 597: Calendar View for Smart Scheduler
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartSchedulerService } from "@/services/smart-scheduler.service";
import type { ScheduledTask } from "@/types/smart-scheduler";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

const CalendarView: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await SmartSchedulerService.getTasks({
        date_from: firstDay.toISOString(),
        date_to: lastDay.toISOString(),
      });
      setTasks(data);
    } catch (error) {
      logger.error("Error loading tasks", { error, currentMonth: currentDate.getMonth(), currentYear: currentDate.getFullYear() });
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Task Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Monthly view of scheduled tasks
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-sm p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((date, index) => {
                const dayTasks = getTasksForDate(date);
                const isToday = date && 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border rounded-lg ${
                      !date ? "bg-muted" : "bg-card hover:bg-accent"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                  >
                    {date && (
                      <>
                        <div className="font-semibold text-sm mb-2">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.map(task => (
                            <div
                              key={task.id}
                              className="text-xs p-1 rounded truncate"
                              style={{
                                backgroundColor: 
                                  task.status === "completed" ? "#22c55e20" :
                                    task.status === "overdue" ? "#ef444420" :
                                      task.status === "in_progress" ? "#3b82f620" :
                                        "#eab30820"
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {task.module}
                                </Badge>
                                <span className="truncate">{task.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
