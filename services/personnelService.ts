import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./authService";

// Fetch personnel based on RBAC visibility rules
export async function getPersonnel() {
  const user = await getCurrentUser();

  let query = supabase
    .from("personnel")
    .select(`
      *,
      ranks(rank_name),
      corps(corps_name),
      companies(name),
      platoons(platoon_name),
      appointments(appointment_name)
    `)
    .order("created_at", { ascending: false });

  // ... (leave the rest of your RBAC logic the same)

  const role = user?.role ? user.role.toUpperCase().trim() : "";

  // Enforce data visibility based on user role
  switch (role) {
    case "ADMIN":
    case "CONTINGENT COMMANDER":
    case "DEPUTY CONTINGENT COMMANDER":
      // Full battalion visibility — no company_id restriction
      break;

    case "COMPANY COMMANDER":
    case "COMPANY CLERK":
      if (user?.company_id) {
        query = query.eq("company_id", user.company_id);
      }
      break;

    case "PLATOON COMMANDER":
      if (user?.platoon_id) {
        query = query.eq("platoon_id", user.platoon_id);
      } else if (user?.company_id) {
        query = query.eq("company_id", user.company_id);
      }
      break;

    default:
      if (user?.personnel_id) {
        query = query.eq("id", user.personnel_id);
      }
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching personnel:", error);
    throw error;
  }

  return data;
}

// Fetch single personnel record by ID
// Fetch single personnel record by ID
export async function getPersonnelById(id: string) {
  const { data, error } = await supabase
    .from("personnel")
    .select(`
      *,
      ranks(rank_name),
      corps(corps_name),
      companies(name),
      platoons(platoon_name),
      appointments(appointment_name)
    `)
    .eq("id", id)
    .single();

  // ... (leave the rest the same)

  if (error) {
    console.error("Error fetching personnel by ID:", error);
    throw error;
  }

  return data;
}

// Create personnel (Guard: Company Commander restricted)
export async function createPersonnel(personnelData: any) {
  const user = await getCurrentUser();
  const role = user?.role ? user.role.toUpperCase().trim() : "";

  if (role === "COMPANY COMMANDER") {
    throw new Error("Company Commanders are not authorized to create personnel records.");
  }

  const { data, error } = await supabase
    .from("personnel")
    .insert([personnelData])
    .select();

  if (error) throw error;
  return data[0];
}

// Update personnel (Guard: Company Commander restricted)
export async function updatePersonnel(id: string, personnelData: any) {
  const user = await getCurrentUser();
  const role = user?.role ? user.role.toUpperCase().trim() : "";

  if (role === "COMPANY COMMANDER") {
    throw new Error("Company Commanders are not authorized to edit personnel records.");
  }

  const { data, error } = await supabase
    .from("personnel")
    .update({ ...personnelData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete personnel (Guard: Restricted to Admin and Contingent Command)
export async function deletePersonnel(id: string) {
  const user = await getCurrentUser();
  const role = user?.role ? user.role.toUpperCase().trim() : "";

  if (!["ADMIN", "CONTINGENT COMMANDER", "DEPUTY CONTINGENT COMMANDER"].includes(role)) {
    throw new Error("You are not authorized to delete personnel records.");
  }

  const { error } = await supabase
    .from("personnel")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Upload Personnel Photo to Supabase Storage
// ✅ CORRECTED CODE (Uploads to the bucket root)
// ... (rest of your code above)

// Upload Personnel Photo to Supabase Storage
export async function uploadPersonnelPhoto(file: File) {
  try {
    // Generate a unique file name
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpeg`;
    
    // Set the path to JUST the file name (no "photos/" prefix)
    const filePath = `${fileName}`; 

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("personnel-photos")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("personnel-photos")
      .getPublicUrl(filePath);

    // Return the URL safely inside the try block
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}
// <-- THE FILE SHOULD END EXACTLY HERE. NO CODE BELOW THIS LINE.