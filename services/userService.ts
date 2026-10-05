import { supabase } from "@/lib/supabase";


// Ensure BOTH functions are explicitly exported
export async function getPersonnelWithoutAccount() {
  const { data, error } = await supabase
    .from("personnel")
    .select("id, full_name, rank_id, ranks(rank_name)")
    // Add whatever filter you use to check if they lack an account, for example:
    // .is("user_id", null) 
  
  if (error) {
    console.error("Error fetching personnel:", error);
    return []; // Return empty array on error
  }
  
  return data || []; // MUST return the data here!
}

export async function createUser(data: any) {
  // Your create logic here in this line
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