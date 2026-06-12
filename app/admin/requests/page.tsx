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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Course Access Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Manage user access requests for private courses.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search email or course..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary w-full md:w-64"
          />
        </div>
      </div>

      <div className="flex space-x-1 border-b border-border">
        {(["pending", "approved", "rejected"] as RequestStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab 
                ? "text-primary" 
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-md" />
            )}
            {/* Show badge for pending */}
            {tab === "pending" && requests.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {activeTab} requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background/50 border-b border-border text-gray-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Requested</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                      {req.userEmail}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {req.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                      {req.requestedAt?.toDate().toLocaleDateString() || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(req.id, "approved")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-md transition-colors text-xs font-semibold"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, "rejected")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors text-xs font-semibold"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                          ${req.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}
                        `}>
                          {req.status === "approved" ? <CheckCircle size={12} /> : <XCircle size={12} />}
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
    </div>
  );
}
