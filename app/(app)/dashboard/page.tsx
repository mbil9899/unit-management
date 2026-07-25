import { getCompanies } from "@/services/companyService";
export default async function DashboardPage() {
 const data = await getCompanies();

  console.log(data);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Dashboard Connected
      </h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}