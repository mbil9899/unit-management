"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPersonnel } from "@/services/personnelService";

// Helper function to determine badge colors based on task count
function getTaskBadgeStyle(count: number) {
  if (count === 0) {
    return "bg-gray-50 text-gray-500 border-gray-200";
  }
  if (count >= 1 && count <= 2) {
    // Bold Green
    return "bg-green-600 text-white border-green-800 shadow-md ring-2 ring-green-300 font-extrabold";
  }
  if (count === 3) {
    // Bold Yellow/Amber (using 600 for better white text contrast)
    return "bg-yellow-600 text-white border-yellow-800 shadow-md ring-2 ring-yellow-300 font-extrabold";
  }
  
  // 4 or more tasks -> Deep Red / Warning Style
  return "bg-red-600 text-white border-red-800 shadow-md ring-2 ring-red-300 font-extrabold"; 
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPersonnel() {
      try {
        setLoading(true);
        const data = await getPersonnel();
        setPersonnel(data || []);
      } catch (error) {
        console.error("Failed to load personnel:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPersonnel();
  }, []);

  const filteredPersonnel = personnel.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.army_no?.toLowerCase().includes(query) ||
      p.ranks?.rank_name?.toLowerCase().includes(query) ||
      p.corps?.corps_name?.toLowerCase().includes(query) ||
      p.companies?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personnel Roster</h1>
          <p className="text-sm text-gray-500">View and manage unit personnel records.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by Name, Army No, Rank, Corps, Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredPersonnel.length}</span> records
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading personnel roster...</div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No personnel found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Photo</th>
                  <th className="px-6 py-4 font-semibold">Army No</th>
                  <th className="px-6 py-4 font-semibold">Rank & Name</th>
                  <th className="px-6 py-4 font-semibold">Corps</th>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Platoon</th>
                  <th className="px-6 py-4 font-semibold">Appointment</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Task Assigned</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPersonnel.map((person) => {
                  
                  // Calculate the total number of tasks assigned to this person
                  const totalTasks = person.tasks ? person.tasks.length : 0;
                  
                  return (
                    <tr key={person.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <img
                          src={person.photo_url || "/logo.png"}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {person.army_no}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {person.ranks?.rank_name || ""} {person.full_name}
                      </td>
                      <td className="px-6 py-4">{person.corps?.corps_name || "-"}</td>
                      <td className="px-6 py-4">{person.companies?.name || "-"}</td>
                      <td className="px-6 py-4">{person.platoons?.platoon_name || "-"}</td>
                      <td className="px-6 py-4">{person.appointments?.appointment_name || "-"}</td>
                      
                      {/* DYNAMIC COLORED DATA CELL */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold border ${getTaskBadgeStyle(totalTasks)}`}>
                          {totalTasks}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/personnel/${person.id}`}
                          className="font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}