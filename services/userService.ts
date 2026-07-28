import { supabase } from "@/lib/supabase";

export async function getUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      *,
      companies(name),
      appointments(appointment_name)
    `)
    .order("full_name");

  if (error) throw error;

  return data;
}