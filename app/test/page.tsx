import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("personnel")
    .select("*");

  return (
    <div className="p-8">
      <h1>Supabase Connection Test</h1>

      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </div>
  );
}