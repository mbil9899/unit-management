"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getPersonnelById,
  updatePersonnel,
  uploadPersonnelPhoto,
} from "@/services/personnelService";

export default function EditPersonnelPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [ranks, setRanks] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [platoons, setPlatoons] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [corpsList, setCorpsList] = useState<any[]>([]);

  const [form, setForm] = useState({
    army_no: "",
    rank_id: "",
    full_name: "",
    father_name: "",
    mother_name: "",
    hometown: "",
    date_of_birth: "",
    blood_group: "",
    religion: "",
    personal_mobile: "",
    nok_mobile: "",
    company_id: "",
    platoon_id: "",
    appointment_id: "",
    corps_id: "",
    ipft: "",
    ret: "",
    mission_medical: "",
    leave_status: "",
    medical_category: "",
    photo_url: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          { data: ranksData },
          { data: companiesData },
          { data: platoonsData },
          { data: appointmentsData },
          { data: corpsData },
        ] = await Promise.all([
          supabase.from("ranks").select("*").order("id"),
          supabase.from("companies").select("*").order("name"),
          supabase.from("platoons").select("*").order("platoon_name"),
          supabase.from("appointments").select("*").order("appointment_name"),
          supabase.from("corps").select("*"),
        ]);

        if (ranksData) setRanks(ranksData);
        if (companiesData) setCompanies(companiesData);
        if (platoonsData) setPlatoons(platoonsData);
        if (appointmentsData) setAppointments(appointmentsData);
        if (corpsData) setCorpsList(corpsData);

        const person = await getPersonnelById(id as string);

        if (person) {
          setForm({
            army_no: person.army_no || "",
            rank_id: person.rank_id ? String(person.rank_id) : "",
            full_name: person.full_name || "",
            father_name: person.father_name || "",
            mother_name: person.mother_name || "",
            hometown: person.hometown || "",
            date_of_birth: person.date_of_birth || "",
            blood_group: person.blood_group || "",
            religion: person.religion || "",
            personal_mobile: person.personal_mobile || "",
            nok_mobile: person.nok_mobile || "",
            company_id: person.company_id ? String(person.company_id) : "",
            platoon_id: person.platoon_id ? String(person.platoon_id) : "",
            appointment_id: person.appointment_id
              ? String(person.appointment_id)
              : "",
            corps_id: person.corps_id ? String(person.corps_id) : "",
            ipft: person.ipft || "",
            ret: person.ret || "",
            mission_medical: person.mission_medical || "",
            leave_status: person.leave_status || "",
            medical_category: person.medical_category || "",
            photo_url: person.photo_url || "",
          });
        }
      } catch (error) {
        console.error("Error loading personnel for edit:", error);
        alert("Failed to load personnel details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  // Dynamically filter platoons based on selected company
  const filteredPlatoons = form.company_id
    ? platoons.filter((p) => String(p.company_id) === String(form.company_id))
    : platoons;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "company_id") {
      setForm((prev) => ({
        ...prev,
        company_id: value,
        platoon_id: "", // Clear platoon selection on company change
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updatePersonnel(id as string, form);

      if (photoFile) {
        await uploadPersonnelPhoto(photoFile, id as string);
      }

      router.push(`/personnel/${id}`);
    } catch (error: any) {
      console.error("Failed to update personnel:", error);
      alert(error.message || "Failed to save updates.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Loading edit form...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Edit Personnel</h1>
        <Link
          href={`/personnel/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* Section 1: Military Details */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Military & Unit Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Army Number *
              </label>
              <input
                type="text"
                name="army_no"
                required
                value={form.army_no}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Rank
              </label>
              <select
                name="rank_id"
                value={form.rank_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Rank</option>
                {ranks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rank_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={form.full_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Corps
              </label>
              <select
                name="corps_id"
                value={form.corps_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Corps</option>
                {corpsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.corps_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Company
              </label>
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Company</option>
                {companies.map((co) => (
                  <option key={co.id} value={co.id}>
                    {co.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Platoon
              </label>
              <select
                name="platoon_id"
                value={form.platoon_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Platoon</option>
                {filteredPlatoons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.platoon_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Appointment
              </label>
              <select
                name="appointment_id"
                value={form.appointment_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Appointment</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.appointment_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Personal Details */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Personal Details & Contacts
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Father's Name
              </label>
              <input
                type="text"
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Mother's Name
              </label>
              <input
                type="text"
                name="mother_name"
                value={form.mother_name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Hometown
              </label>
              <input
                type="text"
                name="hometown"
                value={form.hometown}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Blood Group
              </label>
              <input
                type="text"
                name="blood_group"
                placeholder="e.g. A+"
                value={form.blood_group}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Religion
              </label>
              <input
                type="text"
                name="religion"
                value={form.religion}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Personal Mobile
              </label>
              <input
                type="text"
                name="personal_mobile"
                value={form.personal_mobile}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                NOK Mobile
              </label>
              <input
                type="text"
                name="nok_mobile"
                value={form.nok_mobile}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3: Medical & Readiness */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Medical & Service Status
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                IPFT
              </label>
              <input
                type="text"
                name="ipft"
                placeholder="e.g. Pass"
                value={form.ipft}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                RET Date
              </label>
              <input
                type="date"
                name="ret"
                value={form.ret}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Mission Medical
              </label>
              <input
                type="text"
                name="mission_medical"
                value={form.mission_medical}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Medical Category
              </label>
              <input
                type="text"
                name="medical_category"
                value={form.medical_category}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Leave Status
              </label>
              <input
                type="text"
                name="leave_status"
                value={form.leave_status}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Photo Upload
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="mt-1 w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href={`/personnel/${id}`}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}