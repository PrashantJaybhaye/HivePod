"use client";

import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="flex-1 h-full min-h-[calc(100vh-80px)] w-full bg-background flex flex-col items-center justify-center font-sans px-6 selection:bg-[#06c] selection:text-white -mt-6">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">

        {/* Apple never shows "404", they just tell you it's gone */}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          The page you're looking for can't be found.
        </h1>

        {/* Simple mock search bar */}
        <div className="w-full max-w-sm relative mt-6 mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search HivePod"
            className="w-full h-10 pl-11 pr-4 rounded-xl border border-[#d2d2d7] dark:border-[#424245] bg-white dark:bg-[#1d1d1f] focus:outline-none focus:border-[#06c] dark:focus:border-[#2997ff] transition-colors text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#86868b]"
          />
        </div>

        {/* Apple-style blue links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#06c] dark:text-[#2997ff] hover:underline flex items-center text-sm">
            HivePod Home <ChevronRight className="ml-0.5 size-3" />
          </Link>
          <div className="w-px h-3 bg-[#d2d2d7] dark:bg-[#424245]" />
          <Link href="/courses" className="text-[#06c] dark:text-[#2997ff] hover:underline flex items-center text-sm">
            Explore Courses <ChevronRight className="ml-0.5 size-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
