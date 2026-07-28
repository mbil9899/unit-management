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
  const [search, setSearch] = useState("");

const [filteredPersonnel, setFilteredPersonnel] = useState<any[]>([]);

const [form, setForm] = useState({
  title: "",
  description: "",

  category_id: "",

  assigned_to: "",

  assigned_by: "",

  company_id: "",

  platoon_id: "",

  priority: "Routine",

  status: "Pending",

  due_date: "",

  notes: "",
});
useEffect(() => {
  async function load() {
    setCategories(await getTaskCategories());
    setCompanies(await getCompanies());
  }

  load();
}, []);



useEffect(() => {
  if (!search) {
    setFilteredPersonnel(personnel);
    return;
  }

  const value = search.toLowerCase();

  setFilteredPersonnel(
    personnel.filter(
      (p) =>
        p.full_name.toLowerCase().includes(value) ||
        p.army_no.toLowerCase().includes(value)
    )
  );
}, [search, personnel]);


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
setFilteredPersonnel(personnelData);
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

  platoon_id: form.platoon_id
    ? Number(form.platoon_id)
    : null,

  assigned_to: form.assigned_to || null,

  assigned_by: null,

  priority: form.priority,

  status: form.status,

  due_date: form.due_date || null,

  notes: form.notes || null,
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

        <div>


<div>
  <label>Priority</label>

  <select
    className="mt-1 w-full rounded border p-2"
    value={form.priority}
    onChange={(e) =>
      setForm({
        ...form,
        priority: e.target.value,
      })
    }
  >
    <option value="Routine">Routine</option>
    <option value="Important">Important</option>
    <option value="Urgent">Urgent</option>
    <option value="Critical">Critical</option>
  </select>
</div>






<label>Assigned To</label>

<input
  className="mt-1 w-full rounded border p-2"
  placeholder="Search by Army No or Name"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<div className="mt-2 max-h-60 overflow-y-auto rounded border">

  {filteredPersonnel.map((person) => (

    <button
      type="button"
      key={person.id}
      className={`block w-full border-b px-3 py-2 text-left hover:bg-gray-100 ${
        form.assigned_to === person.id
          ? "bg-emerald-100"
          : ""
      }`}
      onClick={() =>
        setForm({
          ...form,
          assigned_to: person.id,
        })
      }
    >

      <div className="font-medium">

        {person.army_no}

        {" - "}

        {person.full_name}

      </div>

      <div className="text-sm text-gray-500">

        {person.companies?.short_name}

        {person.platoons?.platoon_name}

      </div>

    </button>

  ))}

</div>

</div>



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

        <div>
  <label>Notes</label>

  <textarea
    rows={4}
    className="mt-1 w-full rounded border p-2"
    placeholder="Additional notes"
    value={form.notes}
    onChange={(e) =>
      setForm({
        ...form,
        notes: e.target.value,
      })
    }
  />
</div>

        <button className="rounded bg-emerald-700 px-5 py-2 text-white">
          Save Task
        </button>

      </form>

    </div>
  );
}