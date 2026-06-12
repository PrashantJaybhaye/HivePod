"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4 text-primary">Create New Course</h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Course Title</label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="e.g. Advanced React"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              placeholder="Course description..."
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link href={`/admin/course/${course.id}`} key={course.id}>
              <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer h-full">
                <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{course.description}</p>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-500">No courses yet. Create one above!</p>
          )}
        </div>
      </div>
    </div>
  );
}
