"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonnel, deletePersonnel } from "@/services/personnelService";

export default function PersonnelPage() {
  const { user } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const role = user?.role ? user.role.toUpperCase().trim() : "";

  // Permission Checks based on RBAC matrix
  const canAddPersonnel = [
    "ADMIN",
    "CONTINGENT COMMANDER",
    "DEPUTY CONTINGENT COMMANDER",
    "COMPANY CLERK",
  ].includes(role);

  const canEditPersonnel = [
    "ADMIN",
    "CONTINGENT COMMANDER",
    "DEPUTY CONTINGENT COMMANDER",
    "PLATOON COMMANDER",
    "COMPANY CLERK",
  ].includes(role);

  const canDeletePersonnel = [
    "ADMIN",
    "CONTINGENT COMMANDER",
    "DEPUTY CONTINGENT COMMANDER",
  ].includes(role);

  useEffect(() => {
    loadPersonnel();
  }, []);

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

  const handleDelete = async (id: string, name: string) => {
    if (!canDeletePersonnel) return;

    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deletePersonnel(id);
        setPersonnel((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Failed to delete personnel:", error);
        alert("Failed to delete personnel.");
      }
    }
  };

  const filteredPersonnel = personnel.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    return (
      p.full_name?.toLowerCase().includes(query) ||
      p.army_no?.toLowerCase().includes(query) ||
      p.companies?.name?.toLowerCase().includes(query) ||
      p.ranks?.rank_name?.toLowerCase().includes(query) ||
      p.corps?.corps_name?.toLowerCase().includes(query) // Now searching relational corps table
    );
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personnel Roster</h1>
          <p className="text-sm text-gray-500">
            View and manage unit personnel records.
          </p>
        </div>

        {/* Conditionally Render Add Personnel Button */}
        {canAddPersonnel && (
          <Link
            href="/personnel/add"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Personnel
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Name, Army No, Rank, Corps, Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredPersonnel.length}</span> records
        </div>
      </div>

      {/* Personnel Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-gray-500 animate-pulse">Loading personnel...</div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-gray-500">No personnel records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold w-16 text-center">Photo</th>
                  <th className="px-6 py-4 font-bold">Army No</th>
                  <th className="px-6 py-4 font-bold">Rank & Name</th>
                  <th className="px-6 py-4 font-bold">Corps</th>
                  <th className="px-6 py-4 font-bold">Company</th>
                  <th className="px-6 py-4 font-bold">Platoon</th>
                  <th className="px-6 py-4 font-bold">Appointment</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPersonnel.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* PHOTO COLUMN */}
                    <td className="px-6 py-3">
                      <div className="h-10 w-10 mx-auto overflow-hidden rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt={p.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          p.full_name?.charAt(0) || "P"
                        )}
                      </div>
                    </td>

                    {/* ARMY NO COLUMN */}
                    <td className="px-6 py-3 font-mono text-xs font-bold text-gray-800">
                      {p.army_no}
                    </td>

                    {/* RANK & NAME COLUMN */}
                    <td className="px-6 py-3 font-bold text-gray-900">
                      <Link href={`/personnel/${p.id}`} className="hover:text-blue-600 transition">
                        {p.ranks?.rank_name || ""} {p.full_name}
                      </Link>
                    </td>

                    {/* CORPS COLUMN (Fetching from relations now) */}
                    <td className="px-6 py-3 font-medium text-gray-600">
                      {p.corps?.corps_name || "-"}
                    </td>

                    {/* COMPANY COLUMN */}
                    <td className="px-6 py-3 font-medium text-gray-600">
                      {p.companies?.name || "-"}
                    </td>

                    {/* PLATOON COLUMN */}
                    <td className="px-6 py-3 font-medium text-gray-600">
                      {p.platoons?.platoon_name || "-"}
                    </td>

                    {/* APPOINTMENT COLUMN */}
                    <td className="px-6 py-3 font-medium text-gray-600">
                      {p.appointments?.appointment_name || "-"}
                    </td>

                    {/* ACTIONS COLUMN (Always Visible Now) */}
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/personnel/${p.id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                        >
                          View
                        </Link>

                        {canEditPersonnel && (
                          <Link
                            href={`/personnel/${p.id}/edit`}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 transition"
                          >
                            Edit
                          </Link>
                        )}

                        {canDeletePersonnel && (
                          <button
                            onClick={() => handleDelete(p.id, p.full_name)}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}