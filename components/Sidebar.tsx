"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Award, Settings, Shield, Inbox } from "lucide-react";
import { useAuth } from "./AuthProvider";

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
    <aside className={`w-[260px] shrink-0 bg-[#171717] border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-20 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
    `}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0">
        <Link
          href="/"
          className="text-primary-hover text-[21px] font-semibold tracking-wide italic font-serif"
          style={{ fontFamily: "Georgia, serif" }}
        >
          HivePod
        </Link>
      </div>

      {/* Navigation (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-[13px] font-medium
                  ${isActive
                    ? "bg-[#232323] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#232323]/50"
                  }
                `}
              >
                <item.icon
                  size={15}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
