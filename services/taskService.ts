import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./authService";

// Fetch tasks with RBAC scoping applied
export async function getTasks() {
  const user = await getCurrentUser();
  const role = user?.role ? String(user.role).toUpperCase().trim() : "";

  // RBAC: Company Clerks cannot see tasks at all
  if (role === "COMPANY CLERK") {
    return [];
  }

  let query = supabase
    .from("tasks")
    .select(`
      *,
      companies(name),
      task_categories(name),
      assigned_personnel:personnel!tasks_assigned_to_fkey(
        id, 
        full_name, 
        army_no,
        ranks(rank_name),
        companies(name),
        platoons(platoon_name)
      )
    `)
    .order("created_at", { ascending: false });

  // RBAC: Enforce data visibility based on user role
  switch (role) {
    case "ADMIN":
    case "CONTINGENT COMMANDER":
    case "CONTIGENT COMMANDER": // Added to handle potential database typos
    case "DEPUTY CONTINGENT COMMANDER":
      break; // Sees everything

    case "COMPANY COMMANDER":
      if (user?.company_id) {
        query = query.eq("company_id", user.company_id);
      }
      break;

    default: // Platoon Commanders and others
      if (user?.personnel_id) {
        query = query.eq("assigned_to", user.personnel_id);
      }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Create a new task (FIXED: Added task_number, removed remarks)
export async function createTask(task: any) {
  const user = await getCurrentUser();
  const role = user?.role ? String(user.role).toUpperCase().trim() : "";

  // RBAC: Force Company Commander's tasks to their own company
  let finalCompanyId = task.company_id ? Number(task.company_id) : null;
  if (role === "COMPANY COMMANDER" && user?.company_id) {
    finalCompanyId = user.company_id;
  }

  // Generate a reliable task number using the current timestamp to satisfy the DB constraint
  const generatedTaskNumber = `TSK-${Date.now().toString().slice(-6)}`;

  const payload = {
    task_number: generatedTaskNumber,
    title: task.title,
    description: task.description || null,
    priority: task.priority || "Routine",
    status: task.status || "Pending",
    start_date: task.start_date || null,
    due_date: task.due_date || null,
    category_id: task.category_id ? Number(task.category_id) : null,
    company_id: finalCompanyId, 
    assigned_to: task.assigned_to || null,
    assigned_by: user?.personnel_id || null, 
  };

  const { data, error } = await supabase.from("tasks").insert([payload]).select();
  if (error) throw error;
  return data[0];
}

// Fetch a single task by ID
export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      task_categories(name),
      companies(name),
      assigned_personnel:personnel!tasks_assigned_to_fkey(
        id,
        full_name,
        army_no,
        company_id,
        ranks(rank_name),
        companies(name),
        platoons(platoon_name)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching task by ID:", error);
    throw error;
  }
  
  return data;
}

// Update a task (Evaluation & Edits)
export async function updateTask(id: string, updates: any) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// Delete a task securely
export async function deleteTask(id: string) {
  const user = await getCurrentUser();
  const role = user?.role ? String(user.role).toUpperCase().trim() : "";

  // RBAC Security Check
  if (role === "COMPANY CLERK" || role === "PLATOON COMMANDER") {
    throw new Error("Unauthorized: You do not have permission to delete tasks.");
  }

  // Enforce Company Commander can ONLY delete their own company's tasks
  if (role === "COMPANY COMMANDER") {
    const task = await getTaskById(id);
    if (task.company_id !== user.company_id) {
      throw new Error("Unauthorized: You can only delete tasks belonging to your own company.");
    }
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}