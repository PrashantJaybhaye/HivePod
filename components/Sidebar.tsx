"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Award, Settings, Shield, Inbox } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Courses", href: "/my-courses", icon: BookOpen },
    ...(isAdmin ? [
      { name: "Admin Panel", href: "/admin", icon: Shield },
      { name: "Requests", href: "/admin/requests", icon: Inbox }
    ] : []),
    { name: "Certificates", href: "/certificates", icon: Award },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={`w-[260px] shrink-0 bg-[#060606]/80 border-r border-white/[0.04] backdrop-blur-2xl h-screen flex flex-col fixed left-0 top-0 z-20 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 relative">
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-white font-black tracking-tight text-lg bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:to-white transition-all duration-300">
            HivePod
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="block w-full">
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold tracking-wide cursor-pointer relative
                    ${isActive
                      ? "bg-white/[0.06] text-white border border-white/[0.06] shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/[0.02]"
                    }
                  `}
                >
                  {/* Left indicator line for active item */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-1.5 w-[3px] h-3.5 rounded-full bg-[#ff453a]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon
                    size={15}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200
                      ${isActive ? "text-[#ff453a]" : "text-white/40 group-hover:text-white/60"}
                    `}
                  />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
