"use client";


import { useRouter } from "next/navigation";
import { createPersonnel } from "@/services/personnelService";
import { useEffect, useState } from "react";
import {
  getRanks,
  getCompanies,
  getAppointments,
  getCorps,
} from "@/services/lookupService";

export default function AddPersonnelPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    army_no: "",
    full_name: "",
    rank_id: "",
    company_id: "",
    appointment_id: "",
    corps_id: "",
  });

const [ranks, setRanks] = useState<any[]>([]);
const [companies, setCompanies] = useState<any[]>([]);
const [appointments, setAppointments] = useState<any[]>([]);
const [corps, setCorps] = useState<any[]>([]);


useEffect(() => {
  async function loadData() {
    const rankData = await getRanks();
    const companyData = await getCompanies();
    const appointmentData = await getAppointments();
    const corpsData = await getCorps();

    setRanks(rankData);
    setCompanies(companyData);
    setAppointments(appointmentData);
    setCorps(corpsData);
  }

  loadData();
}, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await createPersonnel(form);

      alert("Personnel added successfully!");

      router.push("/personnel");

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="max-w-3xl rounded-xl bg-white p-8 shadow-lg">

      <h1 className="mb-6 text-3xl font-bold">
        Add Personnel
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label>Army Number</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.army_no}
            onChange={(e) =>
              setForm({
                ...form,
                army_no: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Full Name</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.full_name}
            onChange={(e) =>
              setForm({
                ...form,
                full_name: e.target.value,
              })
            }
          />
        </div>

        <div>
  <label className="block mb-1 font-medium">Rank</label>

  <select
    className="w-full rounded border p-2"
    value={form.rank_id}
    onChange={(e) =>
      setForm({
        ...form,
        rank_id: e.target.value,
      })
    }
  >
    <option value="">Select Rank</option>

    {ranks.map((rank) => (
      <option key={rank.id} value={rank.id}>
        {rank.rank_name}
      </option>
    ))}
  </select>
</div>

        <button
          className="rounded bg-emerald-700 px-5 py-2 text-white"
        >
          Save Personnel
        </button>

      </form>

    </div>
  );
}