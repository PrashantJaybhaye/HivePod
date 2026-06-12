"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (!course) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      <Link href="/admin" className="text-primary hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
        <p className="text-gray-400 mt-2">{course.description}</p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4 text-primary">Create New Folder</h2>
        <form onSubmit={handleCreateFolder} className="flex gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Link href={`/admin/folder/${folder.id}`} key={folder.id}>
              <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-semibold text-lg text-foreground">{folder.title}</h3>
                <p className="text-sm text-gray-400 mt-2">Click to manage materials</p>
              </div>
            </Link>
          ))}
          {folders.length === 0 && (
            <p className="text-gray-500">No folders yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
