"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getTaskById, deleteTask } from "@/services/taskService";

// Helper object to map JSON keys to readable labels
const EVALUATION_CRITERIA: Record<string, string> = {
  timeliness: "Timeliness & Punctuality",
  quality: "Quality of Execution",
  resource: "Resource Management",
  team: "Team Coordination",
  initiative: "Initiative & Problem Solving",
  sop: "Adherence to SOPs",
  tactical: "Tactical / Tech Proficiency",
  communication: "Communication & Reporting",
  endurance: "Endurance & Resilience",
  security: "Security & Op Secrecy",
};

export default function TaskDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 1. RBAC PERMISSION LOGIC
  // ==========================================
  const role = user?.role ? user.role.toUpperCase().trim() : "";
  const isCompanyCommander = role === "COMPANY COMMANDER";
  const isCompanyClerk = role === "COMPANY CLERK";
  
  // Safely check if the loaded task belongs to the user's company
  const isTaskInUserCompany = task?.company_id === user?.company_id;

  // Edit Permissions: Removed COMPANY CLERK
  const canEditTask = [
    "ADMIN",
    "CONTINGENT COMMANDER",
    "DEPUTY CONTINGENT COMMANDER",
    "COMPANY COMMANDER",
    "PLATOON COMMANDER",
  ].includes(role);

  // Delete Permissions: Global Roles OR (Company Commander + Task is in their Company)
  const canDeleteTask = 
    ["ADMIN", "CONTINGENT COMMANDER", "DEPUTY CONTINGENT COMMANDER"].includes(role) || 
    (isCompanyCommander && isTaskInUserCompany);

  // ==========================================

  useEffect(() => {
    setMounted(true);

    // Fail-safe: Redirect Company Clerks immediately if they access via direct URL
    if (isCompanyClerk) {
      router.replace("/dashboard");
      return;
    }
    
    async function loadTask() {
      try {
        setLoading(true);
        const data = await getTaskById(id as string);
        setTask(data);
      } catch (error) {
        console.error("Failed to load task details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id && !isCompanyClerk) loadTask();
  }, [id, isCompanyClerk, router]);

  const handleDelete = async () => {
    if (!canDeleteTask) return;
    if (!confirm(`Are you sure you want to delete task "${task?.title}"? This cannot be undone.`)) return;

    try {
      setDeleting(true);
      await deleteTask(id as string);
      router.push("/tasks");
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      alert(error.message || "Failed to delete task.");
      setDeleting(false);
    }
  };

  // -----------------------------------------------------------------
  // Robust PDF Download Function (Centered & Aligned)
  // -----------------------------------------------------------------
  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    if (!element) {
      alert("PDF content area not found.");
      return;
    }

    try {
      setIsDownloading(true);
      
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Hide the buttons so they don't appear in the PDF
      const buttons = element.querySelectorAll('[data-pdf-ignore="true"]');
      buttons.forEach((el) => ((el as HTMLElement).style.display = "none"));

      // BUGFIX: Scroll to the very top. html-to-image can cut off content if scrolled down
      window.scrollTo(0, 0); 
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate Image
      const dataUrl = await toPng(element, { 
        quality: 1, 
        backgroundColor: "#ffffff",
        pixelRatio: 2, // High resolution
        width: element.offsetWidth, 
        height: element.offsetHeight,
        style: {
          // BUGFIX: Strip the mx-auto margin so it doesn't push the image to the right!
          margin: "0px", 
          transform: "scale(1)",
          transformOrigin: "top left"
        }
      });

      // Restore the buttons to the screen
      buttons.forEach((el) => ((el as HTMLElement).style.display = ""));

      // Initialize PDF to standard A4 paper
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Calculate professional margins (10mm on all sides)
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const usableWidth = pageWidth - (margin * 2);
      
      // Calculate height to perfectly maintain the aspect ratio
      const imgHeight = (element.offsetHeight * usableWidth) / element.offsetWidth;

      // Add image with calculated margins
      pdf.addImage(dataUrl, "PNG", margin, margin, usableWidth, imgHeight);
      pdf.save(`Task_${task.task_number || "Evaluation"}.pdf`);
      
    } catch (error) {
      console.error("Detailed PDF Error:", error);
      alert("Failed to generate PDF. Check the browser console for details.");
      
      // Ensure buttons come back even if there is a crash
      const buttons = element.querySelectorAll('[data-pdf-ignore="true"]');
      buttons.forEach((el) => ((el as HTMLElement).style.display = ""));
    } finally {
      setIsDownloading(false);
    }
  };

  // Block rendering entirely for unauthorized clerks
  if (isCompanyClerk) return null;

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        <div className="text-sm font-medium animate-pulse">Loading task details...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Task Not Found</h2>
        <Link href="/tasks" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  const assignee = task?.assigned_personnel || task?.personnel;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 flex flex-col bg-white" ref={contentRef}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Task No: <span className="font-mono font-semibold text-gray-800">{task.task_number || "-"}</span>
          </p>
        </div>

        {/* Action Buttons - Hidden in PDF using our custom data-pdf-ignore attribute */}
        <div className="flex flex-wrap items-center gap-3" data-pdf-ignore="true">
          <Link
            href="/tasks"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Back
          </Link>
          
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="rounded-xl border border-blue-600 bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:opacity-50 flex flex-row items-center gap-2"
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Generating...
              </>
            ) : (
              "Download PDF"
            )}
          </button>

          {canEditTask && (
            <Link
              href={`/tasks/${id}/edit`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Edit Task
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        
        {/* General Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
            <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{task.description || "No description provided."}</p>
          </div>
          <div className="space-y-4">
            <Info label="Category" value={task.task_categories?.name} />
            <Info label="Priority" value={task.priority} />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</h3>
              <div className="mt-1.5">
                <StatusBadge status={task.status} />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Assignment & Execution Dates */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">Assignment Details</h3>
            <div className="space-y-4">
              <Info 
                label="Assigned To" 
                value={assignee ? `${assignee.army_no || ""} ${assignee.ranks?.rank_name || ""} ${assignee.full_name || ""}`.trim() : "Unassigned"} 
              />
              <Info label="Company" value={task.companies?.name} />
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">Execution Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Start Date" value={task.start_date ? new Date(task.start_date).toLocaleDateString() : null} />
              <Info label="Due Date" value={task.due_date ? new Date(task.due_date).toLocaleDateString() : null} />
              <Info label="Completion Date" value={task.completion_date ? new Date(task.completion_date).toLocaleDateString() : null} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* COMMANDER EVALUATION & FEEDBACK */}
        <div>
          <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-blue-700">
            Commander Evaluation & Feedback
          </h3>

          <div className="space-y-8">
            {/* Efficiency */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Efficiency Evaluation</h4>
              <p className="mt-1.5 text-sm font-semibold text-gray-900">
                {task.efficiency_evaluation || "Not evaluated yet."}
              </p>
            </div>

            {/* Matrix & Score */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Commander Evaluation Matrix</h4>
              
              <p className="text-sm font-bold text-gray-900 mb-4">
                Total Mark (Out of 100): <span className="text-blue-700">{task.total_mark || 0}</span>
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-bold text-gray-800 mb-3 underline underline-offset-4 decoration-gray-300">Matrix Scores:</p>
                {task.evaluation_matrix ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700">
                    {Object.entries(EVALUATION_CRITERIA).map(([key, label]) => (
                      <div key={key}>
                        {label} - <span className="font-semibold text-gray-900">{task.evaluation_matrix[key] || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No matrix scores recorded.</p>
                )}
              </div>
            </div>

            {/* Remarks (Strength & Weakness) */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Remarks</h4>
              <ul className="space-y-3 text-sm text-gray-800 bg-blue-50/50 p-5 rounded-xl border border-blue-100/50">
                <li>
                  <span className="font-bold text-blue-900">Strength:</span>{" "}
                  <span className="whitespace-pre-wrap">{task.strength || "None recorded."}</span>
                </li>
                <li>
                  <span className="font-bold text-amber-900">Weakness:</span>{" "}
                  <span className="whitespace-pre-wrap">{task.weakness || "None recorded."}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delete Action (Admin & Allowed Commanders Only) */}
        {canDeleteTask && (
          <div className="mt-8 border-t border-gray-100 pt-6 text-right" data-pdf-ignore="true">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition"
            >
              {deleting ? "Deleting..." : "Delete Task Record"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1.5 text-sm font-semibold text-gray-900">{value || "-"}</div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "pending";
  let style = "bg-gray-100 text-gray-700 border-gray-200";

  if (s === "completed") style = "bg-green-100 text-green-700 border-green-200";
  if (s === "in progress") style = "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "cancelled") style = "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`inline-block rounded-lg border px-3 py-1 text-xs font-bold capitalize ${style}`}>
      {status || "Pending"}
    </span>
  );
}