"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";
import { CheckCircle, XCircle, Clock, Loader2, Search, Calendar, ShieldAlert, Award, Zap, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { safeConvertToDate, safeGetMillis } from "@/lib/utils";

type RequestStatus = "pending" | "approved" | "rejected";

interface CourseRequest {
  id: string;
  userId: string;
  courseId: string;
  userEmail: string;
  courseTitle: string;
  status: RequestStatus;
  requestedAt: any;
  updatedAt: any;
  restrictions?: {
    expiresAt?: any;
    blockXp?: boolean;
  };
}

const profileCache: Record<string, any> = {};

function UserCell({ userId, fallbackEmail, courseTitle }: { userId: string; fallbackEmail: string; courseTitle?: string }) {
  const [profile, setProfile] = useState<any>(profileCache[userId] || null);
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    if (profile) return;

    let active = true;
    const fetchProfile = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists() && active) {
          const data = userSnap.data();
          profileCache[userId] = data;
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching user profile:", userId, err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [userId, profile]);

  const displayName = profile?.displayName || "No Name Provided";
  const photoURL = profile?.photoURL;
  const authProvider = profile?.provider || "unknown";
  const email = fallbackEmail || profile?.email || "No Email";
  const isPublic = email ? ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com", "yandex.com", "proton.me", "protonmail.com"].includes(email.split("@")[1]?.toLowerCase()) : false;
  const userInitial = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-2.5 w-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {photoURL ? (
        <img
          src={photoURL}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10 shrink-0"
        />
      ) : (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-white/5 to-white/15 border border-white/10 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white/70 shrink-0 select-none uppercase">
          {userInitial}
        </div>
      )}
      <div className="min-w-0 flex flex-col gap-0.5">
        <span className="text-xs font-bold text-white leading-normal truncate">{displayName}</span>
        <span className="text-[11px] text-white/40 leading-normal truncate">{email}</span>

        {courseTitle && (
          <span className="text-[10px] text-white/50 font-medium md:hidden mt-0.5 truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[250px]">
            Course: {courseTitle}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {isPublic && (
            <span className="bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/15 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <ShieldAlert size={10} /> Public
            </span>
          )}
          <span className="bg-white/5 text-white/50 border border-white/5 text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalizeshrink-0">
            {authProvider === "google.com" ? "Google" : authProvider === "password" ? "Password" : authProvider}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus>("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Restriction Modal States
  const [selectedRequest, setSelectedRequest] = useState<CourseRequest | null>(null);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [expiryOption, setExpiryOption] = useState<"none" | "24h" | "7d" | "30d" | "custom">("none");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [blockXp, setBlockXp] = useState(false);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchRequests = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const q = query(collection(db, "course_requests"));
      const snapshot = await getDocs(q);
      const reqsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseRequest[];

      // Sort newest first
      reqsData.sort((a, b) => safeGetMillis(b.requestedAt, 0) - safeGetMillis(a.requestedAt, 0));

      setRequests(reqsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const handleUpdateStatus = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await updateDoc(doc(db, "course_requests", requestId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      // Optimistic update
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
      
      const req = requests.find(r => r.id === requestId);
      if (req) {
        await createNotification(
          req.userId,
          newStatus === "approved" ? "COURSE_INVITE" : "SYSTEM_ALERT",
          newStatus === "approved" ? "Access Approved!" : "Access Request Update",
          `Your request to access "${req.courseTitle}" was ${newStatus}.`,
          { courseId: req.courseId, url: `/course/${req.courseId}` }
        );
      }
    } catch (error) {
      console.error(`Error updating request status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus} request.`);
    }
  };

  const handleApproveWithRestrictions = async () => {
    if (!selectedRequest) return;

    if (expiryOption === "custom" && !customExpiryDate) {
      alert("Please select a custom expiration date.");
      return;
    }

    let expiresAt: Date | null = null;
    const now = new Date();
    if (expiryOption === "24h") {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (expiryOption === "7d") {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (expiryOption === "30d") {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (expiryOption === "custom" && customExpiryDate) {
      expiresAt = new Date(customExpiryDate);
    }

    try {
      const restrictions = {
        expiresAt: expiresAt ? expiresAt : null,
        blockXp
      };

      await updateDoc(doc(db, "course_requests", selectedRequest.id), {
        status: "approved",
        restrictions,
        updatedAt: serverTimestamp()
      });

      // Optimistic update
      setRequests(prev => prev.map(req =>
        req.id === selectedRequest.id ? { ...req, status: "approved", restrictions } : req
      ));

      await createNotification(
        selectedRequest.userId,
        "COURSE_INVITE",
        "Access Approved!",
        `You have been granted access to "${selectedRequest.courseTitle}".`,
        { courseId: selectedRequest.courseId, url: `/course/${selectedRequest.courseId}` }
      );

      setShowRestrictionModal(false);
      setSelectedRequest(null);
      setExpiryOption("none");
      setCustomExpiryDate("");
      setBlockXp(false);
    } catch (error) {
      console.error("Error approving request with restrictions:", error);
      alert("Failed to approve request.");
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesTab = req.status === activeTab;
    const matchesSearch =
      (req.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.courseTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 pt-0 pb-8 w-full">
        {/* iOS Compact Single-Row Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/4">
          {/* Left: Title + Pending Badge */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Access Requests
            </h2>
            {!loading && requests.filter(r => r.status === "pending").length > 0 && (
              <span className="bg-[#ff453a]/15 text-[#ff453a] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider animate-pulse">
                {requests.filter(r => r.status === "pending").length} PENDING
              </span>
            )}
          </div>

          {/* Right: Search & Segmented Control */}
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={13} />
                <input
                  type="text"
                  placeholder="Search email or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 hover:border-white/15 focus:border-white/20 focus:bg-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/35 transition-all outline-none"
                />
              </div>

              {/* Segmented Control Tabs */}
              <div className="flex bg-white/2 border border-white/6 rounded-xl p-0.5 w-full sm:w-auto justify-between overflow-x-auto">
                {(["pending", "approved", "rejected"] as const).map((tab) => {
                  const count = requests.filter(r => r.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize flex-1 sm:flex-initial text-center cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === tab
                        ? "bg-white/8 text-white shadow-xs"
                        : "text-white/45 hover:text-white/70"
                        }`}
                    >
                      <span>{tab}</span>
                      {count > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === tab
                          ? tab === "pending" ? "bg-[#ff453a]/20 text-[#ff453a]" : "bg-white/10 text-white/70"
                          : "bg-white/5 text-white/30"
                          }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Empty State */}
        {filteredRequests.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="text-white/20 mb-3">
              {activeTab === "pending" && <Clock size={32} strokeWidth={1} />}
              {activeTab === "approved" && <CheckCircle size={32} strokeWidth={1} />}
              {activeTab === "rejected" && <XCircle size={32} strokeWidth={1} />}
            </div>
            <h3 className="text-sm font-medium text-white/60 mb-1 uppercase">
              No {activeTab} requests
            </h3>
            <p className="text-xs text-white/30 max-w-[260px]">
              {searchTerm
                ? `No results for "${searchTerm}".`
                : `You don't have any ${activeTab} requests.`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-xs font-medium text-white/50 hover:text-white transition-colors underline underline-offset-2 cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="border border-white/8 bg-white/1.5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Top subtle sheen line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] font-bold capitalizetracking-wider text-white/50 font-mono">User Details</th>
                    <th className="hidden md:table-cell px-5 py-2.5 text-[10px] font-bold capitalizetracking-wider text-white/50 font-mono">Target Course</th>
                    <th className="hidden sm:table-cell px-5 py-2.5 text-[10px] font-bold capitalizetracking-wider text-white/50 font-mono">Requested Date</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] font-bold capitalizetracking-wider text-white/50 font-mono">Status & Restrictions</th>
                    <th className="px-3 sm:px-5 py-2.5 text-[10px] font-bold capitalizetracking-wider text-white/50 font-mono text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {filteredRequests.map((req) => {
                    return (
                      <tr key={req.id} className="hover:bg-white/2 transition-colors duration-150 group">
                        {/* User Column */}
                        <td className="px-3 sm:px-5 py-2 align-middle">
                          <UserCell userId={req.userId} fallbackEmail={req.userEmail} courseTitle={req.courseTitle} />
                        </td>

                        {/* Course Title (Large Screens) */}
                        <td className="hidden md:table-cell px-5 py-2 align-middle">
                          <span className="text-xs font-semibold text-white/80 line-clamp-2">{req.courseTitle}</span>
                        </td>

                        {/* Requested Date */}
                        <td className="hidden sm:table-cell px-5 py-2 align-middle font-mono text-xs text-white/40">
                          {safeConvertToDate(req.requestedAt)
                            ? safeConvertToDate(req.requestedAt)!.toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                            : "Unknown"}
                        </td>

                        {/* Restrictions Status */}
                        <td className="px-3 sm:px-5 py-2 align-middle">
                          {req.status === "approved" ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/15 uppercase">
                                <CheckCircle size={10} className="stroke-[2.5]" />
                                Approved
                              </span>

                              {/* Expiry detail */}
                              {safeConvertToDate(req.restrictions?.expiresAt) ? (
                                <span className={`text-[10px] font-mono flex items-center gap-1 ${safeConvertToDate(req.restrictions?.expiresAt)!.getTime() < Date.now()
                                  ? "text-[#ff453a]"
                                  : "text-white/40"
                                  }`}>
                                  <Clock size={10} />
                                  {safeConvertToDate(req.restrictions?.expiresAt)!.getTime() < Date.now() ? "Expired" : "Expires: " + safeConvertToDate(req.restrictions?.expiresAt)!.toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                                  <Clock size={10} /> Lifetime
                                </span>
                              )}

                              {/* Restrictions detail */}
                              {req.restrictions?.blockXp && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  <span className="bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/15 text-[8px] font-extrabold px-1 rounded capitalizetracking-wider">
                                    No XP
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : req.status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/15 uppercase">
                              <XCircle size={10} className="stroke-[2.5]" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-white/40 border border-white/5 uppercase">
                              <Clock size={10} />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 sm:px-5 py-2 align-middle text-right">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              <button
                                onClick={() => handleUpdateStatus(req.id, "rejected")}
                                className="px-2.5 py-1.5 bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/15 rounded-xl transition-all text-xs font-bold cursor-pointer"
                                title="Reject request"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setExpiryOption("none");
                                  setBlockXp(false);
                                  setCustomExpiryDate("");
                                  setShowRestrictionModal(true);
                                }}
                                className="px-2.5 py-1.5 bg-[#30d158]/10 hover:bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/15 rounded-xl transition-all text-xs font-bold cursor-pointer shadow-[0_2px_8px_rgba(48,209,88,0.1)]"
                                title="Configure access parameters & approve"
                              >
                                Approve
                              </button>
                            </div>
                          ) : req.status === "approved" ? (
                            <button
                              onClick={() => handleUpdateStatus(req.id, "rejected")}
                              className="px-2.5 py-1.5 bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/15 rounded-xl transition-all text-xs font-bold cursor-pointer"
                              title="Reject approved request"
                            >
                              Reject
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setExpiryOption("none");
                                setBlockXp(false);
                                setCustomExpiryDate("");
                                setShowRestrictionModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#30d158]/10 hover:bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/15 rounded-xl transition-all text-xs font-bold cursor-pointer shadow-[0_2px_8px_rgba(48,209,88,0.1)]"
                              title="Approve rejected request"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* iOS-Style Modal Overlay */}
      {showRestrictionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Modal Container */}
          <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Configure Restrictions
              </h3>
              <button
                onClick={() => {
                  setShowRestrictionModal(false);
                  setSelectedRequest(null);
                }}
                className="text-white/40 hover:text-white/80 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* User Context */}
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                {profileCache[selectedRequest.userId]?.photoURL ? (
                  <img
                    src={profileCache[selectedRequest.userId].photoURL}
                    alt={profileCache[selectedRequest.userId].displayName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-white/5 to-white/15 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70 shrink-0 select-none uppercase">
                    {(profileCache[selectedRequest.userId]?.displayName?.[0] || selectedRequest.userEmail?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {profileCache[selectedRequest.userId]?.displayName || "No Name Provided"}
                  </div>
                  <div className="text-[11px] text-white/50 truncate">
                    {selectedRequest.userEmail}
                  </div>
                  <div className="text-[10px] text-white/40 font-semibold mt-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded w-fit">
                    Course: {selectedRequest.courseTitle}
                  </div>
                </div>
              </div>

              {/* Expiry Option Group */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold capitalizetracking-wider text-white/40 font-mono">Access Expiration</label>
                <div className="grid grid-cols-5 bg-white/2 border border-white/6 rounded-xl p-0.5 gap-0.5">
                  {(["none", "24h", "7d", "30d", "custom"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setExpiryOption(opt)}
                      className={`px-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 capitalizetext-center cursor-pointer ${expiryOption === opt
                        ? "bg-white/8 text-white"
                        : "text-white/40 hover:text-white/70"
                        }`}
                    >
                      {opt === "none" ? "Lifetime" : opt}
                    </button>
                  ))}
                </div>

                {/* Custom Date Input */}
                {expiryOption === "custom" && (
                  <div className="mt-2.5 animate-in slide-in-from-top-1.5 fade-in duration-200">
                    <input
                      type="date"
                      value={customExpiryDate}
                      onChange={(e) => setCustomExpiryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white/3 border border-white/8 hover:border-white/15 focus:border-white/20 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
                    />
                    <p className="text-[10px] text-white/30 mt-1">Select a custom date in the future for access expiration.</p>
                  </div>
                )}
              </div>

              {/* Toggles Group */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold capitalizetracking-wider text-white/40 font-mono">Permission Exclusions</label>

                <div className="space-y-3">
                  {/* Block XP */}
                  <label className="flex items-start justify-between gap-4 p-3 bg-white/2 border border-white/5 rounded-xl cursor-pointer hover:bg-white/3 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Zap size={12} className="text-white/50" /> Block XP Accumulation
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5 leading-normal">
                        Activities completed by the user in this course will not yield any experience points (XP).
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={blockXp}
                      onChange={(e) => setBlockXp(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#ff453a] focus:ring-0 focus:ring-offset-0 shrink-0 cursor-pointer accent-[#ff453a]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/1 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRestrictionModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 hover:bg-white/5 text-white/60 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveWithRestrictions}
                className="px-4 py-2 bg-[#30d158]/90 hover:bg-[#30d158] text-white border border-[#30d158]/15 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[0_2px_10px_rgba(48,209,88,0.2)]"
              >
                Approve Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
