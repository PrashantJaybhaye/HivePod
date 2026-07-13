"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X, Plus, ChevronRight, Folder } from "lucide-react";

export default function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderTitle, setFolderTitle] = useState("");

  const fetchCourseAndFolders = async () => {
    setDbLoading(true);
    try {
      // Fetch Course
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (courseSnap.exists()) {
        setCourse({ id: courseSnap.id, ...courseSnap.data() });
      }

      // Fetch Folders
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      // Sort alphabetically by title
      foldersData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      setFolders(foldersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndFolders();
  }, [courseId]);

  const resetForm = () => {
    setFolderTitle("");
    setEditingFolderId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (folder: any) => {
    setEditingFolderId(folder.id);
    setFolderTitle(folder.title || "");
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "folders"), {
        courseId,
        title: folderTitle.trim(),
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      resetForm();
      fetchCourseAndFolders();
    } catch (error) {
      console.error("Error adding folder:", error);
      alert("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolderId || !folderTitle.trim()) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "folders", editingFolderId), {
        title: folderTitle.trim()
      });
      setIsModalOpen(false);
      resetForm();
      fetchCourseAndFolders();
    } catch (error) {
      console.error("Error updating folder:", error);
      alert("Failed to update folder");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderIdToDel: string) => {
    if (!confirm("Are you sure you want to delete this folder? Associated materials must be deleted separately.")) return;

    try {
      await deleteDoc(doc(db, "folders", folderIdToDel));
      fetchCourseAndFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  };

  if (!course) return <div className="p-8 text-center text-xs text-[#86868b]">Loading course curriculum...</div>;

  return (
    <div className="flex flex-col flex-1 pb-16 px-4 md:px-0">
      {/* Apple Style Navigation Back link */}
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-white transition-colors duration-150 mb-5 font-semibold">
        <ArrowLeft size={12} /> Courses
      </Link>

      {/* Apple Developer Course Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-white/10 mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white truncate">
            {course.title}
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5 truncate max-w-2xl">
            {course.description || "Manage course structures and syllabus files."}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start sm:self-center bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} className="stroke-[2.5]" />
          New Folder
        </button>
      </div>

      {/* Folders iOS-Widget Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#86868b] capitalizetracking-wider">Folders</h2>
        </div>

        {dbLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/1 border border-white/5 rounded-2xl h-32 shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="relative group flex flex-col items-center p-4 rounded-[20px] select-none text-center w-full"
              >
                {/* Action buttons on hover (absolute top-right) */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                  <button
                    onClick={() => handleOpenEditModal(folder)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                <Link href={`/admin/folder/${folder.id}`} className="flex flex-col items-center w-full">
                  {/* Clean Flat iOS/macOS Folder Icon using folderr.png */}
                  <div className="relative w-20 h-20 mb-2 shrink-0">
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
                </Link>
              </div>
            ))}

            {folders.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#1c1c1e]/10">
                <Folder size={24} className="mx-auto text-[#86868b]/30 mb-2" />
                <p className="text-xs text-[#86868b] font-medium">No folders in this course yet</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-3 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-[#e8e8ed] transition-colors"
                >
                  Create Your First Folder
                </button>
              </div>
            )}
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
                {modalMode === "create" ? "New Folder" : "Rename Folder"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-[#86868b] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={modalMode === "create" ? handleCreateFolder : handleUpdateFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Folder Title</label>
                <input
                  type="text"
                  className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: Introduction to Network Ports"
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
                  {loading ? "Saving..." : (modalMode === "create" ? "Create Folder" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
