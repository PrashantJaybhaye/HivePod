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
    { name: "My Courses", href: "#", icon: BookOpen },
    { name: "Favorites", href: "#", icon: Heart },
    { name: "Wallet", href: "#", icon: Wallet },
    { name: "Redeem", href: "#", icon: Gift },
    { name: "Certificates", href: "#", icon: Award },
  ];

  return (
    <aside className={`w-64 bg-background border-r border-border h-screen flex flex-col fixed left-0 top-0 z-20 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>
      <div className="p-6 flex items-center gap-3">
        {/* Logo */}
        <span className="text-primary font-bold tracking-wider text-xl flex items-center gap-2">
          HivePod
        </span>
        <button className="ml-auto text-gray-500 hover:text-white hidden md:block">
          <LayoutDashboard size={18} />
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

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${
                  isActive
                    ? "bg-[#ef4444] text-white"
                    : "text-gray-400 hover:bg-card hover:text-white"
                }
              `}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-border flex items-center gap-3 hover:bg-card cursor-pointer transition-colors mt-auto">
          <div className="w-8 h-8 rounded-full bg-[#ef4444] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.email?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">Prashant Jaybhaye</h4>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <ChevronsUpDown size={16} className="text-gray-500" />
        </div>
      )}
    </aside>
  );
}
