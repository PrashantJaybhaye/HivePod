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
    <div className="space-y-8">
      <Link href="/admin" className="text-primary hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">{course.title}</h1>
        <p className="text-gray-400 mt-2 md:text-lg">{course.description}</p>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4 text-primary">Create New Folder</h2>
        <form onSubmit={handleCreateFolder} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={newFolderTitle}
            onChange={(e) => setNewFolderTitle(e.target.value)}
            placeholder="e.g. Chapter 1: Introduction"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Folders in this Course</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-card border border-border rounded-lg p-4 flex flex-col h-full hover:border-white/10 transition-colors relative group">
              {editingFolderId === folder.id ? (
                <div className="flex flex-col gap-3 h-full">
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm font-semibold"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-auto pt-2">
                    <button onClick={cancelEditing} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400">
                      <X size={16} />
                    </button>
                    <button onClick={() => handleUpdateFolder(folder.id)} className="p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => startEditing(folder)} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteFolder(folder.id)} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <Link href={`/admin/folder/${folder.id}`} className="flex-1 flex flex-col pt-1">
                    <h3 className="font-semibold text-lg text-foreground pr-14">{folder.title}</h3>
                    <p className="text-sm text-gray-400 mt-2">Click to manage materials</p>
                  </Link>
                </>
              )}
            </div>
          ))}
          {folders.length === 0 && (
            <p className="text-gray-500">No folders yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
