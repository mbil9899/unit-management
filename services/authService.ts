import { supabase } from "@/lib/supabase";

export async function getCurrentUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      *,
      companies(name)
    `)
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data;
}

// Backward compatibility
export async function getCurrentUser() {
  return getCurrentUserProfile();
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}