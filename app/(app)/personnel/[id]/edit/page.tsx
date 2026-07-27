"use client";

import { uploadPersonnelPhoto } from "@/services/personnelService";
import { useRouter } from "next/navigation";
const [platoons, setPlatoons] = useState<any[]>([]);
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
  getPlatoonsByCompany,
} from "@/services/lookupService";

export default function AddPersonnelPage() {
  const router = useRouter();
const { id } = useParams();

  const [form, setForm] = useState({
  army_no: "",
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
  rank_id: "",

  ipft: "",
  ret: "",

  mission_medical: "",

  leave_status: "",

  medical_category: "",

  photo_url: "",
});

useEffect(() => {
  async function loadPersonnel() {
  const data = await getPersonnelById(id as string);

  setForm({
  army_no: data.army_no ?? "",
  full_name: data.full_name ?? "",

  father_name: data.father_name ?? "",
  mother_name: data.mother_name ?? "",
  hometown: data.hometown ?? "",

  date_of_birth: data.date_of_birth ?? "",

  blood_group: data.blood_group ?? "",
  religion: data.religion ?? "",

  personal_mobile: data.personal_mobile ?? "",
  nok_mobile: data.nok_mobile ?? "",

  company_id: data.company_id?.toString() ?? "",
  platoon_id: data.platoon_id?.toString() ?? "",
  appointment_id: data.appointment_id?.toString() ?? "",
  corps_id: data.corps_id?.toString() ?? "",
  rank_id: data.rank_id?.toString() ?? "",

  ipft: data.ipft ?? "",
  ret: data.ret ?? "",

  mission_medical: data.mission_medical ?? "",

  leave_status: data.leave_status ?? "",

  medical_category: data.medical_category ?? "",

  photo_url: data.photo_url ?? "",
});

if (data.company_id) {
  const platoonData = await getPlatoonsByCompany(data.company_id);
  setPlatoons(platoonData);
}

}

loadPersonnel();
}, [id]);


const [ranks, setRanks] = useState<any[]>([]);
const [companies, setCompanies] = useState<any[]>([]);
const [appointments, setAppointments] = useState<any[]>([]);
const [corps, setCorps] = useState<any[]>([]);
const [photo, setPhoto] = useState<File | null>(null);


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


async function handleCompanyChange(companyId: string) {
  setForm((prev) => ({
    ...prev,
    company_id: companyId,
    platoon_id: "",
  }));

  if (!companyId) {
    setPlatoons([]);
    return;
  }

  const data = await getPlatoonsByCompany(Number(companyId));
  setPlatoons(data);
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updatePersonnel(id as string, form);

      if (photo) {
  await uploadPersonnelPhoto(photo, id as string);
}

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
        className="grid grid-cols-2 gap-5"
      >

        <div>
          <label>Army Number</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.army_no}
            onChange={(e) =>
  handleCompanyChange(e.target.value)
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

<div>
  <label className="block mb-1 font-medium">
    Company
  </label>

  <select
    className="w-full rounded border p-2"
    value={form.company_id}
    onChange={(e) =>
      setForm({
        ...form,
        company_id: e.target.value,
      })
    }
  >
    <option value="">Select Company</option>

    {companies.map((company) => (
      <option
        key={company.id}
        value={company.id}
      >
        {company.name}
      </option>
    ))}
  </select>
</div>


<div>
  <label className="block mb-1 font-medium">
    Platoon
  </label>

  <select
    className="w-full rounded border p-2"
    value={form.platoon_id}
    onChange={(e) =>
      setForm({
        ...form,
        platoon_id: e.target.value,
      })
    }
  >
    <option value="">Select Platoon</option>

    {platoons.map((platoon) => (
      <option
        key={platoon.id}
        value={platoon.id}
      >
        {platoon.platoon_name}
      </option>
    ))}
  </select>
</div>

<div>
  <label className="block mb-1 font-medium">
    Appointment
  </label>

  <select
    className="w-full rounded border p-2"
    value={form.appointment_id}
    onChange={(e) =>
      setForm({
        ...form,
        appointment_id: e.target.value,
      })
    }
  >
    <option value="">Select Appointment</option>

    {appointments.map((appointment) => (
      <option
        key={appointment.id}
        value={appointment.id}
      >
        {appointment.appointment_name}
      </option>
    ))}
  </select>
</div>

<div>
  <label className="block mb-1 font-medium">
    Corps
  </label>

  <select
    className="w-full rounded border p-2"
    value={form.corps_id}
    onChange={(e) =>
      setForm({
        ...form,
        corps_id: e.target.value,
      })
    }
  >
    <option value="">Select Corps</option>

    {corps.map((item) => (
      <option
        key={item.id}
        value={item.id}
      >
        {item.corps_name}
      </option>
    ))}
  </select>
</div>

{/* Father Name */}
<div>
  <label>Father Name</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.father_name}
    onChange={(e) =>
      setForm({
        ...form,
        father_name: e.target.value,
      })
    }
  />
</div>

{/* Mother Name */}
<div>
  <label>Mother Name</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.mother_name}
    onChange={(e) =>
      setForm({
        ...form,
        mother_name: e.target.value,
      })
    }
  />
</div>

{/* Home District */}
<div>
  <label>Home District</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.hometown}
    onChange={(e) =>
      setForm({
        ...form,
        hometown: e.target.value,
      })
    }
  />
</div>

{/* Date of Birth */}
<div>
  <label>Date of Birth</label>

  <input
    type="date"
    className="mt-1 w-full rounded border p-2"
    value={form.date_of_birth || ""}
    onChange={(e) =>
      setForm({
        ...form,
        date_of_birth: e.target.value,
      })
    }
  />
</div>

{/* Blood Group */}
<div>
  <label>Blood Group</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.blood_group}
    onChange={(e) =>
      setForm({
        ...form,
        blood_group: e.target.value,
      })
    }
  />
</div>

{/* Religion */}
<div>
  <label>Religion</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.religion}
    onChange={(e) =>
      setForm({
        ...form,
        religion: e.target.value,
      })
    }
  />
</div>

{/* Personal Mobile */}
<div>
  <label>Personal Mobile</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.personal_mobile}
    onChange={(e) =>
      setForm({
        ...form,
        personal_mobile: e.target.value,
      })
    }
  />
</div>

{/* NOK Mobile */}
<div>
  <label>NOK Mobile</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.nok_mobile}
    onChange={(e) =>
      setForm({
        ...form,
        nok_mobile: e.target.value,
      })
    }
  />
</div>

{/* IPFT */}
<div>
  <label>IPFT</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.ipft}
    onChange={(e) =>
      setForm({
        ...form,
        ipft: e.target.value,
      })
    }
  />
</div>

{/* RET */}
<div>
  <label>RET</label>

  <input
    type="date"
    className="mt-1 w-full rounded border p-2"
    value={form.ret || ""}
    onChange={(e) =>
      setForm({
        ...form,
        ret: e.target.value,
      })
    }
  />
</div>

{/* Mission Medical */}
<div>
  <label>Mission Medical</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.mission_medical}
    onChange={(e) =>
      setForm({
        ...form,
        mission_medical: e.target.value,
      })
    }
  />
</div>

{/* Leave Status */}
<div>
  <label>Leave Status</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.leave_status}
    onChange={(e) =>
      setForm({
        ...form,
        leave_status: e.target.value,
      })
    }
  />
</div>

{/* Medical Category */}
<div>
  <label>Medical Category</label>

  <input
    className="mt-1 w-full rounded border p-2"
    value={form.medical_category}
    onChange={(e) =>
      setForm({
        ...form,
        medical_category: e.target.value,
      })
    }
  />
</div>

{/* Update Button */}
<div className="col-span-2 mt-6 flex gap-4">
  <button
    type="submit"
    className="rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
  >
    Update Personnel
  </button>

  <button
    type="button"
    onClick={() => router.push("/personnel")}
    className="rounded bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
  >
    Cancel
  </button>
</div>


<div className="col-span-2">
  <label className="block mb-2 font-medium">
    Personnel Photo
  </label>

  {form.photo_url && (
    <img
  src={
    photo
      ? URL.createObjectURL(photo)
      : form.photo_url
  }
      alt="Personnel"
      className="mb-3 h-44 w-36 rounded border object-cover"
    />
  )}

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setPhoto(e.target.files?.[0] || null)
    }
  />
</div>


      </form>

    </div>
  );
}