"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Notice: We only extract 'user' here, which fixes the TypeScript error!
  const { user } = useAuth();

  const role = user?.role ? String(user.role).toUpperCase().trim() : "";
  const isCompanyClerk = role === "COMPANY CLERK";

  // Handle Logout safely using Supabase directly
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Navigation Menu Array
  let navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      )
    },
    { 
      name: "Tasks", 
      href: "/tasks", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      ) 
    },
    { 
      name: "Personnel", 
      href: "/personnel", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) 
    },
    // NEW: My Task Option
    { 
      name: "My Task", 
      href: "/my-tasks", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      ) 
    },
  ];

  // RBAC filtering: Hide Tasks if the user is a Company Clerk
  if (isCompanyClerk) {
    navigation = navigation.filter((item) => item.name !== "Tasks");
  }

  return (
    <aside className="w-64 h-screen bg-[#f8fafc] border-r border-gray-100 flex flex-col justify-between fixed left-0 top-0">
      
      {/* Top Section */}
      <div>
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="relative w-10 h-10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-wide">BANRDB-9</span>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                }`}
              >
                <span className={`${isActive ? "text-orange-400" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4 mb-4">
        
        {/* Help & Docs Card */}
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-2">Help & Docs</h3>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Get manuals and access unit documentation.
          </p>
          <button className="w-full bg-[#eff6ff] text-blue-600 font-bold text-xs py-3 rounded-xl hover:bg-blue-100 transition">
            View Docs
          </button>
        </div>

        {/* Log Out Button */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>

      </div>
    </aside>
  );
}