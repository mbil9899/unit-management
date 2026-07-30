"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonnelById, deletePersonnel } from "@/services/personnelService";

export default function PersonnelDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [personnel, setPersonnel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // RBAC Permission Logic
  const role = user?.role ? user.role.toUpperCase().trim() : "";

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
    async function loadPersonnelDetails() {
      try {
        setLoading(true);
        const data = await getPersonnelById(id as string);
        setPersonnel(data);
      } catch (error) {
        console.error("Failed to load personnel details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadPersonnelDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!canDeletePersonnel) return;

    if (
      !confirm(
        `Are you sure you want to delete ${personnel?.ranks?.rank_name || ""} ${
          personnel?.full_name || "this person"
        }? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deletePersonnel(id as string);
      router.push("/personnel");
    } catch (error: any) {
      console.error("Failed to delete personnel:", error);
      alert(error.message || "Failed to delete personnel record.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        <div className="text-sm font-medium animate-pulse">Loading personnel details...</div>
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Personnel Record Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The requested record could not be loaded or may have been deleted.
        </p>
        <Link
          href="/personnel"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-blue-700"
        >
          ← Back to Personnel Roster
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {personnel.ranks?.rank_name || ""} {personnel.full_name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Army No:{" "}
            <span className="font-mono font-semibold text-gray-800">
              {personnel.army_no || "-"}
            </span>
          </p>
        </div>

        <Link
          href="/personnel"
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ← Back to Personnel
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="space-y-8 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_2px_20px_rgb(0,0,0,0.02)] md:p-8">
        
        {/* Top Info Banner with Photo */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center text-4xl font-bold text-gray-300 shadow-inner">
            {personnel.photo_url ? (
              <img
                src={personnel.photo_url}
                alt={personnel.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              personnel.full_name?.charAt(0) || "P"
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
                {personnel.companies?.name || "Unassigned Company"}
              </span>
              {personnel.platoons?.platoon_name && (
                <span className="inline-block rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200">
                  {personnel.platoons.platoon_name}
                </span>
              )}
              <StatusBadge status={personnel.leave_status} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {personnel.ranks?.rank_name || ""} {personnel.full_name}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Appointment:{" "}
              <span className="text-gray-900 font-semibold">
                {personnel.appointments?.appointment_name || "-"}
              </span>
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 1: Military & Service Information */}
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-blue-600">
            Military & Service Details
          </h3>

          <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Army Number" value={personnel.army_no} isMono />
            <Info label="Rank" value={personnel.ranks?.rank_name} />
            <Info label="Full Name" value={personnel.full_name} />
            <Info label="Corps" value={personnel.corps?.corps_name} />
            <Info label="Company" value={personnel.companies?.name} />
            <Info label="Platoon" value={personnel.platoons?.platoon_name} />
            <Info label="Appointment" value={personnel.appointments?.appointment_name} />
            <Info label="Medical Category" value={personnel.medical_category} />
            <Info label="Mission Medical" value={personnel.mission_medical} />
            <Info label="IPFT" value={personnel.ipft} />
            <Info label="RET" value={personnel.ret ? new Date(personnel.ret).toLocaleDateString() : null} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Personal Information */}
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-blue-600">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Father's Name" value={personnel.father_name} />
            <Info label="Mother's Name" value={personnel.mother_name} />
            <Info label="Date of Birth" value={personnel.date_of_birth ? new Date(personnel.date_of_birth).toLocaleDateString() : null} />
            <Info label="Blood Group" value={personnel.blood_group} />
            <Info label="Religion" value={personnel.religion} />
            <Info label="Hometown" value={personnel.hometown} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3: Contact Details */}
        <div>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-blue-600">
            Contact Details
          </h3>

          <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Personal Mobile" value={personnel.personal_mobile} isMono />
            <Info label="NOK Mobile" value={personnel.nok_mobile} isMono />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-8 mt-4">
          <div className="flex items-center gap-3">
            {/* Rendered only if authorized by RBAC */}
            {canEditPersonnel && (
              <Link
                href={`/personnel/${personnel.id}/edit`}
                className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
              >
                Edit Record
              </Link>
            )}

            {/* Rendered only if authorized by RBAC */}
            {canDeletePersonnel && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Record"}
              </button>
            )}
          </div>

          <Link
            href="/personnel"
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Back to Roster
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: any;
  isMono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div
        className={`mt-1.5 text-sm font-semibold text-gray-900 ${
          isMono ? "font-mono tracking-tight" : ""
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "active"; // Default fallback if empty
  let badgeStyle = "bg-green-100 text-green-700 border-green-200";

  if (s === "on leave" || s === "leave")
    badgeStyle = "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "hospitalized" || s === "medical")
    badgeStyle = "bg-red-100 text-red-700 border-red-200";
  if (s === "inactive" || s === "retired" || s === "absent")
    badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-block rounded-lg border px-3 py-1.5 text-xs font-bold capitalize ${badgeStyle}`}
    >
      {status || "Active"}
    </span>
  );
}