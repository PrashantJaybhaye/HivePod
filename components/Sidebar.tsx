"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Award, Settings, X, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Courses", href: "/my-courses", icon: BookOpen },
    { name: "Certificates", href: "/certificates", icon: Award },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={`w-[220px] shrink-0 bg-[#0a0a0a] border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-20 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>
      <div className="h-11 flex items-center justify-between px-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
           <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
             <BookOpen size={12} className="text-white" />
           </div>
           <span className="text-white text-sm font-semibold tracking-wide">HivePod</span>
        </Link>
        {setIsOpen && (
          <button 
            className="text-gray-500 hover:text-white md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-[13px] font-medium
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }
              `}
            >
              <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 hover:bg-white/5 cursor-pointer rounded-md p-2 transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.email?.substring(0, 1).toUpperCase() || "P"}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-[13px] font-medium text-white truncate">
              {user?.email ? user.email.split('@')[0] : "Prashant"}
            </h4>
          </div>
          <LogOut size={14} className="text-gray-500 hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
