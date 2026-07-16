"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Settings, User, Search } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  type NavItem = {
    name: string;
    icon: any;
    href?: string;
    isMiddle?: boolean;
    hasNotification?: boolean;
  };

  const leftNavItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Courses", href: "/my-courses", icon: BookOpen }
  ];

  const middleItem: NavItem = { name: "Search", icon: Search, isMiddle: true };

  const rightNavItems: NavItem[] = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings, hasNotification: unreadCount > 0 },
  ];

  const navItems: NavItem[] = [...leftNavItems, middleItem, ...rightNavItems];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] h-[88px] bg-[#121212]/95 backdrop-blur-3xl border border-white/5 rounded-[44px] z-50 px-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] flex items-center">
      <nav className="w-full flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isMiddle) {
            return (
              <button
                key={item.name}
                onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
                className="relative flex flex-col items-center justify-center shrink-0 px-2 group"
              >
                {/* 3D Bubble Glowing Button completely contained within the nav */}
                <div className="w-[64px] h-[64px] rounded-full bg-linear-to-b from-primary-hover to-[#7f1d1d] flex items-center justify-center relative z-10 transition-transform duration-300 group-active:scale-95 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4),0_0_24px_rgba(220,38,38,0.5)] border border-[#ef4444]/20">
                  <item.icon size={28} className="text-white drop-shadow-md" strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href!}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2 group"
            >
              <div className={`flex flex-col items-center justify-center w-full transition-colors duration-200 group-active:scale-95`}>
                <div className="relative mb-1">
                  <item.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${isActive ? "text-[#b91c1c]" : "text-white/30 group-hover:text-white/60"}`}
                  />
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#b91c1c] border-2 border-[#121212]" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${isActive ? "text-[#b91c1c]" : "text-white/30 group-hover:text-white/60"}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
