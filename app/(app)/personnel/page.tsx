import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";

export default function PersonnelPage() {
  return (
    <div>
      <PageHeader
        title="Personnel Management"
        subtitle="Manage all personnel records"
        actions={
          <Button>
            + Add Personnel
          </Button>
        }
      />

      <div className="mb-6">
        <SearchBar />
      </div>

      <Table
        headers={[
          "Army No",
          "Rank",
          "Name",
          "Company",
          "Appointment",
          "Status",
          "Actions",
        ]}
      >
        <tr className="border-t">
          <td className="px-4 py-3">BA-1234</td>
          <td className="px-4 py-3">Capt</td>
          <td className="px-4 py-3">Rahim</td>
          <td className="px-4 py-3">Alpha</td>
          <td className="px-4 py-3">OC</td>
          <td>
    <Badge status="Active" />
</td>
          <td className="px-4 py-3">
            <Button variant="secondary">
              Edit
            </Button>
          </td>
        </tr>

        <tr className="border-t">
          <td className="px-4 py-3">BA-1235</td>
          <td className="px-4 py-3">Lt</td>
          <td className="px-4 py-3">Karim</td>
          <td className="px-4 py-3">Bravo</td>
          <td className="px-4 py-3">2IC</td>
          <td>
    <Badge status="Leave" />
</td>
          <td className="px-4 py-3">
            <Button variant="secondary">
              Edit
            </Button>
          </td>
        </tr>
      </Table>
    </div>
  );
}