import { supabase } from "@/lib/supabase";

export async function getRanks() {
  const { data, error } = await supabase
    .from("ranks")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getCorps() {
  const { data, error } = await supabase
    .from("corps")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getPlatoons() {
  const { data, error } = await supabase
    .from("platoons")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getPlatoonsByCompany(companyId: number) {
  const { data, error } = await supabase
    .from("platoons")
    .select("*")
    .eq("company_id", companyId)
    .order("id");

  if (error) throw error;

  return data;
}