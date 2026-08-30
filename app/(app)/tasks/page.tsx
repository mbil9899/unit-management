"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTasks, deleteTask } from "@/services/taskService";

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Wait for user data to exist before running RBAC logic
    if (authLoading) return;
    if (!user) return;

    const currentRole = String(user.role).toUpperCase().trim();

    // RBAC Check: Bounce ONLY Clerks
    if (currentRole === "COMPANY CLERK") {
      router.replace("/dashboard");
      return; 
    }

    // Load Tasks for everyone else
    async function loadTaskList() {
      try {
        setLoading(true);
        const data = await getTasks();
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTaskList();
  }, [authLoading, user, router]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete task "${title}"?`)) {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task.");
      }
    }
  };

  // Safe block rendering
  if (authLoading || !user) return null;
  if (String(user.role).toUpperCase().trim() === "COMPANY CLERK") return null;

  // Multi-field search
  const filteredTasks = tasks.filter((task) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const taskNum = task.task_number?.toLowerCase() || "";
    const title = task.title?.toLowerCase() || "";
    const category = task.task_categories?.name?.toLowerCase() || "";
    const company = (
      task.companies?.name ||
      task.assigned_personnel?.companies?.name ||
      ""
    ).toLowerCase();
    const assignee = (
      task.assigned_personnel
        ? `${task.assigned_personnel.ranks?.rank_name || ""} ${
            task.assigned_personnel.full_name
          } (${task.assigned_personnel.army_no})`
        : ""
    ).toLowerCase();

    return (
      taskNum.includes(query) ||
      title.includes(query) ||
      category.includes(query) ||
      company.includes(query) ||
      assignee.includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500">
            Assign, track, and evaluate operational tasks across unit companies.
          </p>
        </div>

        <Link
          href="/tasks/add"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Assign New Task
        </Link>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by Task No, Title, Category, Company, Assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredTasks.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{tasks.length}</span>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchTerm ? (
              <>
                No tasks found matching "<span className="font-semibold">{searchTerm}</span>"
              </>
            ) : (
              "No tasks created yet."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Task No</th>
                  <th className="px-6 py-3 font-semibold">Task Title</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Assigned To</th>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Due Date</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const companyName =
                    task.companies?.name ||
                    task.assigned_personnel?.companies?.name ||
                    "-";

                  const assigneeName = task.assigned_personnel
                    ? `${task.assigned_personnel.ranks?.rank_name || ""} ${
                        task.assigned_personnel.full_name
                      }`
                    : "-";

                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-gray-500">
                        {task.task_number || task.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        <Link href={`/tasks/${task.id}`} className="hover:text-blue-600">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        {task.task_categories?.name || "-"}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {assigneeName}
                      </td>
                      <td className="px-6 py-3">
                        {companyName}
                      </td>
                      <td className="px-6 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {task.due_date || "-"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/tasks/${task.id}`}
                            className="rounded px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </Link>
                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="rounded px-2.5 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(task.id, task.title)}
                            className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = priority?.toLowerCase() || "";
  let badgeStyle = "bg-gray-100 text-gray-600 border-gray-200";

  if (p === "critical" || p === "urgent")
    badgeStyle = "bg-red-50 text-red-600 border-red-200";
  if (p === "important")
    badgeStyle = "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (p === "routine")
    badgeStyle = "bg-green-50 text-green-600 border-green-200";

  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold capitalize ${badgeStyle}`}>
      {priority || "Routine"}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "";
  let badgeStyle = "bg-gray-100 text-gray-600";

  if (s === "completed") badgeStyle = "bg-green-100 text-green-700";
  if (s === "in progress" || s === "in_progress")
    badgeStyle = "bg-sky-100 text-sky-700";
  if (s === "pending") badgeStyle = "bg-amber-100 text-amber-700";
  if (s === "cancelled") badgeStyle = "bg-red-100 text-red-700";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${badgeStyle}`}>
      {status || "Pending"}
    </span>
  );
}