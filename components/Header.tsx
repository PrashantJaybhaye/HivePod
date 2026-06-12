"use client";

import { useState } from "react";
import { Bell, Search, Menu, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  // Derive display info from Firebase user
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const displayInitial = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();
  const photoURL = user?.photoURL;

  let title = "Dashboard";
  if (pathname.includes("/course")) title = "Course View";
  if (pathname.includes("/admin")) title = "Admin Portal";

  return (
    <header className="h-13 shrink-0 border-b border-white/5 bg-[#111111] flex items-center justify-between px-5 sticky top-0 z-10 w-full">
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
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-hover/20 text-[#ef4444] border border-primary-hover/30 flex items-center justify-center text-xs font-bold shrink-0">
              {displayInitial}
            </div>
          )}
          <span className="text-[13px] font-medium text-neutral-200 truncate hidden sm:inline max-w-[100px]">
            {displayName}
          </span>
        </div>

        {/* Separator */}
        <div className="border-l border-white/5 h-4 mx-1 hidden sm:block"></div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-2 sm:px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          {isLoggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
        </button>
      </div>
    </header>
  );
}
