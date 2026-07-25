"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPersonnelById } from "@/services/personnelService";

export default function PersonnelDetailsPage() {
  const { id } = useParams();
  const [person, setPerson] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getPersonnelById(id as string);
      setPerson(data);
    }

    load();
  }, [id]);

  if (!person) {
    return (
      <div className="p-6">
        Loading personnel profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">

      <div className="mb-6 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Personnel Profile
        </h1>

        <Link
          href="/personnel"
          className="rounded bg-gray-700 px-4 py-2 text-white"
        >
          Back
        </Link>

      </div>

      <div className="rounded-lg border bg-white p-8 shadow">

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          <div className="flex justify-center">

            <div className="flex h-52 w-44 items-center justify-center rounded border bg-gray-100">
              Photo
            </div>

          </div>

          <div className="md:col-span-2">

            <div className="grid grid-cols-2 gap-4">

              <Info label="Army Number" value={person.army_no} />
              <Info label="Rank" value={person.ranks?.rank_name} />

              <Info label="Full Name" value={person.full_name} />
              <Info label="Father's Name" value={person.father_name} />

              <Info label="Mother's Name" value={person.mother_name} />
              <Info label="Hometown" value={person.hometown} />

              <Info label="Date of Birth" value={person.date_of_birth} />
              <Info label="Blood Group" value={person.blood_group} />

              <Info label="Religion" value={person.religion} />
              <Info label="Personal Mobile" value={person.personal_mobile} />

              <Info label="NOK Mobile" value={person.nok_mobile} />
              <Info label="Company" value={person.companies?.name} />

              <Info label="Appointment" value={person.appointments?.appointment_name} />
              <Info label="Corps" value={person.corps?.name} />

              <Info label="IPFT" value={person.ipft} />
              <Info label="RET" value={person.ret} />

              <Info label="Mission Medical" value={person.mission_medical} />
              <Info label="Leave Status" value={person.leave_status} />

              <Info label="Medical Category" value={person.medical_category} />

            </div>

          </div>

        </div>

        <div className="mt-8 flex gap-4">

          <Link
            href={`/personnel/${person.id}/edit`}
            className="rounded bg-yellow-500 px-5 py-2 text-white"
          >
            Edit
          </Link>

          <Link
            href="/personnel"
            className="rounded bg-gray-700 px-5 py-2 text-white"
          >
            Back
          </Link>

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div className="text-sm text-gray-500">
        {label}
      </div>

      <div className="font-semibold">
        {value || "-"}
      </div>
    </div>
  );
}