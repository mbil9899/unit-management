import { supabase } from "@/lib/supabase";


// Ensure BOTH functions are explicitly exported
export async function getPersonnelWithoutAccount() {
  // Your fetch logic here
}

export async function createUser(data: any) {
  // Your create logic here
}



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