"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPersonnelPhoto } from "@/services/personnelService";

import { createPersonnel } from "@/services/personnelService";

import {
  getRanks,
  getCompanies,
  getAppointments,
  getCorps,
  getPlatoons,
} from "@/services/lookupService";

export default function AddPersonnelPage() {
  const router = useRouter();

  const [ranks, setRanks] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [corps, setCorps] = useState<any[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [platoons, setPlatoons] = useState<any[]>([]);
  

  const [form, setForm] = useState({
    army_no: "",
    full_name: "",

    rank_id: "",
    company_id: "",
    platoon_id: "",
    appointment_id: "",
    corps_id: "",


    father_name: "",
    mother_name: "",
    hometown: "",

    date_of_birth: "",

    blood_group: "",
    religion: "",

    personal_mobile: "",
    nok_mobile: "",

    ipft: "",
    ret: "",

    mission_medical: "",
    leave_status: "",
    medical_category: "",

    photo_url: "",
  });

  useEffect(() => {
async function load() {
  setRanks(await getRanks());
  setCompanies(await getCompanies());
  setPlatoons(await getPlatoonsByCompany(companyId));
  setAppointments(await getAppointments());
  setCorps(await getCorps());
}

    load();
  }, []);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  try {
    const person = await createPersonnel({
      ...form,

      rank_id: form.rank_id ? Number(form.rank_id) : null,

      company_id: form.company_id
        ? Number(form.company_id)
        : null,

      platoon_id: form.platoon_id
  ? Number(form.platoon_id)
  : null,

      appointment_id: form.appointment_id
        ? Number(form.appointment_id)
        : null,

      corps_id: form.corps_id
        ? Number(form.corps_id)
        : null,

      date_of_birth: form.date_of_birth || null,

      ret: form.ret || null,
    });

    if (photo) {
      await uploadPersonnelPhoto(photo, person.id);
    }

    alert("Personnel added successfully.");

    router.push("/personnel");
  } catch (err: any) {
    console.error(err);
    alert(err.message || JSON.stringify(err));
  }
}


  return (
    <div className="max-w-5xl rounded-xl bg-white p-8 shadow">

      <h1 className="mb-8 text-3xl font-bold">
        Add Personnel
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
            onChange={(e)=>
              setForm({
                ...form,
                army_no:e.target.value
              })
            }
          />
        </div>

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
          <label>Rank</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.rank_id}
            onChange={(e)=>
              setForm({
                ...form,
                rank_id:e.target.value
              })
            }
          >
            <option value="">Select Rank</option>

            {ranks.map((r)=>(
              <option
                key={r.id}
                value={r.id}
              >
                {r.rank_name}
              </option>
            ))}
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
            <option value="">Select Company</option>

            {companies.map((c)=>(
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>


<div>
  <label>Platoon</label>

  <select
    className="mt-1 w-full rounded border p-2"
    value={form.platoon_id}
    onChange={(e) =>
      setForm({
        ...form,
        platoon_id: e.target.value,
      })
    }
  >
    <option value="">Select Platoon</option>

    {platoons.map((p) => (
      <option
        key={p.id}
        value={p.id}
      >
        {p.platoon_name}
      </option>
    ))}
  </select>
</div>



        <div>
          <label>Appointment</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.appointment_id}
            onChange={(e)=>
              setForm({
                ...form,
                appointment_id:e.target.value
              })
            }
          >
            <option value="">Select Appointment</option>

            {appointments.map((a)=>(
              <option
                key={a.id}
                value={a.id}
              >
                {a.appointment_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Corps</label>

          <select
            className="mt-1 w-full rounded border p-2"
            value={form.corps_id}
            onChange={(e)=>
              setForm({
                ...form,
                corps_id:e.target.value
              })
            }
          >
            <option value="">Select Corps</option>

            {corps.map((c)=>(
              <option
                key={c.id}
                value={c.id}
              >
                {c.corps_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Father Name</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.father_name}
            onChange={(e)=>
              setForm({
                ...form,
                father_name:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Mother Name</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.mother_name}
            onChange={(e)=>
              setForm({
                ...form,
                mother_name:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Home District</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.hometown}
            onChange={(e)=>
              setForm({
                ...form,
                hometown:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Date of Birth</label>

          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={form.date_of_birth}
            onChange={(e)=>
              setForm({
                ...form,
                date_of_birth:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Blood Group</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.blood_group}
            onChange={(e)=>
              setForm({
                ...form,
                blood_group:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Religion</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.religion}
            onChange={(e)=>
              setForm({
                ...form,
                religion:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Personal Mobile</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.personal_mobile}
            onChange={(e)=>
              setForm({
                ...form,
                personal_mobile:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>NOK Mobile</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.nok_mobile}
            onChange={(e)=>
              setForm({
                ...form,
                nok_mobile:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>IPFT</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.ipft}
            onChange={(e)=>
              setForm({
                ...form,
                ipft:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>RET</label>

          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={form.ret}
            onChange={(e)=>
              setForm({
                ...form,
                ret:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Mission Medical</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.mission_medical}
            onChange={(e)=>
              setForm({
                ...form,
                mission_medical:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Leave Status</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.leave_status}
            onChange={(e)=>
              setForm({
                ...form,
                leave_status:e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Medical Category</label>

          <input
            className="mt-1 w-full rounded border p-2"
            value={form.medical_category}
            onChange={(e)=>
              setForm({
                ...form,
                medical_category:e.target.value
              })
            }
          />
        </div>

        <div>
  <label>Photo</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setPhoto(e.target.files?.[0] || null)
    }
  />
</div>

        <div className="col-span-2">
          <button
            className="rounded bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
          >
            Save Personnel
          </button>
        </div>

      </form>

    </div>
  );
}