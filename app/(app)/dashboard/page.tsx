"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalPersonnel: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        const userRole = user?.role ? String(user.role).toUpperCase() : "";

        // 1. Fetch Personnel Count
        let personnelQuery = supabase
          .from("personnel")
          .select("*", { count: "exact", head: true });

        if (
          (userRole === "COMPANY COMMANDER" || userRole === "COMPANY CLERK") &&
          user?.company_id
        ) {
          personnelQuery = personnelQuery.eq("company_id", user.company_id);
        }

        const { count: personnelCount } = await personnelQuery;

        // 2. Fetch Tasks List
        let tasksQuery = supabase
          .from("tasks")
          .select(`
            *,
            companies(name),
            assigned_personnel:personnel!tasks_assigned_to_fkey(
              full_name,
              ranks(rank_name)
            )
          `)
          .order("created_at", { ascending: false });

        if (
          (userRole === "COMPANY COMMANDER" || userRole === "COMPANY CLERK") &&
          user?.company_id
        ) {
          tasksQuery = tasksQuery.eq("company_id", user.company_id);
        }

        const { data: tasksData, error: tErr } = await tasksQuery;
        if (tErr) console.error("Error fetching tasks:", tErr);

        const tasks = tasksData || [];

        const pending = tasks.filter(
          (t) => t.status?.toLowerCase() === "pending"
        ).length;
        const inProgress = tasks.filter(
          (t) =>
            t.status?.toLowerCase() === "in progress" ||
            t.status?.toLowerCase() === "in_progress"
        ).length;
        const completed = tasks.filter(
          (t) => t.status?.toLowerCase() === "completed"
        ).length;

        setStats({
          totalPersonnel: personnelCount || 0,
          totalTasks: tasks.length,
          pendingTasks: pending,
          inProgressTasks: inProgress,
          completedTasks: completed,
        });

        setRecentTasks(tasks.slice(0, 5));
      } catch (err: any) {
        console.error("Dashboard Load Error:", err);
        setErrorMsg(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading]);

  // Derived user details for the UI
  const displayRole = user?.role ? String(user.role).toUpperCase() : "CONTINGENT COMMANDER";
  const displayName = user?.personnel?.full_name 
    ? user.personnel.full_name.split(" ")[0] // First name
    : "Contingent Commander";
    
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FB] text-gray-400">
        <div className="text-sm font-medium animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="text-red-500 font-medium">{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 lg:p-10 font-sans">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ========================================= */}
        {/* LEFT COLUMN (MAIN CONTENT)                */}
        {/* ========================================= */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Hello, {displayName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track unit progress and operations here. You are on track!
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              {today}
              <span className="text-gray-400 ml-1">📅</span>
            </div>
          </div>

          {/* Clean Stats Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {/* Stat 1 */}
            <div className="flex-1 w-full flex items-center gap-5 sm:px-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Tasks</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{stats.totalTasks}</span>
                  <span className="text-xs font-semibold text-gray-400">assigned</span>
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex-1 w-full flex items-center gap-5 sm:px-6 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl">
                ✅
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Completed</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{stats.completedTasks}</span>
                  <span className="text-xs font-semibold text-green-500">done</span>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex-1 w-full flex items-center gap-5 sm:px-6 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">In Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{stats.inProgressTasks}</span>
                  <span className="text-xs font-semibold text-orange-500">active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Tasks List */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Current Tasks</h2>
                <span className="text-sm font-medium text-gray-400 border-l border-gray-200 pl-4">
                  Recent {recentTasks.length}
                </span>
              </div>
              <Link href="/tasks" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  No tasks available right now.
                </div>
              ) : (
                recentTasks.map((task, index) => (
                  <Link 
                    href={`/tasks/${task.id}`} 
                    key={task.id}
                    className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getIconColor(index)}`}>
                        {getTaskIcon(index)}
                      </div>
                      {/* Title & Assignee */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                          {task.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {task.assigned_personnel 
                            ? `${task.assigned_personnel.ranks?.rank_name || ""} ${task.assigned_personnel.full_name}`
                            : task.companies?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>

                    {/* Status, Priority, & Time (Updated Layout) */}
                    <div className="flex items-center gap-8">
                      {/* 1. New dynamic Priority Badge */}
                      <div className={`flex items-center justify-center px-3 py-1 rounded-md border text-xs font-bold capitalize ${getPriorityBadgeStyle(task.priority)}`}>
                        {task.priority || "Routine"}
                      </div>

                      {/* 2. Existing StatusDot div */}
                      <div className="hidden md:flex items-center gap-2 w-28">
                        <StatusDot status={task.status} />
                        <span className="text-xs font-semibold text-gray-600 capitalize">
                          {task.status || "Pending"}
                        </span>
                      </div>

                      {/* 3. Updated Due Date display with prefix */}
                      <div className="text-xs font-medium text-gray-500 w-32 text-right flex items-baseline justify-end gap-1.5">
                        <span className="text-gray-400 font-normal">Due:</span>
                        <span className="font-semibold text-gray-600">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "No Due"}
                        </span>
                      </div>

                      <div className="text-gray-300 group-hover:text-gray-600 transition">
                        •••
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN (PROFILE & ACTIVITY)         */}
        {/* ========================================= */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Profile Card */}
          <div className="bg-[#F2F1F6] rounded-[2.5rem] p-8 flex flex-col items-center text-center">
            
            {/* UPDATED: Increased from w-24 h-24 to w-32 h-32 for a noticeably larger logo */}
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden mb-4 relative flex items-center justify-center">
              <img 
                src={user?.personnel?.photo_url || "/logo.png"} 
                alt="Profile" 
                className={user?.personnel?.photo_url ? "w-full h-full object-cover" : "w-full h-full object-contain p-1.5"}
              />
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">
              {user?.personnel?.ranks?.rank_name ? `${user.personnel.ranks.rank_name} ` : ""} 
              {user?.personnel?.full_name || "Contingent Commander"}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
              {displayRole}
            </p>

            <div className="flex gap-3 mt-6 w-full px-4">
              <Link href="/tasks/add" className="flex-1 bg-white hover:bg-gray-50 transition border border-gray-200 text-gray-800 text-sm font-bold py-2.5 rounded-full flex justify-center items-center gap-2">
                ✏️ Assign Task
              </Link>
            </div>
          </div>

          {/* Quick Stats / Info Widget */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Unit Overview</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                  👥
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Personnel</p>
                  <p className="text-sm font-bold text-gray-900">{stats.totalPersonnel} Active Members</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  ⏳
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Pending Tasks</p>
                  <p className="text-sm font-bold text-gray-900">{stats.pendingTasks} Awaiting Action</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Helper Components for Styling ---

function StatusDot({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "";
  if (s === "completed") return <span className="w-2 h-2 rounded-full bg-green-500"></span>;
  if (s === "in progress" || s === "in_progress") return <span className="w-2 h-2 rounded-full bg-orange-400"></span>;
  if (s === "cancelled") return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
  return <span className="w-2 h-2 rounded-full bg-gray-300"></span>; // Pending
}

/**
 * Returns dynamic styling for task priority badges.
 */
function getPriorityBadgeStyle(priority: string) {
  const p = priority?.toLowerCase() || "";
  switch (p) {
    case "critical":
      return "bg-red-50 text-red-700 border-red-100";
    case "urgent":
      return "bg-orange-50 text-orange-700 border-orange-100";
    case "important":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "routine":
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

function getTaskIcon(index: number) {
  const icons = ["🎯", "🔍", "🛠️", "📝", "🚀"];
  return icons[index % icons.length];
}

function getIconColor(index: number) {
  const colors = [
    "bg-indigo-50 text-indigo-500 border-indigo-100",
    "bg-amber-50 text-amber-500 border-amber-100",
    "bg-emerald-50 text-emerald-500 border-emerald-100",
    "bg-sky-50 text-sky-500 border-sky-100",
    "bg-purple-50 text-purple-500 border-purple-100"
  ];
  return colors[index % colors.length];
}