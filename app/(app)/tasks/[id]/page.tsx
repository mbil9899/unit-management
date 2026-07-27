"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTaskById } from "@/services/taskService";

export default function TaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getTaskById(params.id);
      setTask(data);
    }

    load();
  }, [params.id]);

  if (!task) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-5xl space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          {task.task_number}
        </h1>

        <p className="text-xl text-gray-600">
          {task.title}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-6 rounded-lg border bg-white p-6">

        <div>
          <strong>Category</strong>
          <p>{task.task_categories?.name ?? "-"}</p>
        </div>

        <div>
          <strong>Company</strong>
          <p>{task.companies?.name ?? "-"}</p>
        </div>

        <div>
          <strong>Assigned To</strong>
          <p>{task.personnel?.full_name ?? "-"}</p>
        </div>

        <div>
          <strong>Assigned By</strong>
          <p>{task.user_profiles?.full_name ?? "-"}</p>
        </div>

        <div>
          <strong>Status</strong>
          <p>{task.status}</p>
        </div>

        <div>
          <strong>Start Date</strong>
          <p>{task.start_date ?? "-"}</p>
        </div>

        <div>
          <strong>Due Date</strong>
          <p>{task.due_date ?? "-"}</p>
        </div>

        <div>
          <strong>Completion Date</strong>
          <p>{task.completion_date ?? "-"}</p>
        </div>

        <div>
          <strong>Evaluation</strong>
          <p>{task.evaluation ?? "-"}</p>
        </div>

      </div>

      <div className="rounded-lg border bg-white p-6">

        <h2 className="mb-2 text-xl font-semibold">
          Description
        </h2>

        <p>{task.description || "-"}</p>

      </div>

      <div className="rounded-lg border bg-white p-6">

        <h2 className="mb-2 text-xl font-semibold">
          Remarks
        </h2>

        <p>{task.remarks || "-"}</p>

      </div>

      <div className="flex gap-4">

        <Link
          href={`/tasks/${task.id}/edit`}
          className="rounded bg-blue-700 px-5 py-2 text-white hover:bg-blue-800"
        >
          Edit
        </Link>

        <button
          className="rounded bg-green-700 px-5 py-2 text-white hover:bg-green-800"
        >
          Mark Completed
        </button>

      </div>

    </div>
  );
}