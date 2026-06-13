"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, XCircle, Clock, Loader2, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

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
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  
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
      // Note: A composite index might be needed if we orderBy("requestedAt", "desc"), 
      // but without it, we can just fetch and sort in memory for now.
      const q = query(collection(db, "course_requests"));
      const snapshot = await getDocs(q);
      const reqsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseRequest[];
      
      // Sort newest first
      reqsData.sort((a, b) => (b.requestedAt?.toMillis() || 0) - (a.requestedAt?.toMillis() || 0));
      
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
    } catch (error) {
      console.error(`Error updating request status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus} request.`);
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
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-4 pb-8 lg:pt-6 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Premium Header */}
        <div className="relative mb-8 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>
          
          <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">Course Access Requests</h1>
                <p className="text-gray-400 text-sm">Manage user access requests for private courses.</p>
              </div>
            </div>

            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search email or course..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary w-full md:w-72 transition-colors placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-white/10 mb-6">
          {(["pending", "approved", "rejected"] as RequestStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-all relative rounded-t-lg ${
                activeTab === tab 
                  ? "text-primary bg-white/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
              {/* Show badge for pending */}
              {tab === "pending" && requests.filter(r => r.status === "pending").length > 0 && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? "bg-primary/20 text-primary" : "bg-white/10 text-gray-300"}`}>
                  {requests.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table Area */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No {activeTab} requests found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Requested Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {req.userEmail}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {req.courseTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs font-mono">
                        {req.requestedAt?.toDate().toLocaleDateString() || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, "approved")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 border border-green-500/20 rounded-lg transition-all text-xs font-bold tracking-wide"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, "rejected")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-xs font-bold tracking-wide"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize tracking-wide
                            ${req.status === "approved" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}
                          `}>
                            {req.status === "approved" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
