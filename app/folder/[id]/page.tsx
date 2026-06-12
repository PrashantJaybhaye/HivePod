"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon, Download } from "lucide-react";

export default function PublicFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;
  
  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);

  useEffect(() => {
    const fetchFolderAndMaterials = async () => {
      const folderSnap = await getDoc(doc(db, "folders", folderId));
      if (folderSnap.exists()) {
        setFolder({ id: folderSnap.id, ...folderSnap.data() });
      }

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
  }, [folderId]);

  if (!folder) return <div className="p-8 max-w-6xl mx-auto">Loading folder...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8 h-[calc(100vh-80px)]">
      {/* Sidebar: List of Materials */}
      <div className="w-full md:w-1/3 md:border-r border-border md:pr-8 overflow-y-auto">
        <Link href={`/course/${folder.courseId}`} className="text-primary hover:underline flex items-center gap-2 mb-6 w-fit">
          <ArrowLeft size={16} /> Back to Course
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-6">{folder.title}</h1>
        
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
      <div className="w-full md:w-2/3 flex flex-col h-full overflow-hidden">
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
                <audio 
                  controls 
                  src={activeMaterial.url} 
                  className="w-full mb-6 outline-none" 
                  autoPlay={false}
                />
                
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
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a material from the left to view it here.
          </div>
        )}
      </div>
    </div>
  );
}
