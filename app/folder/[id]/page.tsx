"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { transcribeAudio } from "@/app/actions/transcribe";
import Link from "next/link";
import { ChevronLeft, FileAudio, FileText, Image as ImageIcon, Download, Lock, Video, Folder as FolderIcon, AlignLeft, PlayCircle, CheckCircle2, XCircle, ChevronRight, BarChart2, Headphones, Zap, Award, Globe, RotateCw, Volume2, Loader2, Copy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SmartAudioPlayer from "@/components/SmartAudioPlayer";
import { safeConvertToDate, safeGetMillis } from "@/lib/utils";
import { markMaterialCompleted } from "@/lib/tracking";

export default function PublicFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;

  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const { user, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (activeMaterial?.transcript) {
      navigator.clipboard.writeText(activeMaterial.transcript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    const fetchFolderAndMaterials = async () => {
      const folderSnap = await getDoc(doc(db, "folders", folderId));
      let folderData: any = null;
      if (folderSnap.exists()) {
        folderData = { id: folderSnap.id, ...folderSnap.data() };
        setFolder(folderData);
      }

      if (!folderData) return;

      let approved = false;
      if (isAdmin) {
        approved = true;
      } else if (user) {
        const reqQuery = query(
          collection(db, "course_requests"),
          where("userId", "==", user.uid),
          where("courseId", "==", folderData.courseId)
        );
        const reqSnap = await getDocs(reqQuery);
        if (!reqSnap.empty) {
          const reqs = reqSnap.docs.map(d => d.data());
          reqs.sort((a, b) => safeGetMillis(b.requestedAt, Date.now()) - safeGetMillis(a.requestedAt, Date.now()));

          const latestReq = reqs[0];
          const expiresAt = safeConvertToDate(latestReq.restrictions?.expiresAt);
          if (latestReq.status === "approved") {
            if (expiresAt && expiresAt.getTime() < Date.now()) {
              approved = false;
            } else {
              approved = true;
            }
          }
        }
      }

      setHasAccess(approved);

      if (!approved) return;

      try {
        const q = query(collection(db, "materials"), where("folderId", "==", folderId));
        const materialSnap = await getDocs(q);
        const materialsData = materialSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        // Sort by order first (ascending), then creation date
        materialsData.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999999;
          const orderB = typeof b.order === 'number' ? b.order : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        });

        setMaterials(materialsData);

        // Fetch User Progress for this course
        if (user && folderData.courseId) {
          const progressQuery = query(
            collection(db, "users", user.uid, "progress"),
            where("courseId", "==", folderData.courseId)
          );
          const pSnap = await getDocs(progressQuery);
          const completed = new Set<string>();
          pSnap.docs.forEach(d => {
            if (d.data().completed) {
              completed.add(d.id);
            }
          });
          setCompletedItems(completed);
        }
      } catch (error) {
        console.error("Error fetching materials or progress:", error);
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchFolderAndMaterials();
  }, [folderId, user, isAdmin]);

  useEffect(() => {
    // Auto-select first item on desktop
    if (materials.length > 0 && !activeMaterial && window.innerWidth >= 768) {
      setActiveMaterial(materials[0]);
    }
  }, [materials]);

  const handleMarkAsComplete = async () => {
    if (!user || !activeMaterial || !folder?.courseId) return;
    setIsMarkingComplete(true);
    try {
      await markMaterialCompleted(user.uid, activeMaterial.id, folder.courseId);
      setCompletedItems(prev => new Set(prev).add(activeMaterial.id));
    } catch (error) {
      console.error("Error marking complete:", error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleRetranscribe = async () => {
    if (!activeMaterial || !isAdmin) return;
    setIsTranscribing(true);
    try {
      const newTranscript = await transcribeAudio(activeMaterial.url);
      const materialRef = doc(db, "materials", activeMaterial.id);
      await updateDoc(materialRef, { transcript: newTranscript });
      setActiveMaterial({ ...activeMaterial, transcript: newTranscript });
      setMaterials(materials.map(m => m.id === activeMaterial.id ? { ...m, transcript: newTranscript } : m));
    } catch (error) {
      console.error("Retranscription failed:", error);
      alert("Failed to re-transcribe. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };


  if (!folder) return <div className="p-8 text-white/50 text-center w-full mt-20 font-medium">Loading workspace...</div>;

  if (hasAccess === null) return <div className="p-8 text-white/50 text-center w-full mt-20 font-medium">Verifying access...</div>;

  if (!hasAccess) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[70vh]">
        <div className="relative w-full max-w-md bg-[#1c1c1e] rounded-[32px] border border-white/10 p-10 text-center flex flex-col items-center shadow-2xl">
          <div className="w-16 h-16 rounded-[24px] bg-[#ff453a]/10 flex items-center justify-center text-[#ff453a] mb-6">
            <Lock size={28} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Access Denied</h3>
          <p className="text-[16px] text-white/60 mb-8 leading-relaxed">You don't have permission to view the materials in this folder.</p>
          <Link href={`/course/${folder.courseId}`} className="w-full">
            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-[16px] text-[16px] transition-colors">
              Return to Course
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background h-full min-h-[calc(100vh-100px)]">
      <main className="flex-1 px-4 sm:px-5 md:px-6 pt-0 pb-6 max-w-7xl mx-auto w-full flex flex-col space-y-4 h-full overflow-hidden">
        
        <div className="flex items-center justify-between shrink-0">
          <Link href={`/course/${folder.courseId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/4 border border-white/8 px-3 py-1.5 rounded-full cursor-pointer w-fit">
            <ChevronLeft size={13} /> Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <FolderIcon size={14} className="text-white/40" />
            <h1 className="text-sm font-bold text-white tracking-tight">{folder.title}</h1>
          </div>
        </div>

        {isLoadingMaterials ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
            <Loader2 size={24} className="text-white/20 animate-spin" />
          </div>
        ) : materials.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
            <div className="flex flex-col items-center text-center max-w-sm opacity-80 hover:opacity-100 transition-opacity -mt-24">
              <FolderIcon size={48} className="text-white/10 mb-4" strokeWidth={1} />
              <h2 className="text-[18px] font-semibold text-white/80 mb-2 tracking-tight">Folder is Empty</h2>
              <p className="text-[14px] text-white/40 mb-8 leading-relaxed">No materials are available in this folder yet.</p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[32px] border border-white/6 bg-white/1.5 bg-linear-to-b from-white/4 to-transparent backdrop-blur-[32px] shadow-[0_24px_50px_0_rgba(0,0,0,0.5)] flex-1 flex flex-col md:flex-row min-h-0">
          {/* Liquid sheen light reflection */}
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/1 to-white/4 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

          {/* Left Sidebar: File List */}
          <aside className={`relative z-10 w-full md:w-[280px] lg:w-[320px] shrink-0 border-r border-white/6 flex flex-col h-full bg-white/2 transition-all duration-300 ${activeMaterial ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/6 shrink-0 flex items-center justify-between">
               <h2 className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Materials</h2>
               <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded-full">{materials.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              <div className="space-y-1">
                {materials.map((mat) => {
                  let Icon = PlayCircle;
                  let iconColor = "text-white/40";
                  let activeIconColor = "text-white";
                  
                  if (mat.type === "audio") { Icon = FileAudio; activeIconColor = "text-[#ff453a]"; }
                  else if (mat.type === "video") { Icon = Video; activeIconColor = "text-[#ff453a]"; }
                  else if (mat.type === "pdf") { Icon = FileText; activeIconColor = "text-[#0a84ff]"; }
                  else if (mat.type === "image") { Icon = ImageIcon; activeIconColor = "text-[#30d158]"; }

                  const isActive = activeMaterial?.id === mat.id;
                  const isCompleted = completedItems.has(mat.id);

                  return (
                    <button
                      key={mat.id}
                      onClick={() => setActiveMaterial(mat)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-left group border border-transparent
                        ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                      `}
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 relative">
                        {mat.type === "audio" ? (
                          <img 
                            src="/audio.png" 
                            alt="audio" 
                            className={`w-6 h-6 object-cover rounded-sm transition-all duration-200 ${isActive ? 'opacity-100 scale-110 shadow-sm' : 'opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`} 
                          />
                        ) : (
                          <Icon size={18} className={isActive ? activeIconColor : iconColor} strokeWidth={isActive ? 2.5 : 1.5} />
                        )}
                        {isCompleted && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-[#1c1c1e] rounded-full p-[2px]">
                            <CheckCircle2 size={10} className="text-[#30d158] bg-[#1c1c1e] rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-[13px] font-semibold truncate leading-tight transition-colors
                          ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                        `}>
                          {mat.title}
                        </p>
                        <p className={`text-[11px] font-medium mt-0.5 tracking-wide transition-colors ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                          {mat.type.charAt(0).toUpperCase() + mat.type.slice(1)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Pane: Content Preview & Details */}
          <section className={`relative z-10 flex-1 flex flex-col bg-black/40 h-full overflow-hidden ${!activeMaterial ? 'hidden md:flex' : 'flex'}`}>
            {activeMaterial ? (
              <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                
                {/* Mobile Navigation Bar within Right Pane */}
                <div className="md:hidden flex items-center justify-between px-3 py-2 sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/10">
                  <button 
                    onClick={() => setActiveMaterial(null)}
                    className="flex items-center gap-1 text-white/80 active:text-white active:scale-95 transition-all -ml-1 p-1.5"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                    <span className="text-[14px] font-medium tracking-tight">List</span>
                  </button>
                  <span className="text-[11px] font-semibold text-white/40 truncate max-w-[140px]">
                    {activeMaterial.title}
                  </span>
                </div>

                {/* Preview Area (Top) */}
                <div className={`w-full shrink-0 bg-black/60 border-b border-white/6 relative flex flex-col items-center justify-center ${activeMaterial.type === 'audio' ? 'py-8 sm:py-12' : 'min-h-[300px]'}`}>
                  
                  {activeMaterial.type === "audio" && (
                    <div className="absolute inset-0 bg-linear-to-b from-[#ff453a]/10 to-transparent pointer-events-none" />
                  )}

                  {activeMaterial.type === "audio" && (
                    <div className="w-full flex flex-col items-center justify-center px-6 relative z-10">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 pointer-events-none" />
                        <img src="/audio.png" alt="Audio" className="w-full h-full object-cover relative z-10" />
                      </div>
                      <div className="w-full max-w-md z-10 relative">
                        {user ? (
                          <SmartAudioPlayer
                            url={activeMaterial.url}
                            userId={user.uid}
                            materialId={activeMaterial.id}
                            courseId={folder.courseId}
                          />
                        ) : (
                          <audio 
                            controls 
                            controlsList={isAdmin ? undefined : "nodownload"} 
                            onContextMenu={(e) => !isAdmin && e.preventDefault()}
                            src={activeMaterial.url} 
                            className="w-full outline-none" 
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {activeMaterial.type === "video" && (
                    <div className="w-full h-[50vh] min-h-[360px] bg-black/80 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-linear-to-b from-[#ff453a]/5 to-transparent pointer-events-none" />
                      <video 
                        controls 
                        controlsList={isAdmin ? undefined : "nodownload"}
                        onContextMenu={(e) => !isAdmin && e.preventDefault()}
                        src={activeMaterial.url} 
                        className="w-full h-full object-contain relative z-10"
                      />
                    </div>
                  )}

                  {activeMaterial.type === "pdf" && (
                    <div className="w-full h-[50vh] min-h-[400px] bg-black/40 flex flex-col items-center justify-center relative px-6 text-center">
                      <div className="absolute inset-0 bg-linear-to-b from-[#0a84ff]/10 to-transparent pointer-events-none" />
                      
                      <div className="w-24 h-24 rounded-3xl bg-[#0a84ff]/10 border border-[#0a84ff]/20 shadow-[0_0_40px_-10px_rgba(10,132,255,0.3)] flex items-center justify-center mb-6 relative z-10 backdrop-blur-md">
                        <FileText size={40} className="text-[#0a84ff]" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 relative z-10">{activeMaterial.title}</h3>
                      <p className="text-[13px] text-white/50 mb-8 max-w-sm leading-relaxed relative z-10">
                        PDF documents are opened in a new secure tab for the best reading experience.
                      </p>
                      
                      <a 
                        href={activeMaterial.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="relative z-10 bg-[#0a84ff] hover:bg-[#0a84ff]/90 text-white font-bold px-8 py-3.5 rounded-full shadow-[0_4px_20px_-5px_rgba(10,132,255,0.5)] transition-all active:scale-95 flex items-center gap-2"
                      >
                        Read Document <ChevronRight size={16} />
                      </a>
                    </div>
                  )}

                  {activeMaterial.type === "image" && (
                    <div className="w-full h-[60vh] min-h-[400px] flex items-center justify-center p-8 bg-black/40 relative">
                       <div className="absolute inset-0 bg-linear-to-b from-[#30d158]/5 to-transparent pointer-events-none" />
                      <img src={activeMaterial.url} alt={activeMaterial.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10 relative z-10" />
                    </div>
                  )}
                </div>

                {/* Transcript & Details Area (Bottom) */}
                <div className="flex-1 w-full p-6 sm:p-10 pb-32">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{activeMaterial.title}</h1>
                      
                      {activeMaterial.type !== "audio" && (
                        <button
                          onClick={handleMarkAsComplete}
                          disabled={isMarkingComplete || completedItems.has(activeMaterial.id)}
                          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all
                            ${completedItems.has(activeMaterial.id) 
                              ? 'bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 cursor-default' 
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 shadow-lg'
                            }`}
                        >
                          <CheckCircle2 size={14} />
                          {completedItems.has(activeMaterial.id) ? 'Completed' : (isMarkingComplete ? 'Marking...' : 'Mark as Complete')}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-[11px] font-bold tracking-widest uppercase text-white/40 mb-10 flex items-center gap-2">
                      <span>{activeMaterial.type}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>{activeMaterial.createdAt ? new Date(activeMaterial.createdAt.toMillis?.() || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently Added'}</span>
                    </p>

                    {(activeMaterial.type === "audio" || activeMaterial.type === "video") && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-white/6">
                          <div className="flex items-center gap-2 text-white/50">
                            <AlignLeft size={16} />
                            <h3 className="text-[11px] font-bold tracking-widest uppercase">Transcript</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {activeMaterial.transcript && (
                              <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white transition-all"
                              >
                                {isCopied ? <CheckCircle2 size={12} className="text-[#30d158]" /> : <Copy size={12} />}
                                {isCopied ? 'Copied' : 'Copy'}
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={handleRetranscribe}
                                disabled={isTranscribing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50"
                              >
                                {isTranscribing ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Transcribing...
                                  </>
                                ) : (
                                  <>
                                    <RotateCw size={12} />
                                    Re-transcribe
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {activeMaterial.transcript ? (
                          <div className="prose prose-invert prose-zinc max-w-none text-[14px] sm:text-[15px] leading-[1.8] text-white/70 font-sans tracking-wide whitespace-pre-wrap">
                            {activeMaterial.transcript}
                          </div>
                        ) : (
                          <div className="py-16 flex flex-col items-center text-center">
                            <AlignLeft size={32} className="text-white/10 mb-4" strokeWidth={1} />
                            <p className="text-[13px] text-white/40 font-medium">No transcript available for this {activeMaterial.type}.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <p className="text-[17px] font-semibold text-white/30 tracking-tight">No Material Selected</p>
              </div>
            )}
          </section>
        </div>
        )}
      </main>
    </div>
  );
}
