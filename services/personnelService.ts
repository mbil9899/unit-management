import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./authService";

export async function getPersonnel() {
  const user = await getCurrentUser();
  const role = user?.role ? String(user.role).toUpperCase().trim() : "";

  // Fetch personnel with all relations AND their assigned tasks (for counting)
  let query = supabase
    .from("personnel")
    .select(`
      *,
      ranks(rank_name),
      companies(name),
      platoons(platoon_name),
      appointments(appointment_name),
      corps(corps_name),
      tasks:tasks!tasks_assigned_to_fkey(id)
    `)
    .order("created_at", { ascending: false });

  // RBAC: Company Commander and Clerk can only see their own company's personnel
  if ((role === "COMPANY COMMANDER" || role === "COMPANY CLERK") && user?.company_id) {
    query = query.eq("company_id", user.company_id);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching personnel:", error);
    throw error;
  }
  
  return data;
}

export async function getPersonnelById(id: string) {
  const { data, error } = await supabase
    .from("personnel")
    .select(`
      *,
      ranks(*),
      companies(*),
      platoons(*),
      appointments(*),
      corps(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching personnel by ID:", error);
    throw error;
  }
  
  return data;
}

export async function createPersonnel(personnelData: any) {
  const { data, error } = await supabase
    .from("personnel")
    .insert([personnelData])
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function updatePersonnel(id: string, updates: any) {
  const { data, error } = await supabase
    .from("personnel")
    .update(updates)
    .eq("id", id)
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function deletePersonnel(id: string) {
  const { error } = await supabase
    .from("personnel")
    .delete()
    .eq("id", id);
    
  if (error) throw error;
}

// RESTORED: Upload personnel photo to Supabase Storage
export async function uploadPersonnelPhoto(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `photos/${fileName}`;

    // Note: If your storage bucket is named something other than "personnel", 
    // change it here (e.g., "avatars", "images", "personnel-photos")
    const { error: uploadError } = await supabase.storage
      .from("personnel") 
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("personnel")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}