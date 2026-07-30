"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Navigation Links
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Tasks", href: "/tasks", icon: "📋" },
    { name: "Personnel", href: "/personnel", icon: "👥" },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F8F9FB] font-sans overflow-hidden">
        
        {/* ========================================= */}
        {/* DESKTOP SIDEBAR (Matches Theme Reference) */}
        {/* ========================================= */}
        <aside className="w-[260px] bg-[#F8F9FB] flex-col justify-between py-8 px-6 hidden md:flex border-r border-gray-100/50">
          
          <div>
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-12 px-2">
              <img 
                src="/logo.png" 
                alt="BANRDB-9 Logo" 
                className="w-12 h-12 object-contain drop-shadow-sm"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                BANRDB-9
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${
                      isActive
                        ? "bg-white text-gray-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg opacity-80">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Section (Banner & Logout) */}
          <div className="space-y-4">
            
            {/* "Upgrade to Pro" style Banner */}
            <div className="bg-white rounded-3xl p-6 text-center shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-gray-50 mb-4">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Help & Docs</h4>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed font-medium">
                Get manuals and access unit documentation.
              </p>
              <button className="w-full bg-[#E5F0FF] text-blue-600 font-bold text-xs py-3 rounded-full hover:bg-blue-100 transition-colors">
                View Docs
              </button>
            </div>

            {/* Log Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 transition w-full rounded-2xl hover:bg-red-50"
            >
              <span className="text-lg opacity-80">🚪</span>
              Log out
            </button>
          </div>
        </aside>

        {/* ========================================= */}
        {/* MOBILE TOP BAR (For small screens)        */}
        {/* ========================================= */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="BANRDB-9 Logo" 
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <span className="text-lg font-bold text-gray-900">BANRDB-9</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-md"
          >
            Log out
          </button>
        </div>

        {/* ========================================= */}
        {/* MAIN CONTENT AREA                         */}
        {/* ========================================= */}
        <main className="flex-1 h-screen overflow-y-auto pt-16 md:pt-0 bg-[#F8F9FB]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}