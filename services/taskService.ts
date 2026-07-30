import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./authService";

// Fetch tasks with RBAC scoping applied
export async function getTasks() {
  const user = await getCurrentUser();

  let query = supabase
    .from("tasks")
    // Replace the select query inside getTasks() and getTaskById() with:
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

  const role = user?.role ? user.role.toUpperCase() : "";

  // Enforce data visibility based on user role
  switch (role) {
    case "ADMIN":
    case "CONTINGENT COMMANDER":
    case "DEPUTY CONTINGENT COMMANDER":
      break;

    case "COMPANY COMMANDER":
    case "COMPANY CLERK":
      if (user?.company_id) {
        query = query.eq("company_id", user.company_id);
      }
      break;

    default:
      if (user?.personnel_id) {
        query = query.eq("assigned_to", user.personnel_id);
      }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  return data;
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      task_categories(name),
      companies(name),
      personnel!tasks_assigned_to_fkey(
        id,
        full_name,
        army_no,
        ranks(rank_name)
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

export async function createTask(task: any) {
  const payload = {
    title: task.title,
    description: task.description || null,
    priority: task.priority || "Routine",
    status: task.status || "Pending",
    start_date: task.start_date || null,
    due_date: task.due_date || null,
    category_id: task.category_id ? Number(task.category_id) : null,
    company_id: task.company_id ? Number(task.company_id) : null,
    assigned_to: task.assigned_to || null,
    assigned_by: task.assigned_by || null,
    remarks: task.remarks || null,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateTask(id: string, taskData: any) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ 
      ...taskData, // This passes the new payload exactly as it comes from page.tsx
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function updateTaskStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}