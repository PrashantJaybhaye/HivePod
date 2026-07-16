"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useAuth } from "./AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-background pb-24 md:pb-0">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-[260px] min-w-0 transition-all duration-300 relative z-0 h-screen overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto pt-6 pb-4">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <BottomNav />
    </div>
  );
}

