"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";
import Link from "next/link";
import { ChevronLeft, Folder, Lock, CheckCircle2, XCircle, ChevronRight, BarChart2, Headphones, FileText, Zap, Award, Globe, RotateCw, Volume2, FolderOpen } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { safeConvertToDate, safeGetMillis } from "@/lib/utils";
import { sendAdminNotificationEmail, sendUserConfirmationEmail } from "@/app/actions/email";
import { motion } from "framer-motion";

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const { user, isAdmin } = useAuth();
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
      }

      if (user && courseData) {
        if (isAdmin) {
          setAccessStatus("approved");
        } else {
          // Check Access Status
          const reqQuery = query(
            collection(db, "course_requests"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId)
          );
          const reqSnap = await getDocs(reqQuery);
          if (!reqSnap.empty) {
            const reqs = reqSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
            // Sort in-memory: newest first using safeGetMillis
            reqs.sort((a, b) => safeGetMillis(b.requestedAt, Date.now()) - safeGetMillis(a.requestedAt, Date.now()));

            const latestReq = reqs[0];
            const expiresAt = safeConvertToDate(latestReq.restrictions?.expiresAt);
            if (latestReq.status === "approved" && expiresAt && expiresAt.getTime() < Date.now()) {
              setAccessStatus(null);
            } else {
              setAccessStatus(latestReq.status);
            }
          }
        }
      }
      setIsLoadingAccess(false);

      // Fetch Folders (we'll do this regardless but hide in UI if not approved)
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      // Sort alphabetically by title
      foldersData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      setFolders(foldersData);

      // Fetch Materials for these folders to calculate dynamic counts
      if (courseData && foldersData.length > 0) {
        const folderIds = foldersData.map(f => f.id);
        const materialsQ = query(collection(db, "materials"), where("folderId", "in", folderIds));
        const materialsSnap = await getDocs(materialsQ);
        
        let audio = 0;
        let pdf = 0;
        let total = 0;
        
        materialsSnap.docs.forEach(m => {
          total += 1;
          const type = m.data().type;
          if (type === 'audio') audio += 1;
          else if (type === 'pdf') pdf += 1;
        });

        const minutes = total * 15;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        const audioDuration = minutes === 0 ? "0 hrs" : 
          (minutes < 60 ? `${minutes} mins` : 
            (remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hrs`));

        setCourse({
          ...courseData,
          audioTracks: audio,
          resourcesCount: pdf,
          audioDuration: audioDuration
        });
      } else if (courseData) {
        setCourse({ ...courseData, audioTracks: 0, resourcesCount: 0, audioDuration: "0 hrs" });
      }
    };
    fetchCourseAndFolders();
  }, [courseId, user, isAdmin]);

  const handleRequestAccess = async () => {
    if (!user || !course) return;
    setRequestingAccess(true);
    try {
      const docRef = await addDoc(collection(db, "course_requests"), {
        userId: user.uid,
        courseId: course.id,
        userEmail: user.email,
        courseTitle: course.title,
        status: "pending",
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setAccessStatus("pending");

      // Send the email to the admin using the server action
      await sendAdminNotificationEmail(user.email || "Unknown User", course.title, docRef.id);

      // Send a confirmation email to the user
      if (user.email) {
        await sendUserConfirmationEmail(user.email, course.title);
      }

      // Notify the user that their request was sent successfully
      await createNotification(
        user.uid,
        "ACTIVITY_COMPLETED",
        "Request Sent",
        `Your request to access "${course.title}" has been sent for review.`,
        { courseId: course.id, url: `/course/${course.id}` }
      );
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
    <div className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto w-full space-y-5">
      {/* iOS-style Back Chevron Button */}
      <Link href="/my-courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/4 border border-white/8 px-3 py-1.5 rounded-full cursor-pointer w-fit">
        <ChevronLeft size={13} /> Back to Courses
      </Link>

      {/* Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-white/1.5 bg-linear-to-b from-white/4 to-transparent backdrop-blur-[32px] p-5 md:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        {/* Liquid sheen light reflection */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/1 to-white/4 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide bg-[#ff453a]/10 border border-[#ff453a]/20 text-[#ff453a] uppercase">
              Course
            </span>
            <span className="text-[9px] text-white/50 bg-white/4 border border-white/8 px-2 py-0.5 rounded-full font-semibold">
              {derivedCategory}
            </span>
            <span className="text-[9px] text-white/50 bg-white/4 border border-white/8 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <BarChart2 size={9} /> {derivedDifficulty}
            </span>
            {course.audioTracks > 0 && (
              <span className="text-[9px] bg-[#5e5ce6]/10 text-[#7d7aff] border border-[#5e5ce6]/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Headphones size={9} /> {course.audioTracks} Pods
              </span>
            )}
            {course.resourcesCount > 0 && (
              <span className="text-[9px] bg-[#64d2ff]/10 text-[#64d2ff] border border-[#64d2ff]/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <FileText size={9} /> {course.resourcesCount} PDFs
              </span>
            )}
            {course.xpReward > 0 && (
              <span className="text-[9px] bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Zap size={9} /> +{course.xpReward} XP
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/45">
              <div>by <span className="text-white/60 font-semibold">{derivedInstructor}</span></div>
              <div className="w-px h-2.5 bg-white/10 shrink-0" />
              <div className="flex items-center gap-0.5 text-[#ffb300] font-semibold">
                <span>★</span>
                <span>{derivedRating.toFixed(1)}</span>
                <span className="text-white/35 font-normal">({derivedReviewsCount})</span>
              </div>

              {course.audioDuration && (
                <>
                  <div className="w-px h-2.5 bg-white/10 shrink-0" />
                  <span className="text-white/65 font-medium">{course.audioDuration}</span>
                </>
              )}

              {course.language && (
                <>
                  <div className="w-px h-2.5 bg-white/10 shrink-0" />
                  <span className="text-white/65 font-medium">{course.language}</span>
                </>
              )}

              {course.updatedAtText && (
                <>
                  <div className="w-px h-2.5 bg-white/10 shrink-0" />
                  <span className="text-white/30 font-normal">{course.updatedAtText}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-white/60 max-w-3xl leading-relaxed font-normal">{course.description}</p>
        </div>
      </div>

      {isLoadingAccess ? (
        <div className="flex items-center justify-center py-10 text-white/40 text-sm">
          Loading access status...
        </div>
      ) : (
        <>
          {accessStatus === "approved" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1 h-3.5 bg-[#ff453a] rounded-full" />
                Course Folders
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
                {folders.map((folder) => {
                  const playClickSound = () => {
                    try {
                      // Haptic feedback (15ms light tap for supported devices)
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate(15);
                      }
                      
                      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                      if (!AudioContextClass) return;
                      // Use a shared context to avoid hitting browser limits
                      if (!(window as any).uiAudioContext) {
                        (window as any).uiAudioContext = new AudioContextClass();
                      }
                      const ctx = (window as any).uiAudioContext;
                      if (ctx.state === 'suspended') ctx.resume();
                      
                      const osc = ctx.createOscillator();
                      const gainNode = ctx.createGain();
                      osc.connect(gainNode);
                      gainNode.connect(ctx.destination);
                      
                      // Crisp mechanical tick sound
                      osc.type = 'triangle';
                      osc.frequency.setValueAtTime(1000, ctx.currentTime);
                      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.02);
                      
                      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
                      
                      osc.start(ctx.currentTime);
                      osc.stop(ctx.currentTime + 0.02);
                    } catch (e) {}
                  };

                  return (
                  <Link href={`/folder/${folder.id}`} key={folder.id} className="block w-full">
                    <motion.div 
                      onPointerDown={playClickSound}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.94, opacity: 0.7 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex flex-col items-center p-2 rounded-[20px] cursor-pointer text-center select-none w-full"
                    >
                      {/* Clean Flat iOS/macOS Folder Icon using folderr.png */}
                      <div className="relative w-20 h-20 mb-2 shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300">
                        <img 
                          src="/folderr.png" 
                          alt="Folder Icon" 
                          className="w-full h-full object-contain" 
                        />
                      </div>

                      {/* Folder Title */}
                      <span className="text-[11px] font-medium text-white/90 tracking-normal leading-snug line-clamp-2 px-1.5 w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {folder.title}
                      </span>
                    </motion.div>
                  </Link>
                  );
                })}

                {folders.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center text-center max-w-sm mx-auto opacity-80 hover:opacity-100 transition-opacity">
                    <FolderOpen size={48} className="text-white/10 mb-4" strokeWidth={1} />
                    <h3 className="text-[18px] font-semibold text-white/80 mb-2 tracking-tight">No Folders Yet</h3>
                    <p className="text-[14px] text-white/40 leading-relaxed">
                      This course doesn't have any folders or study materials. Check back later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Premium iOS Glassmorphic Security Status Card */
            /* Aurora Fluid Mesh Lock Screen */
            <div className="relative w-full max-w-sm mx-auto rounded-3xl border border-white/6 bg-white/2 backdrop-blur-3xl p-6 md:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.5)] text-center flex flex-col items-center overflow-hidden">
              <style>{`
                @keyframes float-blob-1 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  33% { transform: translate(25px, -30px) scale(1.15); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float-blob-2 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  50% { transform: translate(-30px, 25px) scale(1.2); }
                }
                @keyframes float-blob-3 {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  50% { transform: translate(20px, 20px) scale(0.85); }
                }
                .animate-blob-1 { animation: float-blob-1 12s ease-in-out infinite; }
                .animate-blob-2 { animation: float-blob-2 15s ease-in-out infinite; }
                .animate-blob-3 { animation: float-blob-3 10s ease-in-out infinite; }
              `}</style>

              {!user ? (
                <>
                  {/* Floating Fluid Mesh Blobs */}
                  <div className="absolute top-0 left-0 w-28 h-28 bg-[#0a84ff]/10 blur-2xl rounded-full animate-blob-1 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#5e5ce6]/10 blur-2xl rounded-full animate-blob-2 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#bf5af2]/5 blur-2xl rounded-full animate-blob-3 pointer-events-none" />

                  {/* Frosted Glass Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/12 shadow-inner backdrop-blur-xl flex items-center justify-center text-white/90 mb-5 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    <Lock size={18} />
                  </div>

                  <h3 className="text-sm font-extrabold text-white mb-1.5 tracking-tight">Login Required</h3>
                  <p className="text-xs text-white/55 mb-5 max-w-[260px] leading-relaxed relative z-10">You must be logged in to request access and view files in this course.</p>

                  <Link href="/" className="w-full relative z-10">
                    <button className="w-full bg-white/8 hover:bg-white/15 border border-white/12 text-white font-bold py-2 rounded-xl text-xs active:scale-[0.98] transition-all duration-200 tracking-wider shadow-lg">
                      Go to Login
                    </button>
                  </Link>
                </>
              ) : accessStatus === "pending" ? (
                <>
                  {/* Floating Fluid Mesh Blobs */}
                  <div className="absolute top-0 left-0 w-28 h-28 bg-[#ff9f0a]/15 blur-2xl rounded-full animate-blob-1 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#ffb300]/10 blur-2xl rounded-full animate-blob-2 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#ff453a]/5 blur-2xl rounded-full animate-blob-3 pointer-events-none" />

                  {/* Frosted Glass Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/12 shadow-inner backdrop-blur-xl flex items-center justify-center text-[#ff9f0a] mb-5 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-[#ff9f0a]/5 to-[#ff9f0a]/15 pointer-events-none" />
                    <CheckCircle2 size={18} />
                  </div>

                  <h3 className="text-sm font-extrabold text-white mb-1.5 tracking-tight">Access Requested</h3>
                  <p className="text-xs text-white/55 max-w-[260px] leading-relaxed relative z-10">Your access request is currently pending administrator approval. We will notify you once verified.</p>
                </>
              ) : accessStatus === "rejected" ? (
                <>
                  {/* Floating Fluid Mesh Blobs */}
                  <div className="absolute top-0 left-0 w-28 h-28 bg-[#ff453a]/15 blur-2xl rounded-full animate-blob-1 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#ff2d55]/10 blur-2xl rounded-full animate-blob-2 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#bf5af2]/5 blur-2xl rounded-full animate-blob-3 pointer-events-none" />

                  {/* Frosted Glass Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/12 shadow-inner backdrop-blur-xl flex items-center justify-center text-[#ff453a] mb-5 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-[#ff453a]/5 to-[#ff453a]/15 pointer-events-none" />
                    <XCircle size={18} />
                  </div>

                  <h3 className="text-sm font-extrabold text-white mb-1.5 tracking-tight">Access Denied</h3>
                  <p className="text-xs text-white/55 max-w-[260px] leading-relaxed relative z-10">Your request to access this course has been declined by an administrator. Please reach out to support for help.</p>
                </>
              ) : (
                <>
                  {/* Floating Fluid Mesh Blobs */}
                  <div className="absolute top-0 left-0 w-28 h-28 bg-[#ff453a]/15 blur-2xl rounded-full animate-blob-1 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-[#5e5ce6]/10 blur-2xl rounded-full animate-blob-2 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#ff2d55]/5 blur-2xl rounded-full animate-blob-3 pointer-events-none" />

                  {/* Frosted Glass Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/12 shadow-inner backdrop-blur-xl flex items-center justify-center text-[#ff453a] mb-5 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-[#ff453a]/5 to-[#ff453a]/15 pointer-events-none" />
                    <Lock size={16} />
                  </div>

                  <h3 className="text-sm font-extrabold text-white mb-1.5 tracking-tight">Private Course</h3>
                  <p className="text-xs text-white/55 mb-5 max-w-[260px] leading-relaxed relative z-10">This course's modules and chapters are restricted. Click below to submit an access request.</p>

                  <button
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    className="w-full bg-[#ff453a]/20 hover:bg-[#ff453a]/30 border border-[#ff453a]/30 text-white font-bold py-2 rounded-xl text-xs active:scale-[0.98] transition-all duration-200 tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                  >
                    {requestingAccess ? "Sending Request..." : "Request Access"}
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
