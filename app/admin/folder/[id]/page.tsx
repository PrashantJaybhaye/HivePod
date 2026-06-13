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
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-3 pb-8 lg:pt-6 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Navigation & Header */}
        <Link href={`/admin/course/${folder.courseId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Course
        </Link>
        
        <div className="relative mb-8 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>
          
          <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{folder.title}</h1>
            <p className="text-sm md:text-base text-gray-400 max-w-3xl leading-relaxed">Manage materials within this folder.</p>
          </div>
        </div>

        {/* Upload Material Section */}
        <div className="mb-8">
          <UploadMaterial courseId={folder.courseId} folderId={folderId} />
        </div>

        {/* Materials List */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-200">
              Folder Materials
            </h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {materials.map((mat) => (
              <div key={mat.id} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-primary/50 transition-all duration-300 relative group shadow-sm">
                <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-primary transition-colors shrink-0">
                  {mat.type === "audio" && <FileAudio size={20} />}
                  {mat.type === "pdf" && <FileText size={20} />}
                  {mat.type === "image" && <ImageIcon size={20} />}
                </div>
                
                {editingMaterialId === mat.id ? (
                  <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                    <input
                      type="text"
                      className="flex-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary text-sm font-semibold"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 shrink-0">
                      <button onClick={cancelEditing} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                        <X size={16} />
                      </button>
                      <button onClick={() => handleUpdateMaterial(mat.id)} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0 pr-12 md:pr-0">
                      <h3 className="font-bold text-base text-white truncate">{mat.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400 capitalize font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{mat.type} File</span>
                        {mat.type === "audio" && !mat.transcript && (
                          <span className="text-[10px] text-yellow-500 font-bold tracking-wider uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            Processing Transcript
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                      <a href={mat.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-300 hover:text-primary transition-colors flex items-center gap-1.5">
                        View File <span className="text-lg leading-none">&rarr;</span>
                      </a>
                      
                      <div className="flex gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111]/80 backdrop-blur-sm p-1 rounded-lg border border-white/5">
                        <button onClick={() => startEditing(mat)} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {materials.length === 0 && (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 mt-2">
                <p className="text-gray-400 text-sm">No materials uploaded yet. Use the uploader above to add content.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
