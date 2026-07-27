import { supabase } from "@/lib/supabase";

export async function getTaskCategories() {
  const { data, error } = await supabase
    .from("task_categories")
    .select("*")
    .order("name");

  if (error) throw error;

  return data;
}

export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) throw error;

  return data;
}

export async function getPersonnelByCompany(companyId: number) {
  const { data, error } = await supabase
    .from("personnel")
    .select("id, army_no, full_name")
    .eq("company_id", companyId)
    .order("army_no");

  if (error) throw error;

  return data;
}

export async function createTask(task: any) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
  {
    ...task,
    task_number: undefined,
  },
])
    .select();

  if (error) throw error;

  return data;
}

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      id,
      task_number,
      title,
      status,
      due_date,

      personnel:assigned_to(
        full_name,
        army_no
      ),

      companies(
        short_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      task_categories(name),
      companies(name),
      personnel:assigned_to(
        army_no,
        full_name
      ),
      user_profiles:assigned_by(
        full_name
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
export async function updateTask(id: string, task: any) {
  const payload = {
    ...task,

    category_id: task.category_id
      ? Number(task.category_id)
      : null,

    company_id: task.company_id
      ? Number(task.company_id)
      : null,

    assigned_to:
      task.assigned_to && task.assigned_to !== ""
        ? task.assigned_to
        : null,

    assigned_by:
      task.assigned_by && task.assigned_by !== ""
        ? task.assigned_by
        : null,

    start_date: task.start_date || null,

    due_date: task.due_date || null,

    completion_date: task.completion_date || null,

    evaluation: task.evaluation || null,

    remarks: task.remarks || null,
  };

  console.log("Updating Task ID:", id);
  console.log("Payload:", payload);

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}