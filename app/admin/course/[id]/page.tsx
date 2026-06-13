"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X, Check } from "lucide-react";

export default function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const fetchCourseAndFolders = async () => {
      // Fetch Course
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      if (courseSnap.exists()) {
        setCourse({ id: courseSnap.id, ...courseSnap.data() });
      }

      // Fetch Folders
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFolders(foldersData);
    };
    fetchCourseAndFolders();
  }, [courseId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "folders"), {
        courseId,
        title: newFolderTitle,
        createdAt: serverTimestamp(),
      });
      setNewFolderTitle("");
      
      // Refetch
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFolders(foldersData);
    } catch (error) {
      console.error("Error adding folder:", error);
      alert("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    const q = query(collection(db, "folders"), where("courseId", "==", courseId));
    const folderSnap = await getDocs(q);
    const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setFolders(foldersData);
  };

  const handleDeleteFolder = async (folderIdToDel: string) => {
    if (!confirm("Are you sure you want to delete this folder? Associated materials must be deleted separately.")) return;
    
    try {
      await deleteDoc(doc(db, "folders", folderIdToDel));
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  };

  const startEditing = (folder: any) => {
    setEditingFolderId(folder.id);
    setEditTitle(folder.title);
  };

  const cancelEditing = () => {
    setEditingFolderId(null);
    setEditTitle("");
  };

  const handleUpdateFolder = async (folderIdToUpdate: string) => {
    if (!editTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, "folders", folderIdToUpdate), {
        title: editTitle
      });
      setEditingFolderId(null);
      fetchFolders();
    } catch (error) {
      console.error("Error updating folder:", error);
      alert("Failed to update folder");
    }
  };

  if (!course) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-3 pb-8 lg:pt-6 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Navigation & Header */}
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="relative mb-8 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>
          
          <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{course.title}</h1>
            <p className="text-sm md:text-base text-gray-400 max-w-3xl leading-relaxed">{course.description}</p>
          </div>
        </div>

        {/* Create Folder Section */}
        <div className="mb-8 bg-[#111111] p-5 md:p-6 rounded-2xl border border-white/10 shadow-md">
          <h2 className="text-lg font-bold tracking-tight mb-4 text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
            Create New Folder
          </h2>
          <form onSubmit={handleCreateFolder} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Folder Name</label>
              <input
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Introduction"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors whitespace-nowrap h-[42px] flex items-center justify-center"
            >
              {loading ? "Creating..." : "Create Folder"}
            </button>
          </form>
        </div>

        {/* Folders List */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-200">
              Course Folders
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {folders.map((folder) => (
              <div key={folder.id} className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col h-full hover:border-primary/50 transition-all duration-300 relative group min-h-[120px] shadow-sm hover:shadow-primary/5">
                {editingFolderId === folder.id ? (
                  <div className="flex flex-col gap-3 h-full">
                    <input
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary text-sm font-semibold"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-auto pt-2">
                      <button onClick={cancelEditing} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                        <X size={16} />
                      </button>
                      <button onClick={() => handleUpdateFolder(folder.id)} className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#111111]/80 backdrop-blur-sm p-1 rounded-lg border border-white/5">
                      <button onClick={() => startEditing(folder)} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteFolder(folder.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <Link href={`/admin/folder/${folder.id}`} className="flex-1 flex flex-col justify-center pt-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.55 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                        </div>
                        <h3 className="font-bold text-base text-white pr-10 line-clamp-2 group-hover:text-primary transition-colors">{folder.title}</h3>
                      </div>
                      
                      <div className="mt-auto pt-3 flex items-center">
                        <span className="text-gray-500 group-hover:text-gray-300 text-xs font-semibold tracking-wide flex items-center gap-1 transition-colors">
                          Manage materials <span className="text-sm leading-none">&rarr;</span>
                        </span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            ))}
            {folders.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-gray-400 text-sm">No folders found in this course. Create one above!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
