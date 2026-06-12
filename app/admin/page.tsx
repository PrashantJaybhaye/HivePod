"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Pencil, Trash2, X, Check } from "lucide-react";

export default function AdminPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const coursesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCourses(coursesData);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        title: newCourseTitle,
        description: newCourseDesc,
        createdAt: serverTimestamp(),
      });
      setNewCourseTitle("");
      setNewCourseDesc("");
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? All associated folders and materials must be deleted separately.")) return;
    
    try {
      await deleteDoc(doc(db, "courses", courseId));
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  const startEditing = (course: any) => {
    setEditingCourseId(course.id);
    setEditTitle(course.title);
    setEditDesc(course.description || "");
  };

  const cancelEditing = () => {
    setEditingCourseId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleUpdateCourse = async (courseId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, "courses", courseId), {
        title: editTitle,
        description: editDesc
      });
      setEditingCourseId(null);
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
      <div className="bg-card p-4 md:p-5 rounded-lg border border-border">
        <h2 className="text-lg md:text-xl font-bold tracking-tight mb-3 text-primary">Create New Course</h2>
        <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Course Title</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="e.g. Advanced React"
                required
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                placeholder="Course description..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white text-sm font-medium px-5 py-1.5 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-foreground">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-card border border-border rounded-xl p-4 flex flex-col h-full hover:border-white/10 transition-colors relative group min-h-[120px]">
              {editingCourseId === course.id ? (
                <div className="flex flex-col gap-3 h-full">
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm font-semibold"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs flex-1"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-auto pt-2">
                    <button onClick={cancelEditing} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400">
                      <X size={16} />
                    </button>
                    <button onClick={() => handleUpdateCourse(course.id)} className="p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(course)} className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <Link href={`/admin/course/${course.id}`} className="flex-1 flex flex-col pt-1">
                    <h3 className="font-semibold text-base text-foreground pr-14 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                    <div className="mt-auto pt-3 text-primary text-[10px] font-semibold uppercase tracking-wider">
                      Manage Folders &rarr;
                    </div>
                  </Link>
                </>
              )}
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-500">No courses yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
