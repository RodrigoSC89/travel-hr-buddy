/**
 * Template Editor Page
 * PATCH CLEANUP: Removed @ts-nocheck
 */
import React from "react";
import CompleteTemplateEditor from "@/modules/templates";
import { RoleBasedAccess } from "@/components/auth/role-based-access";

export default function TemplateEditorPage() {
  return (
    <RoleBasedAccess roles={["admin", "hr_manager", "manager"]}>
      <CompleteTemplateEditor />
    </RoleBasedAccess>
  );
}
