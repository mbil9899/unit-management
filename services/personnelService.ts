import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./authService";

// Create a new personnel
export async function createPersonnel(personnel: any) {
  const payload = {
    ...personnel,
    rank_id: personnel.rank_id ? Number(personnel.rank_id) : null,
    company_id: personnel.company_id ? Number(personnel.company_id) : null,
    appointment_id: personnel.appointment_id
      ? Number(personnel.appointment_id)
      : null,
    corps_id: personnel.corps_id
  ? Number(personnel.corps_id)
  : null,

platoon_id: personnel.platoon_id
  ? Number(personnel.platoon_id)
  : null,
  };

  // ===== DEBUG =====
  console.log("Personnel Payload:", payload);

  const { data, error } = await supabase
    .from("personnel")
    .insert([payload])
    .select();

  console.log("Supabase Data:", data);
  console.log("Supabase Error:", error);
  // ================

  if (error) throw error;

  return data[0];
}
export async function getPersonnel() {
  const user = await getCurrentUser();

  let query = supabase
    .from("personnel")
    .select(`
      *,
      ranks(rank_name),
      companies(name),
      appointments(appointment_name),
      platoons(platoon_name)
    `)
    .order("army_no");

  switch (user.role) {
    case "ADMIN":
    case "CONTINGENT COMMANDER":
    case "DEPUTY CONTINGENT COMMANDER":
      break;

    case "COMPANY COMMANDER":
    case "COMPANY CLERK":
      query = query.eq("company_id", user.company_id);
      break;

    case "PLATOON COMMANDER":
      // We'll add platoon filtering later.
      query = query.eq("company_id", user.company_id);
      break;

    default:
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}


export async function getPersonnelById(id: string) {
  const { data, error } = await supabase
    .from("personnel")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}


export async function updatePersonnel(
  id: string,
  personnel: any
) {
  const payload = {
    ...personnel,

    rank_id:
      personnel.rank_id
        ? Number(personnel.rank_id)
        : null,

    company_id:
      personnel.company_id
        ? Number(personnel.company_id)
        : null,

    appointment_id:
      personnel.appointment_id
        ? Number(personnel.appointment_id)
        : null,

    corps_id:
      personnel.corps_id
        ? Number(personnel.corps_id)
        : null,

      platoon_id:
  personnel.platoon_id
    ? Number(personnel.platoon_id)
    : null,  

    date_of_birth:
      personnel.date_of_birth || null,

    ret:
      personnel.ret || null,
  };

  const { data, error } = await supabase
    .from("personnel")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePersonnel(id: string) {
  const { error } = await supabase
    .from("personnel")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function uploadPersonnelPhoto(
  file: File,
  personnelId: string
) {
  const ext = file.name.split(".").pop();

  const fileName = `${personnelId}.${ext}`;

  const { error } = await supabase.storage
    .from("personnel-photos")
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("personnel-photos")
    .getPublicUrl(fileName);

  await supabase
    .from("personnel")
    .update({
      photo_url: publicUrl,
    })
    .eq("id", personnelId);

  return publicUrl;
}