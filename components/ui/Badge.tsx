type BadgeProps = {
  status: "Active" | "Leave" | "Course" | "Retired";
};

export default function Badge({
  status,
}: BadgeProps) {
  const colors = {
    Active: "bg-green-100 text-green-700",

    Leave: "bg-yellow-100 text-yellow-700",

    Course: "bg-blue-100 text-blue-700",

    Retired: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
}