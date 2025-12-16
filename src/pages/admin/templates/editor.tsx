// @ts-nocheck
import React from "react";
import CompleteTemplateEditor from "@/modules/templates";
import { RoleBasedAccess } from "@/components/auth/role-based-access";

export default function TemplateEditorPage() {
  return (
    <RoleBasedAccess allowedRoles={["admin", "hr", "manager"]}>
      <CompleteTemplateEditor />
    </RoleBasedAccess>
  );
}
