"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon, Pencil, Trash2, X, ChevronRight, RefreshCw, GripVertical } from "lucide-react";
import UploadMaterial from "@/components/UploadMaterial";
import { useBackgroundTasks } from "@/components/BackgroundTasksProvider";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminFolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const folderId = resolvedParams.id;
  const { enqueueTranscription, tasks } = useBackgroundTasks();

  const [folder, setFolder] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  // Modal State for Editing Material Name
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFolderAndMaterials = async () => {
    try {
      const folderSnap = await getDoc(doc(db, "folders", folderId));
      if (folderSnap.exists()) {
        setFolder({ id: folderSnap.id, ...folderSnap.data() });
      }

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
    } catch (error) {
      console.error("Error fetching folder materials:", error);
    }
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

  const handleOpenEditModal = (material: any) => {
    setEditingMaterialId(material.id);
    setMaterialTitle(material.title || "");
    setIsModalOpen(true);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterialId || !materialTitle.trim()) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "materials", editingMaterialId), {
        title: materialTitle.trim()
      });
      setIsModalOpen(false);
      setEditingMaterialId(null);
      setMaterialTitle("");
      fetchFolderAndMaterials();
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(materials);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update UI
    setMaterials(items);

    // Update Firebase in the background
    try {
      const updatePromises = items.map((item, index) => {
        // Only update if the order actually changed to save DB writes
        if (item.order !== index) {
          return updateDoc(doc(db, "materials", item.id), { order: index });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to save new order");
      fetchFolderAndMaterials(); // Revert to server state
    }
  };

  useEffect(() => {
    fetchFolderAndMaterials();
    const interval = setInterval(fetchFolderAndMaterials, 5000);
    return () => clearInterval(interval);
  }, [folderId]);

  if (!folder) return <div className="p-8 text-center text-xs text-[#86868b]">Loading folder materials...</div>;

  return (
    <div className="flex flex-col flex-1 pb-16 px-4 md:px-0">
      {/* Apple Navigation Back Link */}
      <Link href={`/admin/course/${folder.courseId}`} className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-white transition-colors duration-150 mb-5 font-semibold">
        <ArrowLeft size={12} /> Course folders
      </Link>

      {/* Apple Developer Header */}
      <div className="py-5 border-b border-white/10 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {folder.title}
        </h1>
        <p className="text-xs text-[#86868b] mt-0.5">
          Upload and organize educational assets within this module category.
        </p>
      </div>

      {/* Upload Material Section */}
      <div className="mb-10">
        <UploadMaterial courseId={folder.courseId} folderId={folderId} />
      </div>

      {/* Materials List Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#86868b] capitalizetracking-wider">Folder Materials</h2>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="materials-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                {materials.map((mat, index) => (
                  <Draggable key={mat.id} draggableId={mat.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-[#1c1c1e]/30 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-white/2 transition-colors duration-150 group shadow-xs"
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="text-[#86868b] hover:text-white transition-colors cursor-grab active:cursor-grabbing p-1 -ml-2 hidden md:block">
                          <GripVertical size={16} />
                        </div>
                        {/* Type Icon */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary shrink-0">
                          {mat.type === "audio" && <FileAudio size={16} />}
                          {mat.type === "pdf" && <FileText size={16} />}
                          {mat.type === "image" && <ImageIcon size={16} />}
                        </div>

                        {/* Material Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-white truncate">{mat.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[#86868b] text-[10px]">
                            <span className="capitalizefont-semibold bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-[9px] capitalize tracking-wide">
                              {mat.type}
                            </span>
                            {mat.type === "audio" && !mat.transcript && (
                              <div className="flex items-center gap-2">
                                <span className="text-orange-500 font-bold capitalizetracking-wider flex items-center gap-1 text-[9px]">
                                  <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse"></span>
                                  Processing Transcript
                                </span>
                                {/* Show Retry Button if it's not currently queued/processing in the global background task manager */}
                                {!tasks.find(t => t.docId === mat.id && (t.transcriptionState === "queued" || t.transcriptionState === "processing")) && (
                                  <button
                                    onClick={() => enqueueTranscription(mat.id, mat.url, mat.title)}
                                    className="flex items-center gap-1 text-[#86868b] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded text-[9px] cursor-pointer"
                                    title="Retry AI Transcription"
                                  >
                                    <RefreshCw size={10} /> Retry
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions & Links */}
                        <div className="flex items-center gap-4 mt-2 md:mt-0 w-full md:w-auto justify-between md:justify-end shrink-0">
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-primary hover:text-primary/85 transition-colors flex items-center gap-0.5"
                          >
                            View Asset <ChevronRight size={14} />
                          </a>

                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/30 p-1 rounded-lg border border-white/5">
                            <button
                              onClick={() => handleOpenEditModal(mat)}
                              className="p-1 text-[#86868b] hover:text-white transition-colors cursor-pointer"
                              title="Edit Name"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="p-1 text-[#86868b] hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

          {materials.length === 0 && (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#1c1c1e]/10">
              <FileText size={24} className="mx-auto text-[#86868b]/30 mb-2" />
              <p className="text-xs text-[#86868b] font-medium">No files uploaded to this folder yet</p>
              <p className="text-[10px] text-[#86868b]/70 mt-0.5">Use the media uploader above to add files.</p>
            </div>
          )}
        </div>

      {/* Apple Settings Sheet-Style Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1c1c1e]">
              <h3 className="text-base font-bold text-white">
                Rename Material
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-[#86868b] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateMaterial} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Material Title</label>
                <input
                  type="text"
                  className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Introduction Slides"
                  required
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-[#f5f5f7] text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
