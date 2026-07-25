import { supabase } from "@/lib/supabase";

export async function getUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      id,
      full_name,
      role,
      company_id,
      companies(name),
      created_at
    `)
    .order("full_name");

  if (error) throw error;

  return data;
}