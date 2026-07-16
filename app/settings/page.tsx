"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { 
  Inbox, LogOut, ChevronRight, User, LayoutDashboard, 
  Bell, Palette, Lock, Shield, Moon, Monitor, Mail, Smartphone
} from "lucide-react";

// Simple Toggle Component
const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-white' : 'bg-white/10'}`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-2 bg-black' : '-translate-x-2 bg-white/50'}`} />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Mock states for settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "course_requests"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingRequestsCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 py-4 lg:py-6 max-w-[1400px] mx-auto w-full space-y-4 lg:space-y-6">
        
        {/* Page Header */}
        <div className="pb-3 border-b border-white/5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5">Settings</h2>
          <p className="text-white/50 text-[13px]">Manage your account preferences, appearance, and platform access.</p>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">
          
          {/* Column 1 */}
          <div className="space-y-5">
            
            {/* Account Section */}
            <section>
              <div className="flex items-center gap-2 mb-2.5 ml-1">
                <User size={14} className="text-white/40" />
                <h2 className="text-[12px] font-semibold tracking-wide text-white/70 uppercase">Account</h2>
              </div>
              <div className="bg-[#121212]/60 border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
                <div className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={16} className="text-white/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-white tracking-tight truncate">{user?.displayName || "My Profile"}</h3>
                    <p className="text-[12px] text-white/40 truncate">Manage public profile and details</p>
                  </div>
                </div>
                <div className="h-px w-full bg-white/5" />
                <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-default">
                  <div>
                    <h3 className="text-[13px] font-medium text-white/90">Email Address</h3>
                    <p className="text-[12px] text-white/40">{user?.email || "No email linked"}</p>
                  </div>
                  <div className="flex items-center justify-center text-white/50 pr-1">
                    <Lock size={14} />
                  </div>
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section>
              <div className="flex items-center gap-2 mb-2.5 ml-1">
                <Palette size={14} className="text-white/40" />
                <h2 className="text-[12px] font-semibold tracking-wide text-white/70 uppercase">Appearance</h2>
              </div>
              <div className="bg-[#121212]/60 border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
                <div className="p-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                      <Moon size={14} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white/90">Dark Mode</h3>
                      <p className="text-[12px] text-white/40">Use dark theme everywhere</p>
                    </div>
                  </div>
                  <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </div>
                <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                      <Monitor size={14} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white/90">System Theme</h3>
                      <p className="text-[12px] text-white/40">Match device settings</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                </div>
              </div>
            </section>
          </div>

          {/* Column 2 */}
          <div className="space-y-5">
            
            {/* Notifications Section */}
            <section>
              <div className="flex items-center gap-2 mb-2.5 ml-1">
                <Bell size={14} className="text-white/40" />
                <h2 className="text-[12px] font-semibold tracking-wide text-white/70 uppercase">Notifications</h2>
              </div>
              <div className="bg-[#121212]/60 border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
                <div className="p-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                      <Mail size={14} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white/90">Email Notifications</h3>
                      <p className="text-[12px] text-white/40">Updates and alerts via email</p>
                    </div>
                  </div>
                  <Toggle enabled={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                </div>
                <div className="p-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                      <Smartphone size={14} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white/90">Push Notifications</h3>
                      <p className="text-[12px] text-white/40">Real-time alerts on your device</p>
                    </div>
                  </div>
                  <Toggle enabled={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
                </div>
                <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                      <Lock size={14} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white/90">Marketing Emails</h3>
                      <p className="text-[12px] text-white/40">Promotions and news</p>
                    </div>
                  </div>
                  <Toggle enabled={marketingNotif} onChange={() => setMarketingNotif(!marketingNotif)} />
                </div>
              </div>
            </section>

            {/* Admin Tools (Only visible to Admins) */}
            {isAdmin && (
              <section>
                <div className="flex items-center gap-2 mb-2.5 ml-1">
                  <Shield size={14} className="text-[#ff453a]/70" />
                  <h2 className="text-[12px] font-semibold tracking-wide text-[#ff453a]/80 uppercase">Admin Tools</h2>
                </div>
                <div className="bg-[#121212]/60 border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
                  <Link href="/admin" className="p-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ff453a]/5 flex items-center justify-center shrink-0 text-[#ff453a]/70 group-hover:bg-[#ff453a]/10 group-hover:text-[#ff453a] transition-colors border border-[#ff453a]/10">
                        <LayoutDashboard size={14} />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors">Admin Dashboard</h3>
                        <p className="text-[12px] text-white/40 mt-0">Manage courses and analytics</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </Link>
                  <Link href="/admin/requests" className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ff453a]/5 flex items-center justify-center shrink-0 text-[#ff453a]/70 group-hover:bg-[#ff453a]/10 group-hover:text-[#ff453a] transition-colors border border-[#ff453a]/10 relative">
                        <Inbox size={14} />
                        {pendingRequestsCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff453a] rounded-full border-2 border-[#121212] animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors">Course Requests</h3>
                          {pendingRequestsCount > 0 && (
                            <span className="bg-[#ff453a]/20 text-[#ff453a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#ff453a]/30">
                              {pendingRequestsCount} New
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-white/40 mt-0">Review and approve submissions</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </Link>
                </div>
              </section>
            )}

            {/* Danger Zone */}
            <section>
              <div className="mt-3 bg-[#121212]/40 border border-red-500/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/5">
                <button 
                  onClick={handleLogout}
                  className="w-full p-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-500 transition-colors cursor-pointer group h-[42px]"
                >
                  <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[13px] font-medium tracking-wide">Sign Out</span>
                </button>
              </div>
            </section>

          </div>

        </div>
      </main>
    </div>
  );
}
