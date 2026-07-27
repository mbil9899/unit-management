"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const profile = await getCurrentUser();
      console.log(profile);
      setUser(profile);
    }

    load();
  }, []);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <div className="mt-6 rounded border bg-white p-6">

        <p><strong>Name:</strong> {user.full_name}</p>

        <p><strong>Email:</strong> {user.email}</p>

        <p><strong>Role:</strong> {user.role}</p>

        <p><strong>Company:</strong> {user.companies?.name}</p>

        <p><strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}</p>

      </div>

    </div>
  );
}