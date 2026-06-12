"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, Wallet, Gift, Award, LayoutDashboard, X, ChevronsUpDown } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "My Courses", href: "/my-courses", icon: BookOpen },
  ];

  return (
    <aside className={`w-[240px] bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-20 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>
      <div className="p-4 pt-6 pb-4 flex items-center gap-3">
        {/* Logo */}
        <span className="text-white font-semibold tracking-tight text-lg flex items-center gap-2">
          HivePod
        </span>
        <button className="ml-auto text-gray-500 hover:text-white hidden md:block">
          <LayoutDashboard size={20} strokeWidth={1.5} />
        </button>
        {setIsOpen && (
          <button 
            className="ml-auto text-gray-500 hover:text-white md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }
              `}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-white/5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors mt-auto">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
            {user.email?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-medium text-white truncate leading-tight">Prashant Jaybhaye</h4>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
          </div>
          <ChevronsUpDown size={16} className="text-gray-500 shrink-0" />
        </div>
      )}
    </aside>
  );
}
