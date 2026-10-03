import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* Your Fixed Sidebar */}
      <Sidebar />
      
      {/* 
        Main Content Wrapper 
        Added 'ml-64' to push this content to the right of the sidebar 
      */}
      <div className="flex-1 overflow-y-auto ml-64">
        {children}
      </div>
      
    </div>
  );
}