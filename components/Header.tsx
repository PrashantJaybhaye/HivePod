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
    <header className="h-20 border-b border-border bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
        )}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">{title}</h1>
          <p className="text-xs md:text-sm text-gray-500">{format(today, "EEEE, MMM d")}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 text-gray-400">
        <button className="hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        {/* Mock Theme Toggle */}
        <div className="hidden md:flex items-center gap-2 bg-card rounded-full p-1 border border-border">
          <div className="bg-primary text-white p-1 rounded-full">
            <Moon size={14} />
          </div>
          <div className="w-4 h-4 rounded-full bg-white mr-1"></div>
        </div>
      </div>
    </header>
  );
}
