import { supabase } from "@/lib/supabase";

export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}