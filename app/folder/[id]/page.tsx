"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon, Download, Lock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SmartAudioPlayer from "@/components/SmartAudioPlayer";
import { safeConvertToDate, safeGetMillis } from "@/lib/utils";

export default function PublicFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;
  
  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const { user, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

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
          // Sort in-memory: newest first using safeGetMillis
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

      const q = query(collection(db, "materials"), where("folderId", "==", folderId));
      const materialSnap = await getDocs(q);
      const materialsData = materialSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      materialsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMaterials(materialsData);
      if (materialsData.length > 0) {
        setActiveMaterial(materialsData[0]);
      }
    };
    fetchFolderAndMaterials();
  }, [folderId, user, isAdmin]);

  if (!folder) return <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">Loading folder...</div>;

  if (hasAccess === null) return <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full text-gray-400">Verifying access...</div>;

  if (!hasAccess) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[50vh]">
        <Lock className="text-primary mb-4" size={48} />
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-6">You don't have permission to view the materials in this folder.</p>
        <Link href={`/course/${folder.courseId}`}>
          <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Return to Course
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 h-auto md:h-[calc(100dvh-80px)]">
      <div className="md:hidden">
        <Link href={`/course/${folder.courseId}`} className="text-primary hover:underline flex items-center gap-2 mb-4 w-fit">
          <ArrowLeft size={16} /> Back to Course
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{folder.title}</h1>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-6 md:gap-8 flex-1 min-h-0">
        {/* Sidebar: List of Materials */}
        <div className="w-full md:w-1/3 md:border-r border-border md:pr-8 md:overflow-y-auto shrink-0 flex flex-col">
          <div className="hidden md:block">
            <Link href={`/course/${folder.courseId}`} className="text-primary hover:underline flex items-center gap-2 mb-6 w-fit">
              <ArrowLeft size={16} /> Back to Course
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-6">{folder.title}</h1>
          </div>
        
        <div className="flex flex-col gap-3">
          {materials.map((mat) => (
            <div 
              key={mat.id} 
              onClick={() => setActiveMaterial(mat)}
              className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center gap-3
                ${activeMaterial?.id === mat.id ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-gray-500'}
              `}
            >
              <div className="text-primary">
                {mat.type === "audio" && <FileAudio size={20} />}
                {mat.type === "pdf" && <FileText size={20} />}
                {mat.type === "image" && <ImageIcon size={20} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-foreground truncate">{mat.title}</h3>
                <p className="text-xs text-gray-400 capitalize">{mat.type}</p>
              </div>
            </div>
          ))}
          {materials.length === 0 && <p className="text-gray-500">No materials available.</p>}
        </div>
      </div>

        {/* Main Content: Player / Viewer */}
        <div className="w-full md:w-2/3 flex flex-col h-auto md:h-full overflow-hidden flex-1 mb-8 md:mb-0">
        {activeMaterial ? (
          <div className="flex flex-col h-full bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground truncate pr-4">{activeMaterial.title}</h2>
              <a href={activeMaterial.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:bg-primary/10 p-2 rounded flex gap-2 items-center text-sm shrink-0">
                <Download size={16} /> <span className="hidden sm:inline">Download</span>
              </a>
            </div>

            {/* Audio Player */}
            {activeMaterial.type === "audio" && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="mb-6">
                  {user && (
                    <SmartAudioPlayer 
                      url={activeMaterial.url} 
                      userId={user.uid} 
                      materialId={activeMaterial.id} 
                      courseId={folder.courseId}
                    />
                  )}
                  {!user && (
                    <audio 
                      controls 
                      src={activeMaterial.url} 
                      className="w-full outline-none" 
                    />
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4 sticky top-0 bg-card py-2 z-10">Transcript</h3>
                  {activeMaterial.transcript ? (
                    <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                      {activeMaterial.transcript}
                    </div>
                  ) : (
                    <p className="text-yellow-500 bg-yellow-500/10 p-4 rounded-lg">
                      Transcription is either processing or unavailable for this audio file.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            {activeMaterial.type === "pdf" && (
              <div className="flex-1 bg-background rounded-lg flex items-center justify-center border border-border overflow-hidden">
                <object data={activeMaterial.url} type="application/pdf" className="w-full h-full rounded-lg">
                  <p className="p-4 text-center">PDF preview not available on this browser. <a href={activeMaterial.url} className="text-primary hover:underline">Download it here</a>.</p>
                </object>
              </div>
            )}

            {/* Image Viewer */}
            {activeMaterial.type === "image" && (
              <div className="flex-1 bg-background rounded-lg flex items-center justify-center border border-border overflow-hidden">
                <img src={activeMaterial.url} alt={activeMaterial.title} className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 py-12 md:py-0 bg-card rounded-xl border border-border">
            Select a material from the left to view it here.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
