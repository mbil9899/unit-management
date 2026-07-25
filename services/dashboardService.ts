import { supabase } from "@/lib/supabase";

export async function getDashboardStats() {
  const [
    personnelResult,
    companyResult,
    userResult,
  ] = await Promise.all([
    supabase.from("personnel").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
  ]);

  return {
    personnel: personnelResult.count ?? 0,
    companies: companyResult.count ?? 0,
    users: userResult.count ?? 0,
    activeTasks: 0, // Will come from the tasks table later
  };
}