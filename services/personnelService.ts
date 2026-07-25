import { supabase } from "@/lib/supabase";

// Create a new personnel
export async function createPersonnel(personnel: any) {
  const payload = {
    ...personnel,
    rank_id: personnel.rank_id ? Number(personnel.rank_id) : null,
    company_id: personnel.company_id ? Number(personnel.company_id) : null,
    appointment_id: personnel.appointment_id
      ? Number(personnel.appointment_id)
      : null,
    corps_id: personnel.corps_id ? Number(personnel.corps_id) : null,
  };

  const { data, error } = await supabase
    .from("personnel")
    .insert([payload])
    .select();

  if (error) throw error;

  return data;
}

// Get all personnel
export async function getPersonnel() {
  const { data, error } = await supabase
    .from("personnel")
    .select(`
      id,
      army_no,
      full_name,
      ranks(rank_name),
      companies(name),
      appointments(appointment_name)
    `)
    .order("army_no");

  console.log("Personnel:", data);
  console.log("Error:", error);

  if (error) throw error;

  return data;
}
export async function getPersonnelById(id: string) {
  const { data, error } = await supabase
    .from("personnel")
    .select(`
      *,
      ranks(rank_name),
      companies(name),
      appointments(appointment_name),
      corps(name)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}