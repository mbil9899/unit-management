"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getTasks } from "@/services/taskService";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getTasks();
      setTasks(data);
    }

    load();
  }, []);

  const filtered = tasks.filter((task) => {
    return (
      task.task_number
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      task.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Task Management
          </h1>

          <p className="text-gray-500">
            Manage all assigned tasks.
          </p>

        </div>

        <Link
          href="/tasks/add"
          className="rounded bg-emerald-700 px-5 py-2 text-white"
        >
          + Assign Task
        </Link>

      </div>

      <input
        className="w-full rounded border p-3"
        placeholder="Search Task Number or Title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Task No</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Due Date</th>

            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  No tasks found.
                </td>

              </tr>

            ) : (

              filtered.map((task) => (

                <tr
                  key={task.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">
  <Link
    href={`/tasks/${task.id}`}
    className="text-blue-700 hover:underline"
  >
    {task.task_number}
  </Link>
</td>

                  <td className="p-3">
                    {task.title}
                  </td>

                  <td className="p-3">
                    {task.personnel?.full_name ?? "-"}
                  </td>

                  <td className="p-3">
                    {task.companies?.short_name ?? "-"}
                  </td>

                  <td className="p-3">
                    {task.status}
                  </td>

                  <td className="p-3">
                    {task.due_date ?? "-"}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}