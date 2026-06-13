"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ChevronLeft, Folder, Lock, CheckCircle2, XCircle, ChevronRight, BarChart2, Headphones, FileText, Zap, Award, Globe, RotateCw, Volume2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);

  useEffect(() => {
    const fetchCourseAndFolders = async () => {
      // Fetch Course
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      let courseData = null;
      if (courseSnap.exists()) {
        courseData = { id: courseSnap.id, ...courseSnap.data() };
        setCourse(courseData);
      }

      if (user && courseData) {
        // Check Access Status
        const reqQuery = query(
          collection(db, "course_requests"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId),
          limit(1)
        );
        const reqSnap = await getDocs(reqQuery);
        if (!reqSnap.empty) {
          setAccessStatus(reqSnap.docs[0].data().status);
        }
      }
      setIsLoadingAccess(false);

      // Fetch Folders (we'll do this regardless but hide in UI if not approved)
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFolders(foldersData);
    };
    fetchCourseAndFolders();
  }, [courseId, user]);

  const handleRequestAccess = async () => {
    if (!user || !course) return;
    setRequestingAccess(true);
    try {
      await addDoc(collection(db, "course_requests"), {
        userId: user.uid,
        courseId: course.id,
        userEmail: user.email,
        courseTitle: course.title,
        status: "pending",
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setAccessStatus("pending");
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Failed to request access. Please try again.");
    } finally {
      setRequestingAccess(false);
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-white/60 text-sm">
        Loading course...
      </div>
    );
  }

  // Derived metadata fallbacks for legacy courses
  const derivedCategory = course.category || (() => {
    const lower = course.title.toLowerCase();
    if (lower.includes("ccna") || lower.includes("cisco") || lower.includes("network")) return "Networking";
    if (lower.includes("security") || lower.includes("comptia") || lower.includes("cyber")) return "Security";
    if (lower.includes("aws") || lower.includes("cloud") || lower.includes("azure")) return "Cloud Computing";
    return "IT & Tech";
  })();

  const derivedInstructor = course.instructor || (() => {
    const lower = course.title.toLowerCase();
    if (lower.includes("ccna") || lower.includes("cisco")) return "Cisco Networking Expert";
    if (lower.includes("security") || lower.includes("comptia")) return "CompTIA Security Advisory";
    if (lower.includes("aws")) return "Certified Cloud Architect";
    return "HivePod Faculty Team";
  })();

  const derivedDifficulty = course.difficulty || "Beginner";
  const derivedRating = course.rating || 4.8;
  const derivedReviewsCount = course.reviewsCount || 45;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* iOS-style Back Chevron Button */}
      <Link href="/my-courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/4 border border-white/8 px-3.5 py-2 rounded-full cursor-pointer w-fit">
        <ChevronLeft size={14} /> Back to Courses
      </Link>

      {/* Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/1.5 bg-linear-to-b from-white/4 to-transparent backdrop-blur-[32px] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        {/* Liquid sheen light reflection */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/1 to-white/4 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] uppercase">
              Course
            </span>
            <span className="text-[10px] text-white/50 bg-white/4 border border-white/8 px-2.5 py-0.5 rounded-full font-medium">
              {derivedCategory}
            </span>
            <span className="text-[10px] text-white/50 bg-white/4 border border-white/8 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <BarChart2 size={10} /> {derivedDifficulty}
            </span>
            {course.audioTracks > 0 && (
              <span className="text-[10px] bg-[#5e5ce6]/10 text-[#7d7aff] border border-[#5e5ce6]/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Headphones size={10} /> {course.audioTracks} Pods
              </span>
            )}
            {course.resourcesCount > 0 && (
              <span className="text-[10px] bg-[#64d2ff]/10 text-[#64d2ff] border border-[#64d2ff]/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <FileText size={10} /> {course.resourcesCount} PDFs
              </span>
            )}
            {course.xpReward > 0 && (
              <span className="text-[10px] bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Zap size={10} /> +{course.xpReward} XP
              </span>
            )}
            {course.hasCertificate && (
              <span className="text-[10px] bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Award size={10} /> Cert. Included
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/50">
              <div>by <span className="text-white/70 font-semibold">{derivedInstructor}</span></div>
              <div className="w-px h-3 bg-white/15" />
              <div className="flex items-center gap-1 text-[#ffb300] font-semibold">
                <span>★</span>
                <span>{derivedRating.toFixed(1)}</span>
                <span className="text-white/40 font-normal">({derivedReviewsCount} reviews)</span>
              </div>

              {course.audioDuration && (
                <>
                  <div className="w-px h-3 bg-white/15" />
                  <span className="text-white/70 font-medium">{course.audioDuration}</span>
                </>
              )}

              {course.language && (
                <>
                  <div className="w-px h-3 bg-white/15" />
                  <span className="text-white/70 font-medium">{course.language}</span>
                </>
              )}

              {course.updatedAtText && (
                <>
                  <div className="w-px h-3 bg-white/15" />
                  <span className="text-white/35 font-normal">{course.updatedAtText}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-white/70 max-w-3xl leading-relaxed">{course.description}</p>
        </div>
      </div>

      {isLoadingAccess ? (
        <div className="flex items-center justify-center py-10 text-white/40 text-sm">
          Loading access status...
        </div>
      ) : (
        <>
          {accessStatus === "approved" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1 h-4 bg-[#ff453a] rounded-full" />
                Course Folders
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <Link href={`/folder/${folder.id}`} key={folder.id}>
                    <div className="bg-white/2 border border-white/8 backdrop-blur-md rounded-xl p-4 flex items-center justify-between hover:border-white/20 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-[#ff453a]/10 rounded-lg text-[#ff453a] border border-[#ff453a]/20">
                          <Folder size={18} />
                        </div>
                        <h3 className="font-semibold text-sm text-white line-clamp-1 min-w-0">{folder.title}</h3>
                      </div>
                      <ChevronRight size={14} className="text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                  </Link>
                ))}

                {folders.length === 0 && (
                  <div className="col-span-full py-10 text-center border border-dashed border-white/10 rounded-xl bg-white/1">
                    <p className="text-white/45 text-sm">This course doesn't have any folders yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* iOS Style macOS Security Lock Panel */
            <div className="bg-white/1.5 border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {!user ? (
                <>
                  <div className="p-4 bg-white/3 border border-white/8 rounded-full text-white/50 mb-4 shadow-inner">
                    <Lock size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Login Required</h3>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">You must be logged in to request access and view files in this course.</p>
                  <Link href="/" className="w-full">
                    <button className="w-full bg-[#ff453a] hover:bg-[#ff453a]/90 text-white font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-[0_4px_12px_rgba(255,69,58,0.2)]">
                      Go to Login
                    </button>
                  </Link>
                </>
              ) : accessStatus === "pending" ? (
                <>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 mb-4 shadow-inner">
                    <CheckCircle2 size={32} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Access Requested</h3>
                  <p className="text-xs text-white/60 leading-relaxed">Your access request is currently pending administrator approval. We will notify you once verified.</p>
                </>
              ) : accessStatus === "rejected" ? (
                <>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4 shadow-inner">
                    <XCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Access Denied</h3>
                  <p className="text-xs text-white/60 leading-relaxed">Your request to access this course has been declined by an administrator. Please reach out to support for help.</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-full text-[#ff453a] mb-4 shadow-inner animate-bounce">
                    <Lock size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Private Course</h3>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">This course's modules and chapters are restricted. Click below to submit an access request.</p>
                  <button
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    className="w-full bg-[#ff453a] hover:bg-[#ff453a]/90 text-white font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(255,69,58,0.2)]"
                  >
                    {requestingAccess ? "Submitting Request..." : "Request Access"}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
