"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCompanies,
} from "@/services/lookupService";

import {
  createUser,
} from "@/services/userService";

export default function AddUserPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);

  const [form, setForm] = useState({
  full_name: "",
  email: "",
  password: "",
  role: "Company Commander",
  company_id: "",
  is_active: true,
});

  useEffect(() => {
    async function load() {
      const data = await getCompanies();
      setCompanies(data);
    }

    load();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await createUser({
        ...form,
        company_id: form.company_id
          ? Number(form.company_id)
          : null,
      });

      alert("User created successfully.");

      router.push("/users");

    } catch (err) {
      console.error(err);
      alert("Failed to create user.");
    }
  }

  return (
    <div className="max-w-3xl rounded-xl bg-white p-8 shadow">

      <h1 className="mb-8 text-3xl font-bold">
        Add User
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label>Full Name</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.full_name}
            onChange={(e)=>
              setForm({
                ...form,
                full_name:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            className="mt-1 w-full rounded border p-2"
            value={form.email}
            onChange={(e)=>
              setForm({
                ...form,
                email:e.target.value
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
  className="w-full rounded border p-2"
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

  <option value="PLATOON COMMANDER">
    PLATOON COMMANDER
  </option>

  <option value="COMPANY CLERK">
    COMPANY CLERK
  </option>
</select>


        </div>

        <div>
          <label>Company</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.company_id}
            onChange={(e)=>
              setForm({
                ...form,
                company_id:e.target.value
              })
            }
          >
            <option value="">
              Select Company
            </option>

            {companies.map((company)=>(
              <option
                key={company.id}
                value={company.id}
              >
                {company.name}
              </option>
            ))}

          </select>
        </div>

        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e)=>
              setForm({
                ...form,
                is_active:e.target.checked
              })
            }
          />

          <label>
            Active User
          </label>

        </div>

        <button
          className="rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
        >
          Save User
        </button>

      </form>

    </div>
  );
}