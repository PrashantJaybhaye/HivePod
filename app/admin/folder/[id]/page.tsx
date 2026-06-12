"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon } from "lucide-react";
import UploadMaterial from "@/components/UploadMaterial";

export default function AdminFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;
  
  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  const fetchFolderAndMaterials = async () => {
    const folderSnap = await getDoc(doc(db, "folders", folderId));
    if (folderSnap.exists()) {
      setFolder({ id: folderSnap.id, ...folderSnap.data() });
    }

    const q = query(collection(db, "materials"), where("folderId", "==", folderId));
    const materialSnap = await getDocs(q);
    const materialsData = materialSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    // Sort by creation date
    materialsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    setMaterials(materialsData);
  };

  useEffect(() => {
    fetchFolderAndMaterials();
    // We can poll or use onSnapshot for realtime, but let's just fetch once 
    // and provide a refresh button if needed.
    const interval = setInterval(fetchFolderAndMaterials, 5000);
    return () => clearInterval(interval);
  }, [folderId]);

  if (!folder) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <Link href={`/admin/course/${folder.courseId}`} className="text-primary hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Course
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold text-foreground">{folder.title}</h1>
      </div>

      <UploadMaterial courseId={folder.courseId} folderId={folderId} />

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Materials in this Folder</h2>
        <div className="flex flex-col gap-3">
          {materials.map((mat) => (
            <div key={mat.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary transition">
              <div className="p-3 bg-background rounded-full text-primary">
                {mat.type === "audio" && <FileAudio size={24} />}
                {mat.type === "pdf" && <FileText size={24} />}
                {mat.type === "image" && <ImageIcon size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{mat.title}</h3>
                <p className="text-sm text-gray-400 capitalize">{mat.type} File</p>
                {mat.type === "audio" && !mat.transcript && (
                  <p className="text-xs text-yellow-500 mt-1">Transcription pending...</p>
                )}
              </div>
              <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                View/Download
              </a>
            </div>
          ))}
          {materials.length === 0 && (
            <p className="text-gray-500">No materials uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
