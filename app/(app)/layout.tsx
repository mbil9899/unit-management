"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { signOut } from "@/services/authService";
import AuthGuard from "@/components/AuthGuard";

import { useAuth } from "@/contexts/AuthContext";

import {
  canAssignTasks,
  canManageSettings,
  canManageUsers,
} from "@/services/permissionService";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, loading } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to logout.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">

        {/* Header */}

        <header className="flex items-center justify-between bg-emerald-800 px-8 py-4 text-white shadow">

          <div>

            <h1 className="text-2xl font-bold">
              BANRDB-9
            </h1>

            <p className="text-sm text-emerald-100">
              Task Management System
            </p>

            <p className="mt-2 text-xs">
              {user?.full_name}
            </p>

            <p className="text-xs">
              {user?.role}
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-5 py-2 font-medium hover:bg-red-700"
          >
            Logout
          </button>

        </header>

        {/* Navigation */}

        <nav className="flex gap-6 border-b bg-white px-8 py-4 shadow-sm">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/personnel">
            Personnel
          </Link>

          {canAssignTasks(user) && (
            <Link href="/tasks">
              Tasks
            </Link>
          )}

          {canManageUsers(user) && (
            <Link href="/users">
              Users
            </Link>
          )}

          <Link href="/reports">
            Reports
          </Link>

          {canManageSettings(user) && (
            <Link href="/settings">
              Settings
            </Link>
          )}

        </nav>

        <main className="p-8">
          {children}
        </main>

      </div>
    </AuthGuard>
  );
}