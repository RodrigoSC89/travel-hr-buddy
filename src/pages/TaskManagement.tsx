import React from "react";
import { TaskManagement } from "@/components/tasks/task-management";

export default function TaskManagementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <TaskManagement />
    </div>
  );
}