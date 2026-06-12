"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon, Pencil, Trash2, X, Check } from "lucide-react";
import UploadMaterial from "@/components/UploadMaterial";

export default function AdminFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;
  
  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  // Edit State
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  const handleDeleteMaterial = async (materialIdToDel: string) => {
    if (!confirm("Are you sure you want to delete this material? (Note: This only removes the database record, not the file from Storage)")) return;
    
    try {
      await deleteDoc(doc(db, "materials", materialIdToDel));
      fetchFolderAndMaterials();
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material");
    }
  };

  const startEditing = (material: any) => {
    setEditingMaterialId(material.id);
    setEditTitle(material.title);
  };

  const cancelEditing = () => {
    setEditingMaterialId(null);
    setEditTitle("");
  };

  const handleUpdateMaterial = async (materialIdToUpdate: string) => {
    if (!editTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, "materials", materialIdToUpdate), {
        title: editTitle
      });
      setEditingMaterialId(null);
      fetchFolderAndMaterials();
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material");
    }
  };

  useEffect(() => {
    fetchFolderAndMaterials();
    const interval = setInterval(fetchFolderAndMaterials, 5000);
    return () => clearInterval(interval);
  }, [folderId]);

  if (!folder) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
      <Link href={`/admin/course/${folder.courseId}`} className="text-primary hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Course
      </Link>
      
      <div className="border-b border-border pb-3 md:pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{folder.title}</h1>
      </div>

      <UploadMaterial courseId={folder.courseId} folderId={folderId} />

      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 text-foreground">Materials in this Folder</h2>
        <div className="flex flex-col gap-2 md:gap-3">
          {materials.map((mat) => (
            <div key={mat.id} className="bg-card border border-border rounded-xl p-3 flex flex-col md:flex-row items-start md:items-center gap-3 hover:border-primary transition relative group">
              <div className="p-2 bg-background rounded-full text-primary shrink-0">
                {mat.type === "audio" && <FileAudio size={18} />}
                {mat.type === "pdf" && <FileText size={18} />}
                {mat.type === "image" && <ImageIcon size={18} />}
              </div>
              
              {editingMaterialId === mat.id ? (
                <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                  <input
                    type="text"
                    className="flex-1 w-full bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm font-semibold"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 shrink-0">
                    <button onClick={cancelEditing} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400">
                      <X size={16} />
                    </button>
                    <button onClick={() => handleUpdateMaterial(mat.id)} className="p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0 pr-12 md:pr-0">
                    <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{mat.title}</h3>
                    <p className="text-xs text-gray-400 capitalize">{mat.type} File</p>
                    {mat.type === "audio" && !mat.transcript && (
                      <p className="text-[10px] text-yellow-500 mt-0.5 tracking-wide uppercase">Transcription pending...</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                    <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                      View/Download
                    </a>
                    
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(mat)} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
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
