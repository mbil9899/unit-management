"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Personnel", href: "/personnel", icon: "👥" },
    { name: "Tasks", href: "/tasks", icon: "📋" }, // 👈 Task link added here
    { name: "Reports", href: "/reports", icon: "📈" },
  ];

  // Admin-only routes
  if (user?.role?.toUpperCase() === "ADMIN") {
    navigation.push({ name: "Users", href: "/users", icon: "⚙️" });
  }

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            U
          </div>
          <span className="font-bold text-gray-900 text-lg">Unit Manager</span>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Logged in as: <span className="font-semibold text-gray-600 uppercase">{user?.role || "User"}</span>
        </div>
      </div>
    </aside>
  );
}