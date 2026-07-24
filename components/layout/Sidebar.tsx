import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileText,
    Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h2 className="text-xl font-bold mb-8">Menu</h2>

      <nav className="space-y-4">
        <Link href="/dashboard" className="block hover:text-green-400">
          <LayoutDashboard size={20} />
Dashboard
        </Link>

        <Link href="/personnel" className="block hover:text-green-400">
        <Users size={20} />
          Personnel
        </Link>

        <Link href="/tasks" className="block hover:text-green-400">
        <ClipboardList size={20} />
          Tasks
        </Link>

        <Link href="/reports" className="block hover:text-green-400">
        <FileText size={20} />
          Reports
        </Link>

        <Link href="/settings" className="block hover:text-green-400">
        <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
}