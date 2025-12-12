/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 161.0 - Offline Checklist Component
 * Operational checklists that work offline-first
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, WifiOff, Cloud, AlertCircle } from "lucide-react";
import { sqliteStorage } from "../services/sqlite-storage";
import { MobileChecklist, ChecklistItem } from "../types";
import { toast } from "sonner";

interface OfflineChecklistProps {
  checklist: MobileChecklist;
  onUpdate: (checklist: MobileChecklist) => void;
  isOnline: boolean;
}

export const OfflineChecklist: React.FC<OfflineChecklistProps> = ({
  checklist,
  onUpdate,
  isOnline
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(checklist.items);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setItems(checklist.items);
  }, [checklist.items]);

  const handleToggleItem = async (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    setItems(updatedItems);

    const updatedChecklist: MobileChecklist = {
      ...checklist,
      items: updatedItems,
      completed: updatedItems.every(item => item.checked),
      lastModified: Date.now(),
      syncStatus: "pending"
    };

    // Save locally first
    try {
      await sqliteStorage.save(
        "checklists",
        updatedChecklist,
        "update",
        "high"
      );

      onUpdate(updatedChecklist);

      if (!isOnline) {
        toast.info("Checklist saved offline. Will sync when online.");
      } else {
        toast.success("Checklist updated");
      }
    } catch (error) {
      console.error("Failed to save checklist:", error);
      toast.error("Failed to save checklist");
    }
  };

  const handleAddNote = async (itemId: string, note: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, notes: note } : item
    );

    setItems(updatedItems);

    const updatedChecklist: MobileChecklist = {
      ...checklist,
      items: updatedItems,
      lastModified: Date.now(),
      syncStatus: "pending"
    };

    await sqliteStorage.save(
      "checklists",
      updatedChecklist,
      "update",
      "medium"
    );

    onUpdate(updatedChecklist);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
    case "operational": return "bg-blue-500";
    case "safety": return "bg-red-500";
    case "maintenance": return "bg-yellow-500";
    case "inspection": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getSyncStatusIcon = () => {
    switch (checklist.syncStatus) {
    case "synced":
      return <Cloud className="h-4 w-4 text-green-500" />;
    case "pending":
      return <WifiOff className="h-4 w-4 text-yellow-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
    }
  };

  const progress = (items.filter(item => item.checked).length / items.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{checklist.title}</CardTitle>
            {getSyncStatusIcon()}
          </div>
          <Badge className={getCategoryColor(checklist.category)}>
            {checklist.category}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{Math.round(progress)}% Complete</span>
            <span>{items.filter(i => i.checked).length}/{items.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progress === 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={item.id}
                    className={`text-sm font-medium cursor-pointer ${
                      item.checked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.text}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {/* Notes section */}
                  <div className="mt-2">
                    <Textarea
                      placeholder="Add notes..."
                      value={notes[item.id] || item.notes || ""}
                      onChange={handleChange});
                      }}
                      onBlur={() => {
                        if (notes[item.id] !== item.notes) {
                          handleAddNote(item.id, notes[item.id] || "");
                        }
                      }}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Working offline. Changes will sync when online.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
