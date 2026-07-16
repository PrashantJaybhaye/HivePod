"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Settings, User, Search } from "lucide-react";
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#121212]/95 backdrop-blur-3xl border-t border-white/5 z-50 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center">
      <nav className="w-full h-full flex items-center justify-around relative">
        {navItems.map((item) => {
          if (item.isMiddle) {
            return (
              <div key={item.name} className="relative flex flex-col items-center justify-center flex-1 h-full">
                {/* Circle mask for the bump effect */}
                <div className="absolute -top-[28px] w-[76px] h-[76px] rounded-full bg-[#121212] flex items-center justify-center border-t border-white/5">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
                    className="w-[56px] h-[56px] rounded-full bg-linear-to-b from-primary-hover to-[#7f1d1d] flex items-center justify-center transition-transform duration-300 active:scale-95 shadow-[inset_0_2px_6px_rgba(255,255,255,0.4),0_0_24px_rgba(220,38,38,0.5)] border border-[#ef4444]/20"
                  >
                    <item.icon size={26} className="text-white drop-shadow-md" strokeWidth={2.5} />
                  </button>
                </div>
                <span className="text-[11px] font-medium tracking-wide text-white/30 absolute bottom-[10px]">
                  {item.name}
                </span>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href!}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              <div className="flex flex-col items-center justify-center w-full transition-colors duration-200 group-active:scale-95">
                <div className="relative flex flex-col items-center justify-center gap-1.5 pb-1">
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-3 w-5 h-[3px] bg-[#b91c1c] rounded-full shadow-[0_0_8px_rgba(185,28,28,0.8)]"
                    />
                  )}

                  <div className="relative">
                    <item.icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-colors duration-200 ${isActive ? "text-[#b91c1c]" : "text-white/30 group-hover:text-white/60"}`}
                    />
                    {item.hasNotification && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#b91c1c] border-2 border-[#121212]" />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wide transition-colors duration-200 ${isActive ? "text-[#b91c1c]" : "text-white/30 group-hover:text-white/60"}`}>
                    {item.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
