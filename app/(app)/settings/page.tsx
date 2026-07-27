"use client";

import RoleGuard from "@/components/RoleGuard";
import { canManageSettings } from "@/services/permissionService";

export default function SettingsPage() {
  return (
    <RoleGuard allow={canManageSettings}>
      <div className="p-6">

        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-4 text-gray-600">
          Only administrators can access this page.
        </p>

      </div>
    </RoleGuard>
  );
}