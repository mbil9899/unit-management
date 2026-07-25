"use client";


import { useRouter } from "next/navigation";
import { createPersonnel } from "@/services/personnelService";import {
  getPersonnelById,
  updatePersonnel,
} from "@/services/personnelService";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getRanks,
  getCompanies,
  getAppointments,
  getCorps,
} from "@/services/lookupService";

export default function AddPersonnelPage() {
  const router = useRouter();
const { id } = useParams();

  const [form, setForm] = useState({
    army_no: "",
    full_name: "",
    rank_id: "",
    company_id: "",
    appointment_id: "",
    corps_id: "",
  });

useEffect(() => {
  async function loadPersonnel() {
    const data = await getPersonnelById(id as string);

    setForm({
      army_no: data.army_no || "",
      full_name: data.full_name || "",
      father_name: data.father_name || "",
      mother_name: data.mother_name || "",
      hometown: data.hometown || "",
      date_of_birth: data.date_of_birth || "",
      blood_group: data.blood_group || "",
      religion: data.religion || "",
      personal_mobile: data.personal_mobile || "",
      nok_mobile: data.nok_mobile || "",
      company_id: data.company_id?.toString() || "",
      appointment_id: data.appointment_id?.toString() || "",
      corps_id: data.corps_id?.toString() || "",
      rank_id: data.rank_id?.toString() || "",
      ipft: data.ipft || "",
      ret: data.ret || "",
      mission_medical: data.mission_medical || "",
      leave_status: data.leave_status || "",
      medical_category: data.medical_category || "",
    });
  }

  loadPersonnel();
}, [id]);


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
      await updatePersonnel(id as string, form);

      alert("Personnel updated successfully!");

      router.push("/personnel");

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  }

  return (
    <div className="max-w-3xl rounded-xl bg-white p-8 shadow-lg">

      <h1 className="mb-6 text-3xl font-bold">
        Edit Personnel
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