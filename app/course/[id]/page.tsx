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

  if (!course) return <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">Loading course...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
      <Link href="/" className="text-primary hover:underline flex items-center gap-2 w-fit">
        <ArrowLeft size={16} /> Back to Courses
      </Link>
      
      <div className="border-b border-border pb-4 md:pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{course.title}</h1>
        <p className="text-sm md:text-base text-gray-400 mt-2">{course.description}</p>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-foreground">Course Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {folders.map((folder) => (
            <Link href={`/folder/${folder.id}`} key={folder.id}>
              <div className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-all hover:shadow-md cursor-pointer flex items-center gap-3">
                <Folder className="text-primary shrink-0" size={20} />
                <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1">{folder.title}</h3>
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
