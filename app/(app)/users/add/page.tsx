"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getPersonnelWithoutAccount,
  createUser,
} from "@/services/userService";

import { getCompanies } from "@/services/lookupService";

export default function AddUserPage() {
  const router = useRouter();

  const [personnel, setPersonnel] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [form, setForm] = useState({
    personnel_id: "",

    email: "",

    password: "",

    role: "",

    company_id: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setPersonnel(await getPersonnelWithoutAccount());
    setCompanies(await getCompanies());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createUser(form);

      alert("User created successfully.");

      router.push("/users");
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-3xl">

      <h1 className="mb-6 text-3xl font-bold">
        Add User
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>

          <label>Personnel</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.personnel_id}
            onChange={(e) =>
              setForm({
                ...form,
                personnel_id: e.target.value,
              })
            }
          >

            <option value="">
              Select Personnel
            </option>

            {personnel.map((p) => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.army_no} - {p.full_name}
              </option>

            ))}

          </select>

        </div>

        <div>

          <label>Email</label>

          <input
            type="email"
            className="mt-1 w-full rounded border p-2"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label>Password</label>

          <input
            type="password"
            className="mt-1 w-full rounded border p-2"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

        </div>

        <div>

          <label>Role</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >

            <option value="">Select Role</option>

            <option value="ADMIN">
              ADMIN
            </option>

            <option value="CONTINGENT COMMANDER">
              CONTINGENT COMMANDER
            </option>

            <option value="DEPUTY CONTINGENT COMMANDER">
              DEPUTY CONTINGENT COMMANDER
            </option>

            <option value="COMPANY COMMANDER">
              COMPANY COMMANDER
            </option>

            <option value="COMPANY CLERK">
              COMPANY CLERK
            </option>

            <option value="PLATOON COMMANDER">
              PLATOON COMMANDER
            </option>

          </select>

        </div>

        <div>

          <label>Company</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.company_id}
            onChange={(e) =>
              setForm({
                ...form,
                company_id: e.target.value,
              })
            }
          >

            <option value="">
              Select Company
            </option>

            {companies.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>

            ))}

          </select>

        </div>

        <button
          className="rounded bg-emerald-700 px-5 py-2 text-white"
        >
          Create User
        </button>

      </form>

    </div>
  );
}