"use client";

import { useState, useEffect, use } from "react";
import { collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Folder, Lock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function PublicCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  
  const [course, setCourse] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const { user } = useAuth();
  const [accessStatus, setAccessStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);

  useEffect(() => {
    const fetchCourseAndFolders = async () => {
      // Fetch Course
      const courseSnap = await getDoc(doc(db, "courses", courseId));
      let courseData = null;
      if (courseSnap.exists()) {
        courseData = { id: courseSnap.id, ...courseSnap.data() };
        setCourse(courseData);
      }

      if (user && courseData) {
        // Check Access Status
        const reqQuery = query(
          collection(db, "course_requests"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId),
          limit(1)
        );
        const reqSnap = await getDocs(reqQuery);
        if (!reqSnap.empty) {
          setAccessStatus(reqSnap.docs[0].data().status);
        }
      }
      setIsLoadingAccess(false);

      // Fetch Folders (we'll do this regardless but hide in UI if not approved)
      const q = query(collection(db, "folders"), where("courseId", "==", courseId));
      const folderSnap = await getDocs(q);
      const foldersData = folderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFolders(foldersData);
    };
    fetchCourseAndFolders();
  }, [courseId, user]);

  const handleRequestAccess = async () => {
    if (!user || !course) return;
    setRequestingAccess(true);
    try {
      await addDoc(collection(db, "course_requests"), {
        userId: user.uid,
        courseId: course.id,
        userEmail: user.email,
        courseTitle: course.title,
        status: "pending",
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setAccessStatus("pending");
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Failed to request access. Please try again.");
    } finally {
      setRequestingAccess(false);
    }
  };

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

      {isLoadingAccess ? (
        <div className="text-gray-400">Loading access status...</div>
      ) : (
        <>
          {accessStatus === "approved" ? (
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
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto mt-8">
              {!user ? (
                <>
                  <Lock className="text-gray-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-foreground mb-2">Login Required</h3>
                  <p className="text-gray-400 mb-6">You must be logged in to request access to this course.</p>
                  <Link href="/">
                    <button className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      Go to Login
                    </button>
                  </Link>
                </>
              ) : accessStatus === "pending" ? (
                <>
                  <CheckCircle className="text-yellow-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-foreground mb-2">Access Requested</h3>
                  <p className="text-gray-400">Your request is pending approval from an administrator. Check back later.</p>
                </>
              ) : accessStatus === "rejected" ? (
                <>
                  <XCircle className="text-red-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-foreground mb-2">Access Denied</h3>
                  <p className="text-gray-400">Your request to access this course was rejected.</p>
                </>
              ) : (
                <>
                  <Lock className="text-primary mb-4" size={48} />
                  <h3 className="text-xl font-bold text-foreground mb-2">Private Course</h3>
                  <p className="text-gray-400 mb-6">You need to request access to view the materials in this course.</p>
                  <button 
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    className="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {requestingAccess ? "Requesting..." : "Request Access"}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
