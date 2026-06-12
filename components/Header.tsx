"use client";

import { Bell, Search, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  let title = "Dashboard";
  if (pathname.includes("/course")) title = "Course View";
  if (pathname.includes("/admin")) title = "Admin Portal";

  return (
    <header className="h-13 shrink-0 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-5 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white cursor-pointer">
            <Menu size={18} />
          </button>
        )}
        <h1 className="text-sm font-medium text-neutral-200 hidden md:block">{title}</h1>
      </div>

      {/* Center Links (Optional, maybe hide on small screens) */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="text-gray-300 hover:text-white transition-colors">Catalog</Link>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Community</Link>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Support</Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4 text-gray-400">
        <button className="hover:text-white transition-colors cursor-pointer">
          <Search size={16} />
        </button>
        <button className="hover:text-white transition-colors relative cursor-pointer">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Separator */}
        <div className="border-l border-white/5 h-4 mx-1 hidden sm:block"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#dc2626]/20 text-[#ef4444] border border-[#dc2626]/30 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.email?.substring(0, 1).toUpperCase() || "P"}
          </div>
          <span className="text-[13px] font-medium text-neutral-200 truncate hidden sm:inline max-w-[100px]">
            {user?.email ? user.email.split('@')[0] : "Prashant"}
          </span>
        </div>

        {/* Separator */}
        <div className="border-l border-white/5 h-4 mx-1 hidden sm:block"></div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-2 sm:px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Log Out</span>
          <LogOut size={12} />
        </button>
      </div>
    </header>
  );
}
