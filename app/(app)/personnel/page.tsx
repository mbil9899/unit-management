"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPersonnel } from "@/services/personnelService";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPersonnel() {
      const data = await getPersonnel();
      setPersonnel(data);
    }

    loadPersonnel();
  }, []);

  const filteredPersonnel = personnel.filter((person) => {
    const armyNo = person.army_no?.toLowerCase() || "";
    const fullName = person.full_name?.toLowerCase() || "";

    return (
      armyNo.includes(search.toLowerCase()) ||
      fullName.includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Personnel Management
          </h1>

          <p className="text-gray-500">
            View and manage all unit personnel.
          </p>

        </div>

        <Link
          href="/personnel/add"
          className="rounded-lg bg-emerald-700 px-5 py-2 text-white hover:bg-emerald-800"
        >
          + Add Personnel
        </Link>

      </div>

      {/* Search */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search by Army No or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-lg border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="border-b p-3 text-left">Army No</th>
              <th className="border-b p-3 text-left">Rank</th>
              <th className="border-b p-3 text-left">Name</th>
              <th className="border-b p-3 text-left">Company</th>
              <th className="border-b p-3 text-left">Appointment</th>
              <th className="border-b p-3 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredPersonnel.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No personnel found.
                </td>

              </tr>

            ) : (

              filteredPersonnel.map((person) => (

                <tr
                  key={person.id}
                  className="hover:bg-gray-50"
                >

                  <td className="border-b p-3">
                    {person.army_no}
                  </td>

                  <td className="border-b p-3">
                    {person.ranks?.rank_name}
                  </td>

                  <td className="border-b p-3">
                    {person.full_name}
                  </td>

                  <td className="border-b p-3">
                    {person.companies?.name}
                  </td>

                  <td className="border-b p-3">
                    {person.appointments?.appointment_name}
                  </td>

                  <td className="border-b p-3">

                    <div className="flex justify-center gap-2">

                      <Link
  href={`/personnel/${person.id}`}
  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
>
  View
</Link>

                      <Link
  href={`/personnel/${person.id}/edit`}
  className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
>
  Edit
</Link>

                      <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}