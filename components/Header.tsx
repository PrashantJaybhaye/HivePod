"use client";

import { Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  let title = "Dashboard";
  if (pathname.includes("/course")) title = "Course View";
  if (pathname.includes("/admin")) title = "Admin Portal";

  return (
    <header className="h-11 shrink-0 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-5 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={18} />
          </button>
        )}
        <h1 className="text-xs font-medium text-white hidden md:block">{title}</h1>
      </div>

      {/* Center Links (Optional, maybe hide on small screens) */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 text-xs font-medium">
        <Link href="/" className="text-gray-300 hover:text-white transition-colors">Catalog</Link>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Community</Link>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Support</Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4 text-gray-400">
        <button className="hover:text-white transition-colors">
          <Search size={16} />
        </button>
        <button className="hover:text-white transition-colors relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
