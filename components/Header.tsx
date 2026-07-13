"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Search, Menu, LogOut, Loader2, X, CheckCircle2, Book, Folder as FolderIcon, Award, CornerDownLeft, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

export type SearchResultItem = {
  id: string;
  type: string;
  title: string;
  url?: string;
  branch?: string;
  email?: string;
  photoURL?: string;
};

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Real data extraction with Firestore
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebouncedFn = setTimeout(async () => {
      try {
        // Client-side filtering for case-insensitivity (Firebase doesn't do native full-text)
        // Using allSettled so if 'folders' or any collection doesn't exist/fails, it won't break the whole search
        const [usersRes, coursesRes, foldersRes, lessonsRes] = await Promise.allSettled([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "folders")),
          getDocs(collection(db, "lessons"))
        ]);

        const queryLower = searchQuery.toLowerCase();
        const results: SearchResultItem[] = [];
        
        if (usersRes.status === "fulfilled") {
          usersRes.value.forEach(doc => {
            const data = doc.data();
            const name = data.name || data.displayName || "Unknown User";
            const email = data.email || "";
            if (name.toLowerCase().includes(queryLower) || email.toLowerCase().includes(queryLower)) {
              results.push({ 
                id: doc.id, 
                type: "user", 
                title: name, 
                email,
                photoURL: data.photoURL || data.avatar || ""
              });
            }
          });
        } else {
          console.error("Users search failed (check security rules or indexes):", usersRes.reason);
        }
        
        if (coursesRes.status === "fulfilled") {
          coursesRes.value.forEach(doc => {
            const data = doc.data();
            const title = data.title || data.name || "Untitled Course";
            const subtitle = data.description || data.subtitle || data.category || null;
            if (title.toLowerCase().includes(queryLower)) {
              results.push({ id: doc.id, type: "course", title: title, url: `/course/${doc.id}`, branch: subtitle });
            }
          });
        } else {
          console.error("Courses search failed:", coursesRes.reason);
        }
        
        if (foldersRes.status === "fulfilled") {
          foldersRes.value.forEach(doc => {
            const data = doc.data();
            const name = data.name || data.title || "Untitled Assessment";
            const courseName = data.courseName || data.courseTitle || data.parentCourse || data.branch || null;
            if (name.toLowerCase().includes(queryLower)) {
              results.push({ id: doc.id, type: "assessment", title: name, url: `/folder/${doc.id}`, branch: courseName });
            }
          });
        } else {
          console.error("Folders search failed (check collection name and security rules):", foldersRes.reason);
        }

        if (lessonsRes.status === "fulfilled") {
          lessonsRes.value.forEach(doc => {
            const data = doc.data();
            const title = data.title || data.name || "Untitled Lesson";
            let subtitle = "";
            if (data.courseName && data.sectionName) subtitle = `${data.courseName} • ${data.sectionName}`;
            else if (data.courseName) subtitle = data.courseName;
            else subtitle = data.sectionName || data.description || "Lesson";

            if (title.toLowerCase().includes(queryLower)) {
              results.push({ id: doc.id, type: "lesson", title: title, url: `/lesson/${doc.id}`, branch: subtitle });
            }
          });
        } else {
          console.error("Lessons search failed:", lessonsRes.reason);
        }

        // Limit results to top 8
        setSearchResults(results.slice(0, 8));
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebouncedFn);
  }, [searchQuery]);

  // Clear search query after modal closes
  useEffect(() => {
    if (!isSearchOpen) {
      const t = setTimeout(() => setSearchQuery(""), 200);
      return () => clearTimeout(t);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        setIsNotifOpen(false);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  // Derive display info from Firebase user
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const displayInitial = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();
  const photoURL = user?.photoURL;

  let title = "Dashboard";
  if (pathname.includes("/course")) title = "Course View";
  if (pathname.includes("/admin")) title = "Admin Portal";

  return (
    <header className="h-14 shrink-0 border-b border-white/4 bg-[#060606]/60 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Mobile Logo & Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/logo.png" alt="HivePod Logo" className="w-5.5 h-5.5 object-contain" />
          <span className="font-black text-sm tracking-tight text-white bg-linear-to-r from-white to-white/80 bg-clip-text">HivePod</span>
        </div>

        <h1 className="text-xs font-bold tracking-wider text-white/50 capitalize hidden md:block">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div ref={headerRef} className="flex items-center gap-3.5 text-white/50 relative">

        {/* Search */}
        <div className="relative flex items-center">
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setIsNotifOpen(false);
            }}
            className="transition-colors relative cursor-pointer p-1.5 rounded-lg hover:bg-white/5 hover:text-white"
          >
            <Search size={15} />
          </button>

          {typeof document !== "undefined" && createPortal(
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-[90vw] sm:w-[640px] bg-[#0c0c0c] border border-white/10 rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Input Header */}
                    <div className="flex items-center px-4 py-3.5 border-b border-white/5">
                      <Search size={18} className="text-white/40 mr-3 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search courses, labs, assessments, lessons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
                        autoFocus
                      />
                      <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-white/40 font-mono ml-3 uppercase tracking-wider">
                        ESC
                      </div>
                    </div>

                    {/* Body */}
                    {searchQuery.length >= 2 ? (
                      <div className="flex flex-col p-2 max-h-[300px] overflow-y-auto bg-[#0c0c0c]">
                        {isSearching ? (
                          <div className="py-10 flex flex-col items-center justify-center text-white/40">
                            <Loader2 size={24} className="animate-spin mb-3" />
                            <span className="text-[13px]">Searching library...</span>
                          </div>
                        ) : searchResults.length > 0 ? (
                          Object.entries(
                            searchResults.reduce((acc, result) => {
                              // Group by pluralized type name
                              const groupName = result.type.toUpperCase() + "S";
                              if (!acc[groupName]) acc[groupName] = [];
                              acc[groupName].push(result);
                              return acc;
                            }, {} as Record<string, SearchResultItem[]>)
                          ).map(([groupName, items]) => (
                            <div key={groupName} className="mb-2 last:mb-0">
                              <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                {groupName}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                {items.map((result) => {
                                  if (result.type === "user") {
                                    return (
                                      <div key={result.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">
                                        {result.photoURL ? (
                                          <img src={result.photoURL} alt={result.title} referrerPolicy="no-referrer" className="w-8 h-8 rounded-md object-cover border border-white/10" />
                                        ) : (
                                          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/5 shrink-0">
                                            <span className="text-[12px] text-white/60 font-medium">{result.title.charAt(0).toUpperCase()}</span>
                                          </div>
                                        )}
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-[13px] text-white/90 font-medium truncate">{result.title}</span>
                                          <span className="text-[11px] text-white/40 truncate">{result.email || "No email provided"}</span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  const Icon = result.type === "course" ? Book : result.type === "lesson" ? FileText : result.type === "assessment" || result.type === "folder" ? Award : Award;
                                  const iconColor = result.type === "course" ? "text-blue-400" : result.type === "lesson" ? "text-red-400" : result.type === "assessment" || result.type === "folder" ? "text-emerald-400" : "text-emerald-400";

                                  return (
                                    <div 
                                      key={result.id} 
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        if (result.url) router.push(result.url);
                                      }}
                                      className="flex items-center gap-3.5 px-4 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                                    >
                                      <div className="w-10 h-10 rounded-[14px] border border-white/5 bg-white/3 flex items-center justify-center shrink-0">
                                        <Icon size={16} className={iconColor} />
                                      </div>
                                      <div className="flex flex-col overflow-hidden">
                                        <span className="text-[14px] text-white/90 font-medium truncate tracking-tight">{result.title}</span>
                                        {result.branch && (
                                          <span className="text-[12px] text-white/40 truncate mt-0.5">
                                            {result.branch}
                                          </span>
                                        )}
                                      </div>
                                      <CornerDownLeft size={16} className="text-white/20 ml-auto hidden group-hover:block shrink-0" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center flex flex-col items-center">
                            <Search size={24} className="text-white/20 mb-3" />
                            <p className="text-[13px] text-white/40">No results found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-6 text-center bg-[#0c0c0c]">
                        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-2 shadow-inner">
                          <Search size={14} className="text-white/40" />
                        </div>
                        <h3 className="text-[13px] font-bold text-white mb-0.5 tracking-wide">Search across your library</h3>
                        <p className="text-[11px] text-white/40 leading-snug max-w-[300px] mt-0.5">
                          Find courses, batches, labs, assessments, and lessons.<br />
                          Type at least 2 characters.
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 bg-[#060606]">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↑</span>
                          <span className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↓</span>
                          <span>navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center px-2 h-5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↵</span>
                          <span>select</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">⌘</span>
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">K</span>
                        <span>to toggle</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsSearchOpen(false);
            }}
            className={`transition-colors relative cursor-pointer p-1.5 rounded-lg hover:bg-white/5 ${isNotifOpen ? 'text-white bg-white/10' : 'hover:text-white'}`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </button>

          {typeof document !== "undefined" && createPortal(
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsNotifOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15, delay: 0.05 }}
                    className="relative w-[90vw] sm:w-[420px] bg-[#121212] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[13px] font-bold text-white tracking-wide">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[11px] text-white/40 hover:text-white transition-colors">Mark all read</button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => {
                          const isUnread = !notif.isRead;
                          const dateObj = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date();
                          const diff = Math.floor((new Date().getTime() - dateObj.getTime()) / 60000);
                          const timeAgo = diff < 1 ? "Just now" : diff < 60 ? `${diff}m ago` : diff < 1440 ? `${Math.floor(diff/60)}h ago` : `${Math.floor(diff/1440)}d ago`;

                          let NotifIcon = Bell;
                          let iconColor = "text-white/60";
                          let bgColor = "bg-white/10";
                          
                          if (notif.type === "ACTIVITY_COMPLETED") {
                            NotifIcon = CheckCircle2;
                            iconColor = "text-emerald-400";
                            bgColor = "bg-emerald-400/10";
                          } else if (notif.type === "COURSE_INVITE") {
                            NotifIcon = Book;
                            iconColor = "text-blue-400";
                            bgColor = "bg-blue-400/10";
                          } else if (notif.type === "ACHIEVEMENT") {
                            NotifIcon = Award;
                            iconColor = "text-orange-400";
                            bgColor = "bg-orange-400/10";
                          }

                          return (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                if (isUnread) markAsRead(notif.id);
                                // Optional: if metadata has a URL, router.push it
                                if (notif.metadata?.url) {
                                  setIsNotifOpen(false);
                                  router.push(notif.metadata.url);
                                }
                              }}
                              className={`px-5 py-4 border-b border-white/5 transition-colors cursor-pointer flex gap-3 hover:bg-white/4 ${isUnread ? "bg-white/2" : ""}`}
                            >
                              <div className="mt-0.5 shrink-0 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor}`}>
                                  <NotifIcon size={14} className={iconColor} />
                                </div>
                                {isUnread && (
                                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#121212]" />
                                )}
                              </div>
                              <div className="flex flex-col gap-1 w-full">
                                <span className={`text-[13px] ${isUnread ? "font-bold text-white" : "font-medium text-white/80"}`}>{notif.title}</span>
                                <span className={`text-[12px] ${isUnread ? "text-white/70" : "text-white/50"} leading-snug`}>{notif.message}</span>
                                <span className="text-[10px] text-white/30 mt-1">{timeAgo}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="min-h-[160px] flex flex-col items-center justify-center p-6 pb-4 gap-4">
                          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 bg-transparent">
                            <Bell size={20} className="stroke-[1.5]" />
                          </div>
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <span className="text-[14px] font-bold text-white">No new notifications</span>
                            <span className="text-xs text-white/40 font-medium">You're all caught up.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-white/5 text-center">
                      <button className="text-[12px] text-white/50 hover:text-white transition-colors">View all notifications</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {/* Separator */}
        <div className="border-l border-white/6 h-4 mx-0.5 hidden sm:block"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/25 flex items-center justify-center text-[10px] font-black shrink-0">
              {displayInitial}
            </div>
          )}
          <span className="text-xs font-bold text-white/80 truncate hidden sm:inline max-w-[100px]">
            {displayName}
          </span>
        </div>

        {/* Separator */}
        <div className="border-l border-white/6 h-4 mx-0.5 hidden sm:block"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-[11px] font-bold text-white/70 hover:text-white border border-white/8 hover:bg-white/4 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          {isLoggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
        </button>
      </div>
    </header>
  );
}
