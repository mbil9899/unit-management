import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-[#f8fafc] overflow-hidden">
        
        {/* This imports your newly updated Sidebar component! */}
        <Sidebar />

        {/* Main Content Area (Offset by the 64-width sidebar) */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}