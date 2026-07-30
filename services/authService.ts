import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  // 1. Get authenticated session user from Supabase Auth
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // 2. Fetch role and unit assignment from user_profiles using maybeSingle()
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select(`
      *,
      companies(name),
      personnel(full_name, army_no, ranks(rank_name))
    `)
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
  }

  return {
    id: authUser.id,
    email: authUser.email,
    role: profile?.role || "USER",
    company_id: profile?.company_id || null,
    personnel_id: profile?.personnel_id || null,
    is_active: profile?.is_active ?? true,
    company: profile?.companies || null,
    personnel: profile?.personnel || null,
  };
}

// Alias export to satisfy AuthGuard imports
export const getCurrentUserProfile = getCurrentUser;

// Sign out function for user logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}