"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import {
  getRanks,
  getCompanies,
  getAppointments,
  getCorps,
  getPlatoonsByCompany,
} from "@/services/lookupService";

export default function AddTaskPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [platoons, setPlatoons] = useState<any[]>([]);

const [form, setForm] = useState({
  title: "",
  description: "",

  category_id: "",

  assigned_to: "",

  assigned_by: "",

  company_id: "",

  status: "Pending",

  start_date: "",

  due_date: "",

  completion_date: "",

  evaluation: "",

  remarks: "",
});

useEffect(() => {
  async function load() {
    setCategories(await getTaskCategories());
    setCompanies(await getCompanies());
  }

  load();
}, []);



async function handleCompanyChange(companyId: string) {
  setForm((prev) => ({
    ...prev,
    company_id: companyId,
    platoon_id: "",
    assigned_to: "",
  }));

  if (!companyId) {
    setPlatoons([]);
    setPersonnel([]);
    return;
  }

  const platoonData = await getPlatoonsByCompany(Number(companyId));
  setPlatoons(platoonData);

  const personnelData = await getPersonnelByCompany(Number(companyId));
  setPersonnel(personnelData);
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

try {
  const payload = {
  title: form.title,
  description: form.description || null,

  category_id: form.category_id
    ? Number(form.category_id)
    : null,

  company_id: form.company_id
    ? Number(form.company_id)
    : null,

  assigned_to: form.assigned_to || null,

  assigned_by: null, // Login system not implemented yet

  status: form.status,

  start_date: form.start_date || null,

  due_date: form.due_date || null,

  completion_date: form.completion_date || null,

  evaluation: form.evaluation || null,

  remarks: form.remarks || null,
};

console.log(payload);

  await createTask(payload);


      alert("Task created successfully.");

      router.push("/tasks");
    } catch (err) {
  console.error("Supabase Error:", err);

  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert(JSON.stringify(err));
  }
}
  }

  return (
    <div className="max-w-4xl">

      <h1 className="mb-6 text-3xl font-bold">
        Assign Task
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
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <select
          className="w-full rounded border p-2"
          value={form.category_id}
          onChange={(e) =>
            setForm({
              ...form,
              category_id: e.target.value,
            })
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
  value={form.assigned_to ?? ""}
  onChange={(e) =>
    setForm({
      ...form,
      assigned_to: e.target.value || null,
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

        <button className="rounded bg-emerald-700 px-5 py-2 text-white">
          Save Task
        </button>

      </form>

    </div>
  );
}