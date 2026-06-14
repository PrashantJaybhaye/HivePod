"use client";

import { useState } from "react";
import { Bell, Search, Menu, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";

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
    <header className="h-14 shrink-0 border-b border-white/4 bg-[#060606]/60 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Mobile Logo & Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/logo.png" alt="HivePod Logo" className="w-5.5 h-5.5 object-contain" />
          <span className="font-black text-sm tracking-tight text-white bg-linear-to-r from-white to-white/80 bg-clip-text">HivePod</span>
        </div>

        <h1 className="text-xs font-bold tracking-wider text-white/50 capitalize hidden md:block">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5 text-white/50">
        <button className="hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
          <Search size={15} />
        </button>
        <button className="hover:text-white transition-colors relative cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff453a] rounded-full shadow-[0_0_6px_#ff453a]"></span>
        </button>

        {/* Separator */}
        <div className="border-l border-white/6 h-4 mx-0.5 hidden sm:block"></div>

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
            <div className="w-7 h-7 rounded-full bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/25 flex items-center justify-center text-[10px] font-black shrink-0">
              {displayInitial}
            </div>
          )}
          <span className="text-xs font-bold text-white/80 truncate hidden sm:inline max-w-[100px]">
            {displayName}
          </span>
        </div>

        {/* Separator */}
        <div className="border-l border-white/6 h-4 mx-0.5 hidden sm:block"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-[11px] font-bold text-white/70 hover:text-white border border-white/8 hover:bg-white/4 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          {isLoggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
        </button>
      </div>
    </header>
  );
}
