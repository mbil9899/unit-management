import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export default function DashboardPage() {
  return (
    <div>

<PageHeader
    title="Admin Dashboard"
    subtitle="Overview of personnel and task statistics"
    actions={
        <Button>
            Add Personnel
        </Button>
    }
/>

<div className="mb-8 flex gap-4">

    <Button>
        Add Personnel
    </Button>

    <Button variant="secondary">
        Export
    </Button>

    <Button variant="danger">
        Delete
    </Button>

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard
          title="Personnel"
          value="120"
        />

        <StatCard
          title="Companies"
          value="5"
        />

        <StatCard
          title="Pending Tasks"
          value="18"
        />

        <StatCard
          title="Officers"
          value="18"
        />

        <StatCard
          title="JCOs"
          value="18"
        />

        <StatCard
          title="Other Ranks"
          value="18"
        />

          <StatCard
          title="Civilian"
          value="18"
        />

      </div>

    </div>
  );
}