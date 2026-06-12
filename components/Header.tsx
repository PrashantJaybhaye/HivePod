"use client";

import { Search, Bell, Moon, Menu } from "lucide-react";
import { format } from "date-fns";
import { usePathname } from "next/navigation";

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const today = new Date();
  const pathname = usePathname();
  let title = "Dashboard";
  
  if (pathname.includes("/course")) title = "Course View";
  if (pathname.includes("/admin")) title = "Admin Panel";
  
  return (
    <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
        )}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-white">{title}</h1>
          <p className="text-xs text-gray-500 font-medium">{format(today, "EEEE, MMM d")}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-gray-400">
        {/* Removed dummy notification bell and mock theme toggle */}
      </div>
    </header>
  );
}
