"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [nextDeliverables, setNextDeliverables] = useState("");
  const [nextUpdateDate, setNextUpdateDate] = useState("");
  const [checklist, setChecklist] = useState<string[]>([""]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    setLoading(true);
    // Fetch tasks
    const { data: tData } = await supabase
      .from("my_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    
    // Fetch all updates for calendar highlights
    const { data: uData } = await supabase
      .from("my_task_updates")
      .select("*");

    if (tData) setTasks(tData);
    if (uData) setUpdates(uData);
    setLoading(false);
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 1. Insert Task
    const { data: newTask, error: taskError } = await supabase
      .from("my_tasks")
      .insert([{
        user_id: user.id,
        title,
        assigned_by: assignedBy,
        description,
        due_date: dueDate || null,
        next_update_deliverables: nextDeliverables,
        next_update_date: nextUpdateDate || null,
        progress: 0
      }])
      .select()
      .single();

    if (taskError) {
      alert("Error creating task.");
      return;
    }

    // 2. Insert Checklist Items
    const validItems = checklist.filter(item => item.trim() !== "");
    if (validItems.length > 0 && newTask) {
      const checklistPayload = validItems.map(item => ({
        task_id: newTask.id,
        item_text: item,
        is_completed: false
      }));
      await supabase.from("my_task_checklists").insert(checklistPayload);
    }

    // Reset Form & Reload
    setTitle(""); setAssignedBy(""); setDescription(""); setDueDate("");
    setNextDeliverables(""); setNextUpdateDate(""); setChecklist([""]);
    loadDashboardData();
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Determine indicator colors for a specific day string (YYYY-MM-DD)
  const getDayIndicators = (dateStr: string) => {
    const isDue = tasks.some(t => t.due_date === dateStr);
    const isNextUpdate = tasks.some(t => t.next_update_date === dateStr);
    const isPastUpdate = updates.some(u => u.update_date === dateStr);
    return { isDue, isNextUpdate, isPastUpdate };
  };

  const selectedDayHighlights = tasks.filter(t => t.due_date === selectedDay || t.next_update_date === selectedDay);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      
      {/* Header */}
      <div className="rounded-xl bg-blue-900 p-4 text-center shadow-sm">
        <h1 className="text-xl font-black tracking-widest text-white">TASK MANAGEMENT DASHBOARD</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: CREATE FORM */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold uppercase text-gray-800 border-b pb-2">Create New Task Form</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600">Task Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Enter task title" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600">Task Assigned By</label>
              <input type="text" value={assignedBy} onChange={e => setAssignedBy(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Select or enter assigner" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600">Task Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Enter task details..." />
            </div>

            <div>
              <label className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Checklist Progress</span>
                <button type="button" onClick={() => setChecklist([...checklist, ""])} className="text-blue-600 hover:text-blue-800">[+] Add Item</button>
              </label>
              <div className="mt-1 space-y-2">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" />
                    <input type="text" value={item} onChange={(e) => {
                      const newC = [...checklist]; newC[idx] = e.target.value; setChecklist(newC);
                    }} className="flex-1 rounded border-b border-gray-200 p-1 text-sm focus:border-blue-500 focus:outline-none" placeholder={`Item ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600">Next Update Date</label>
                <input type="date" value={nextUpdateDate} onChange={e => setNextUpdateDate(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600">What to Show in Next Update</label>
              <textarea rows={2} value={nextDeliverables} onChange={e => setNextDeliverables(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Planned updates..." />
            </div>

            <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              SAVE TASK
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: CALENDAR & LIST */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* CALENDAR */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-sm font-bold uppercase text-gray-800">Update & Deadline Calendar</h2>
              <div className="flex items-center gap-4 font-bold text-gray-700">
                <button onClick={prevMonth} className="px-2 py-1 hover:bg-gray-100 rounded">&lt;</button>
                <span className="w-32 text-center">{monthName}</span>
                <button onClick={nextMonth} className="px-2 py-1 hover:bg-gray-100 rounded">&gt;</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            
            <div className="mt-2 grid grid-cols-7 gap-1">
              {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="h-10 border border-transparent"></div>)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const { isDue, isNextUpdate, isPastUpdate } = getDayIndicators(dStr);
                
                return (
                  <button key={day} onClick={() => setSelectedDay(dStr)} className={`relative h-10 rounded border border-gray-100 hover:bg-gray-50 ${selectedDay === dStr ? 'ring-2 ring-blue-500' : ''}`}>
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                    <div className="absolute bottom-1 flex w-full justify-center gap-0.5">
                      {isDue && <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>}
                      {isNextUpdate && <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>}
                      {isPastUpdate && <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-4 text-xs font-medium text-gray-600 border-t pt-4">
              <span>Legend:</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Due Date</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Upcoming Update</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Past Update</span>
            </div>

            {selectedDay && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
                <h4 className="font-bold text-gray-800 mb-2">Selected Day Highlights ({selectedDay}):</h4>
                {selectedDayHighlights.length === 0 ? <p className="text-gray-500">No events.</p> : (
                  <ul className="space-y-1">
                    {selectedDayHighlights.map(t => (
                      <li key={t.id} className="text-gray-700">
                        {t.due_date === selectedDay && <span className="text-red-600">🔴 Due: {t.title}</span>}
                        {t.next_update_date === selectedDay && <span className="text-blue-600">🔵 Next Update: {t.title}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* TASK LIST */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-bold uppercase text-gray-800">Task List</h2>
             </div>
             <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Task Title</th>
                    <th className="px-4 py-3">Assigned By</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Next Update</th>
                    <th className="px-4 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-blue-600">
                        <Link href={`/my-tasks/${task.id}`}>{task.title}</Link>
                      </td>
                      <td className="px-4 py-3">{task.assigned_by || "-"}</td>
                      <td className="px-4 py-3">{task.due_date || "-"}</td>
                      <td className="px-4 py-3">{task.next_update_date || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full max-w-[80px] rounded-full bg-gray-200">
                            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold">{task.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">No tasks found. Create one on the left.</td></tr>
                  )}
                </tbody>
             </table>
          </div>

        </div>
      </div>
    </div>
  );
}