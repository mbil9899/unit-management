"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getTaskById,
  updateTask,
  getCompanies,
  getPersonnelByCompany,
  getTaskCategories,
} from "@/services/taskService";

export default function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);  
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    category_id: "",
    company_id: "",
    assigned_to: "",
    assigned_by: "",
    status: "Pending",
    start_date: "",
    due_date: "",
    completion_date: "",
    evaluation: "",
    remarks: "",
  });

  useEffect(() => {
    async function load() {
      const task = await getTaskById(id);
      console.log(task);

      const categoryData = await getTaskCategories();
      const companyData = await getCompanies();
      console.log("Companies:", companyData);

      setCategories(categoryData);
      setCompanies(companyData);

      if (task.company_id) {
        const p = await getPersonnelByCompany(task.company_id);
        setPersonnel(p);
      }

      setForm({
        title: task.title ?? "",
        description: task.description ?? "",
        category_id: task.category_id ?? "",
        company_id: task.company_id ?? "",
        assigned_to: task.assigned_to ?? "",
        assigned_by: task.assigned_by ?? "",
        status: task.status ?? "Pending",
        start_date: task.start_date ?? "",
        due_date: task.due_date ?? "",
        completion_date: task.completion_date ?? "",
        evaluation: task.evaluation ?? "",
        remarks: task.remarks ?? "",
      });

      setLoading(false);
    }

    load();
  }, [id]);

  async function handleCompanyChange(companyId: string) {
    setForm({
      ...form,
      company_id: companyId,
      assigned_to: "",
    });

    if (companyId) {
      const data = await getPersonnelByCompany(Number(companyId));
      setPersonnel(data);
    } else {
      setPersonnel([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      console.log("Route ID:", id);
console.log("Form:", form);
console.log("Payload:", payload);


await updateTask(id, form);

const { data, error } = await supabase
  .from("tasks")
  .update(payload)
  .eq("id", id)
  .select()
  .single();

console.log(data);
console.log(error);


      alert("Task updated successfully.");

      router.push(`/tasks/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update task.");
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl">

      <h1 className="mb-6 text-3xl font-bold">
        Edit Task
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        <input
          className="w-full rounded border p-2"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          className="w-full rounded border p-2"
          value={form.category_id}
          onChange={(e) =>
            setForm({ ...form, category_id: e.target.value })
          }
        >
          <option value="">Select Category</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded border p-2"
          value={form.company_id}
          onChange={(e) =>
            handleCompanyChange(e.target.value)
          }
        >
          <option value="">Select Company</option>

          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded border p-2"
          value={form.assigned_to}
          onChange={(e) =>
            setForm({
              ...form,
              assigned_to: e.target.value,
            })
          }
        >
          <option value="">Assign Personnel</option>

          {personnel.map((p) => (
            <option key={p.id} value={p.id}>
              {p.army_no} - {p.full_name}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded border p-2"
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        <input
          type="date"
          className="w-full rounded border p-2"
          value={form.start_date}
          onChange={(e) =>
            setForm({
              ...form,
              start_date: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="w-full rounded border p-2"
          value={form.due_date}
          onChange={(e) =>
            setForm({
              ...form,
              due_date: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="w-full rounded border p-2"
          value={form.completion_date}
          onChange={(e) =>
            setForm({
              ...form,
              completion_date: e.target.value,
            })
          }
        />

        <select
          className="w-full rounded border p-2"
          value={form.evaluation}
          onChange={(e) =>
            setForm({
              ...form,
              evaluation: e.target.value,
            })
          }
        >
          <option value="">Select Evaluation</option>
          <option>Excellent</option>
          <option>Good</option>
          <option>Satisfactory</option>
          <option>Poor</option>
        </select>

        <textarea
          className="w-full rounded border p-2"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) =>
            setForm({
              ...form,
              remarks: e.target.value,
            })
          }
        />

        <button className="rounded bg-blue-700 px-5 py-2 text-white hover:bg-blue-800">
          Save Changes
        </button>

      </form>

    </div>
  );
}