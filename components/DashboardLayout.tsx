"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "./AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, user, pathname, router]);

  // Skip dashboard shell for auth pages
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show nothing while auth is loading or if not logged in (redirect pending)
  if (loading || !user) {
    return null;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-background">
      {/* Sidebar - fixed on desktop, absolute and toggleable on mobile */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-[260px] min-w-0 transition-all duration-300 relative z-0 h-screen overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto pt-6">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

