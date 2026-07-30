"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getPersonnel } from "@/services/personnelService";
import { getTaskById, updateTask } from "@/services/taskService";

// Helper for the matrix layout
const EVALUATION_CRITERIA = [
  { id: "timeliness", label: "Timeliness & Punctuality" },
  { id: "quality", label: "Quality of Execution" },
  { id: "resource", label: "Resource Management" },
  { id: "team", label: "Team Coordination" },
  { id: "initiative", label: "Initiative & Problem Solving" },
  { id: "sop", label: "Adherence to SOPs" },
  { id: "tactical", label: "Tactical / Tech Proficiency" },
  { id: "communication", label: "Communication & Reporting" },
  { id: "endurance", label: "Endurance & Resilience" },
  { id: "security", label: "Security & Op Secrecy" },
];

const INITIAL_MATRIX = EVALUATION_CRITERIA.reduce((acc, curr) => {
  acc[curr.id] = 0; // 0 means unselected
  return acc;
}, {} as Record<string, number>);

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  const [form, setForm] = useState({
    task_number: "",
    title: "",
    description: "",
    category_id: "",
    assigned_to: "",
    priority: "Routine",
    status: "Pending",
    start_date: "",
    due_date: "",
    completion_date: "",
    strength: "",
    weakness: "",
    efficiency_evaluation: "", // New Field
    evaluation_matrix: INITIAL_MATRIX,
  });

  // Calculate total score dynamically
  const totalMark = Object.values(form.evaluation_matrix).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  useEffect(() => {
    async function loadTaskAndDependencies() {
      try {
        setLoading(true);

        const { data: catData } = await supabase
          .from("task_categories")
          .select("*")
          .order("name");
        if (catData) setCategories(catData);

        const personnelData = await getPersonnel();
        setPersonnelList(personnelData || []);

        const task = await getTaskById(id as string);

        if (task) {
          const autoStartDate =
            task.start_date ||
            (task.created_at
              ? new Date(task.created_at).toISOString().split("T")[0]
              : "");

          setForm({
            task_number: task.task_number || "",
            title: task.title || "",
            description: task.description || "",
            category_id: task.category_id ? String(task.category_id) : "",
            assigned_to: task.assigned_to || "",
            priority: task.priority || "Routine",
            status: task.status || "Pending",
            start_date: autoStartDate,
            due_date: task.due_date || "",
            completion_date: task.completion_date || "",
            strength: task.strength || "",
            weakness: task.weakness || "",
            efficiency_evaluation: task.efficiency_evaluation || "", // New Field mapping
            evaluation_matrix: task.evaluation_matrix || INITIAL_MATRIX,
          });

          if (task.assigned_to && personnelData) {
            const found = personnelData.find((p: any) => p.id === task.assigned_to);
            if (found) setSelectedPerson(found);
          }
        }
      } catch (error) {
        console.error("Error loading task details for edit:", error);
        alert("Failed to load task details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadTaskAndDependencies();
  }, [id]);

  const handleAssigneeChange = (personId: string) => {
    const person = personnelList.find((p) => p.id === personId) || null;
    setSelectedPerson(person);
    setForm((prev) => ({ ...prev, assigned_to: personId }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMatrixChange = (criterionId: string, score: number) => {
    setForm((prev) => ({
      ...prev,
      evaluation_matrix: {
        ...prev.evaluation_matrix,
        [criterionId]: score,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    // Validation: Ensure all 10 matrix rows have a score selected
    const matrixValues = Object.values(form.evaluation_matrix);
    if (matrixValues.some((val) => val === 0)) {
      alert("Please complete all fields in the Commander Evaluation Matrix before saving.");
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
        status: form.status,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        completion_date: form.completion_date || null,
        strength: form.strength || null,
        weakness: form.weakness || null,
        efficiency_evaluation: form.efficiency_evaluation || null, // New Field
        evaluation_matrix: form.evaluation_matrix,
        total_mark: totalMark,
      };

      await updateTask(id as string, payload);
      router.push(`/tasks/${id}`);
    } catch (error: any) {
      console.error("Failed to update task:", error);
      alert(error.message || "Failed to update task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500">
        Loading edit task form...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
          <p className="text-sm text-gray-500">
            Task No: <span className="font-semibold text-gray-900">{form.task_number || id}</span>
          </p>
        </div>

        <Link
          href={`/tasks/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* Section 1: Overview */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Task Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Task No.
              </label>
              <input
                type="text"
                disabled
                value={form.task_number || "Auto-generated"}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-700">
                Description / Detailed Instructions
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2: Assignment */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Assignment Details
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3: Status & Dates */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
            Execution Status & Dates
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none font-semibold text-gray-800"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Start Date (Auto-generated creation date - Read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Start Date (Auto Created)
              </label>
              <input
                type="text"
                disabled
                value={form.start_date || "Auto-generated"}
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
              />
            </div>

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

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Completion Date
              </label>
              <input
                type="date"
                name="completion_date"
                value={form.completion_date}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 4: Evaluation Matrix & Remarks */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Commander Evaluation Matrix <span className="text-red-500">*</span>
          </h2>
          <p className="mb-4 text-xs text-gray-500">
            Please rate the following criteria from 1 to 10. All rows are mandatory to calculate the final score.
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/30 mb-6">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="border-b border-gray-200 bg-gray-100/50">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Criteria</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <th key={num} className="p-3 text-center font-semibold text-gray-600 w-10">
                      {num}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EVALUATION_CRITERIA.map((criterion) => (
                  <tr key={criterion.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-medium text-gray-800">
                      {criterion.label}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <td key={num} className="p-3 text-center">
                        <input
                          type="radio"
                          name={criterion.id}
                          value={num}
                          checked={form.evaluation_matrix[criterion.id] === num}
                          onChange={() => handleMatrixChange(criterion.id, num)}
                          className="h-4 w-4 cursor-pointer text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mb-4 mt-8 text-xs font-bold uppercase tracking-wider text-blue-600">
            Efficiency & Feedback
          </h2>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Officer's Work Capacity / Efficiency Evaluation
            </label>
            <select
              name="efficiency_evaluation"
              value={form.efficiency_evaluation}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Option --</option>
              <option value="(1) Performed duties efficiently without the supervision of a superior.">
                (1) Performed duties efficiently without the supervision of a superior.
              </option>
              <option value="(2) Performed duties efficiently after receiving continuous guidance.">
                (2) Performed duties efficiently after receiving continuous guidance.
              </option>
              <option value="(3) Performed duties satisfactorily under the overall supervision of superiors.">
                (3) Performed duties satisfactorily under the overall supervision of superiors.
              </option>
              <option value="(4) Failed to perform duties successfully despite providing continuous guidance.">
                (4) Failed to perform duties successfully despite providing continuous guidance.
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Strength
              </label>
              <textarea
                name="strength"
                rows={3}
                placeholder="Note observed strengths..."
                value={form.strength}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Weakness
              </label>
              <textarea
                name="weakness"
                rows={3}
                placeholder="Note areas for improvement..."
                value={form.weakness}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            Final Evaluation Score
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Total Mark (Out of 100):</span>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-lg font-bold text-green-700">
              🔒 {totalMark}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/tasks/${id}`}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}