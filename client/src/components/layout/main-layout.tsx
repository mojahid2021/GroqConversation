import { useState, ReactNode } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#F7FAFC]">
      {/* Sidebar - hidden on mobile, visible on md screens and up */}
      <Sidebar className="hidden md:flex" />
      
      {/* Mobile Sidebar - conditionally shown */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={handleToggleSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-40 w-64">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
