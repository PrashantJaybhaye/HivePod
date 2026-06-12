"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);

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

  if (!course) return <div className="p-8 max-w-6xl mx-auto w-full">Loading course...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      <Link href="/" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <ArrowLeft size={16} /> Back to Courses
      </Link>
      
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-bold text-foreground">{course.title}</h1>
        <p className="text-xl text-gray-400 mt-4">{course.description}</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Course Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Link href={`/folder/${folder.id}`} key={folder.id}>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer flex items-center gap-4">
                <Folder className="text-primary" size={32} />
                <h3 className="font-semibold text-xl text-foreground">{folder.title}</h3>
              </div>
            </Link>
          ))}
          {folders.length === 0 && (
            <p className="text-gray-500">This course doesn't have any folders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
