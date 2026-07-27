import { supabase } from "@/lib/supabase";

export async function getUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      id,
      full_name,
      role,
      company_id,
      companies(name),
      created_at
    `)
    .order("full_name");

  if (error) throw error;

  return data;
}

export async function createUser(user: any) {
  const response = await fetch("/api/users/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }

  return result;
}