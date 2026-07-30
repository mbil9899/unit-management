"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getPersonnel } from "@/services/personnelService";
import { createTask } from "@/services/taskService";

export default function AddTaskPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data sources for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);

  // Selected assignee details
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  // Attachment file state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    assigned_to: "",
    priority: "Routine", // Default priority
    due_date: "",
    remarks: "", // Notes
  });

  // Today's date for display
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);

        // 1. Fetch Task Categories
        const { data: catData } = await supabase
          .from("task_categories")
          .select("*")
          .order("name");
        
        if (catData) setCategories(catData);

        // 2. Fetch Personnel list scoped to user's authority
        const personnelData = await getPersonnel();
        setPersonnelList(personnelData || []);
      } catch (error) {
        console.error("Error loading task form dependencies:", error);
      } finally { // 👈 Fixed here
        setLoading(false);
      }
    }

    loadFormData();
  }, []);

  // Handle Assignee Selection & Auto-Detect Company & Platoon
  const handleAssigneeChange = (personId: string) => {
    const person = personnelList.find((p) => p.id === personId) || null;
    setSelectedPerson(person);
    setForm((prev) => ({ ...prev, assigned_to: personId }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id ? Number(form.category_id) : null,
        assigned_to: form.assigned_to || null,
        company_id: selectedPerson?.company_id || user?.company_id || null,
        priority: form.priority,
        status: "Pending", // Fixed status on creation
        due_date: form.due_date || null,
        remarks: form.remarks || null,
      };

      await createTask(payload);

      // Upload attachment if present
      if (attachmentFile) {
        // Handle document/attachment bucket upload if needed
        console.log("Uploading attachment:", attachmentFile.name);
      }

      router.push("/tasks");
    } catch (error: any) {
      console.error("Failed to create task:", error);
      alert(error.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Loading task creation form...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign New Task</h1>
          <p className="text-sm text-gray-500">
            Create and assign operational or administrative tasks across your unit.
          </p>
        </div>

        <Link
          href="/tasks"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* Section 1: Basic Task Details */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Task Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Task No. (Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Task No.
              </label>
              <input
                type="text"
                disabled
                value="Auto-generated (e.g. TASK-0001)"
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Task Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Short, meaningful title..."
                value={form.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Task Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Task Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Administration</option>
                    <option value="2">Training</option>
                    <option value="3">Operations</option>
                    <option value="4">Logistics</option>
                  </>
                )}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-700">
                Description / Detailed Instructions
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Provide clear steps or instructions for this task..."
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Assignment & Authority */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Assignment & Authority
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Assigned To */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Assigned To
              </label>
              <select
                name="assigned_to"
                value={form.assigned_to}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Personnel</option>
                {personnelList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ranks?.rank_name || ""} {p.full_name} ({p.army_no})
                  </option>
                ))}
              </select>

              {/* Auto-populated Company & Platoon badges */}
              {selectedPerson && (
                <div className="mt-2.5 flex items-center gap-3 rounded-lg bg-blue-50/70 p-2.5 border border-blue-100 text-xs">
                  <div>
                    <span className="text-gray-500">Company: </span>
                    <span className="font-semibold text-blue-900">
                      {selectedPerson.companies?.name || "N/A"}
                    </span>
                  </div>
                  <div className="text-gray-300">|</div>
                  <div>
                    <span className="text-gray-500">Platoon: </span>
                    <span className="font-semibold text-blue-900">
                      {selectedPerson.platoons?.platoon_name || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Assigned By (Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Assigned By (You)
              </label>
              <input
                type="text"
                disabled
                value={`${user?.role || "System User"} — System Authority`}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3: Status, Priority & Timeline */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Priority & Dates
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Routine">Routine</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Status (Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1 flex items-center h-[38px] rounded-md border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700">
                Pending
              </div>
            </div>

            {/* Created Date (Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Created Date
              </label>
              <input
                type="text"
                disabled
                value={todayDate}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 4: Attachments & Notes */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Attachments & Remarks
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Attachments */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Attachments (Docs, Images, PDFs)
              </label>
              <input
                type="file"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="mt-1 w-full text-xs text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:bg-gray-200"
              />
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Notes / Additional Remarks
              </label>
              <textarea
                name="remarks"
                rows={2}
                placeholder="Any special notes or criteria..."
                value={form.remarks}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/tasks"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      </form>
    </div>
  );
}