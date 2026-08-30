"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [task, setTask] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Form State
  const [accomplished, setAccomplished] = useState("");
  const [plannedNext, setPlannedNext] = useState("");
  const [newNextDate, setNewNextDate] = useState("");

  // New Checklist Item State
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    
    // Load Task
    const { data: tData } = await supabase.from("my_tasks").select("*").eq("id", id).single();
    if (tData) setTask(tData);

    // Load Checklists
    const { data: cData } = await supabase.from("my_task_checklists").select("*").eq("task_id", id).order("created_at");
    if (cData) setChecklists(cData);

    // Load History
    const { data: hData } = await supabase.from("my_task_updates").select("*").eq("task_id", id).order("created_at", { ascending: false });
    if (hData) setHistory(hData);

    setLoading(false);
  }

  const toggleChecklist = async (checkId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Update local state for immediate feedback
    const updatedChecklists = checklists.map(c => c.id === checkId ? { ...c, is_completed: newStatus } : c);
    setChecklists(updatedChecklists);

    // Calculate new progress
    const total = updatedChecklists.length;
    const completed = updatedChecklists.filter(c => c.is_completed).length;
    const newProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update DB Checklist
    await supabase.from("my_task_checklists").update({ is_completed: newStatus }).eq("id", checkId);
    
    // Update DB Task Progress
    await supabase.from("my_tasks").update({ progress: newProgress }).eq("id", id);
    setTask((prev: any) => ({ ...prev, progress: newProgress }));
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    setIsAddingChecklist(true);

    try {
      // Insert new checklist item into DB
      const { data: newItem, error } = await supabase
        .from("my_task_checklists")
        .insert([{
          task_id: id,
          item_text: newChecklistItem.trim(),
          is_completed: false
        }])
        .select()
        .single();

      if (error) throw error;

      if (newItem) {
        // Update local state
        const updatedChecklists = [...checklists, newItem];
        setChecklists(updatedChecklists);

        // Recalculate progress with the new (uncompleted) item
        const total = updatedChecklists.length;
        const completed = updatedChecklists.filter(c => c.is_completed).length;
        const newProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

        // Update DB Task Progress
        await supabase.from("my_tasks").update({ progress: newProgress }).eq("id", id);
        setTask((prev: any) => ({ ...prev, progress: newProgress }));

        // Clear input
        setNewChecklistItem("");
      }
    } catch (err) {
      console.error("Error adding checklist item:", err);
      alert("Failed to add checklist item.");
    } finally {
      setIsAddingChecklist(false);
    }
  };

  const handleLogUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplished.trim()) return;

    // Insert Log
    await supabase.from("my_task_updates").insert([{
      task_id: id,
      accomplished,
      planned_next: plannedNext
    }]);

    // Optionally update task deliverables/date if provided
    const updates: any = {};
    if (plannedNext) updates.next_update_deliverables = plannedNext;
    if (newNextDate) updates.next_update_date = newNextDate;
    
    if (Object.keys(updates).length > 0) {
      await supabase.from("my_tasks").update(updates).eq("id", id);
    }

    setAccomplished(""); setPlannedNext(""); setNewNextDate("");
    loadData(); // Refresh page data
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await supabase.from("my_tasks").delete().eq("id", id);
      router.push("/my-tasks");
    }
  };

  if (loading || !task) return <div className="p-8 text-center text-gray-500">Loading Task Details...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between rounded-lg bg-gray-100 p-3">
        <Link href="/my-tasks" className="text-sm font-bold text-blue-600 hover:underline">
          &lt;- BACK TO DASHBOARD
        </Link>
        <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">Task Details & Update Page</span>
        <div className="space-x-3">
          <button className="text-sm font-bold text-gray-600 hover:text-gray-900">[ EDIT ]</button>
          <button onClick={handleDelete} className="text-sm font-bold text-red-600 hover:text-red-800">[ DELETE ]</button>
        </div>
      </div>

      {/* TASK OVERVIEW */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-2">TASK TITLE: {task.title}</h1>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <span>Assigned By: <strong className="text-gray-900">{task.assigned_by || "N/A"}</strong></span>
          <span>|</span>
          <span>Due Date: <strong className="text-gray-900">{task.due_date || "N/A"} 🔴</strong></span>
          <span>|</span>
          <span>Status: <strong className="text-blue-600">{task.status}</strong></span>
        </div>
      </div>

      {/* SPLIT PANELS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* LEFT: STATUS & CHECKLIST */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase text-gray-800 border-b pb-2">Current Status & Checklist</h2>
          
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 mb-1">Description:</h3>
            <p className="text-sm text-gray-800">{task.description || "No description provided."}</p>
          </div>

          <div className="mb-6 flex-1">
            <h3 className="text-xs font-bold text-gray-500 mb-2">Checklist:</h3>
            <div className="space-y-2 mb-4">
              {checklists.map(c => (
                <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={c.is_completed}
                    onChange={() => toggleChecklist(c.id, c.is_completed)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className={`text-sm transition-colors ${c.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {c.item_text}
                  </span>
                </label>
              ))}
              {checklists.length === 0 && <span className="text-sm text-gray-400">No checklist items.</span>}
            </div>

            {/* ADD NEW CHECKLIST ITEM FORM */}
            <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add new checklist item..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                disabled={isAddingChecklist}
              />
              <button
                type="submit"
                disabled={isAddingChecklist || !newChecklistItem.trim()}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
              >
                {isAddingChecklist ? "Adding..." : "Add"}
              </button>
            </form>
          </div>

          <div className="mt-auto border-t pt-4">
            <h3 className="text-xs font-bold text-gray-500 mb-1">Progress Bar: {task.progress}%</h3>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* RIGHT: UPDATE ACTION PANEL */}
        <div className="rounded-xl border border-gray-200 bg-blue-50/50 p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase text-gray-800 border-b pb-2">Update Action Panel</h2>
          <form onSubmit={handleLogUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Add New Update Log:</label>
              <textarea 
                required 
                value={accomplished}
                onChange={e => setAccomplished(e.target.value)}
                rows={3} 
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none" 
                placeholder="What was accomplished in this update?" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700">Next Update Deliverables:</label>
              <textarea 
                value={plannedNext}
                onChange={e => setPlannedNext(e.target.value)}
                rows={2} 
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none" 
                placeholder="What to show in next update..." 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Next Update Date:</label>
              <input 
                type="date" 
                value={newNextDate}
                onChange={e => setNewNextDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none" 
              />
            </div>

            <button type="submit" className="w-full rounded-lg bg-gray-900 py-3 text-sm font-bold text-white hover:bg-black transition">
              [ LOG UPDATE BUTTON ]
            </button>
          </form>
        </div>

      </div>

      {/* UPDATE HISTORY */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase text-gray-800 border-b pb-2">Update History & Timeline</h2>
        
        <div className="space-y-4">
          {history.map((log, index) => (
            <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h3 className="font-bold text-gray-900 mb-2">
                🗓️ {new Date(log.created_at).toLocaleDateString()} - Update #{history.length - index}
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside ml-4">
                <li><strong className="font-medium text-gray-900">Accomplished:</strong> {log.accomplished}</li>
                {log.planned_next && (
                  <li><strong className="font-medium text-gray-900">Planned for next:</strong> {log.planned_next}</li>
                )}
              </ul>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-gray-500 italic">No updates logged yet.</p>}
        </div>
      </div>

    </div>
  );
}