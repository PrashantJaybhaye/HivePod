"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CourseCard from "@/components/CourseCard";
import CourseSkeleton from "@/components/CourseSkeleton";
import EmptyState from "@/components/EmptyState";
import { BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyCourses() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [completedItemsByCourse, setCompletedItemsByCourse] = useState<Record<string, number>>({});
  const [courseItemCounts, setCourseItemCounts] = useState<Record<string, number>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      
      setIsDataLoading(true);
      
      try {
        // 1. Fetch courses
        const coursesSnap = await getDocs(collection(db, "courses"));
        let coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 1.5 Filter by approved requests if not admin
        if (!isAdmin) {
          const reqQuery = query(
            collection(db, "course_requests"),
            where("userId", "==", user.uid),
            where("status", "==", "approved")
          );
          const reqSnap = await getDocs(reqQuery);
          const approvedCourseIds = new Set(reqSnap.docs.map(d => d.data().courseId));
          coursesData = coursesData.filter(c => approvedCourseIds.has(c.id));
        }
        
        // 2. Fetch item counts
        const materialsSnap = await getDocs(collection(db, "materials"));
        const foldersSnap = await getDocs(collection(db, "folders"));
        
        const folderToCourse: Record<string, string> = {};
        foldersSnap.docs.forEach(f => {
          folderToCourse[f.id] = f.data().courseId;
        });

        const counts: Record<string, number> = {};
        materialsSnap.docs.forEach(m => {
          const folderId = m.data().folderId;
          const courseId = folderToCourse[folderId];
          if (courseId) {
            counts[courseId] = (counts[courseId] || 0) + 1;
          }
        });
        setCourseItemCounts(counts);

        // 3. Fetch user progress
        const progressSnap = await getDocs(collection(db, "users", user.uid, "progress"));
        const completedCounts: Record<string, number> = {};
        
        progressSnap.docs.forEach(d => {
          const data = d.data();
          if (data.completed && data.courseId) {
            completedCounts[data.courseId] = (completedCounts[data.courseId] || 0) + 1;
          }
        });
        setCompletedItemsByCourse(completedCounts);
        
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || (!user && isDataLoading)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (!user) return null; // Router will redirect

  const coursesWithCalculations = courses.map(course => {
    const totalItems = courseItemCounts[course.id] || 0;
    const completedItems = completedItemsByCourse[course.id] || 0;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { ...course, totalItems, completedItems, progressPercentage };
  });

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 py-8 lg:py-12 max-w-7xl mx-auto w-full">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-200 mb-1">My Courses</h2>
            <p className="text-sm text-gray-500">Pick up exactly where you left off.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isDataLoading ? (
            Array.from({ length: 8 }).map((_, i) => <CourseSkeleton key={i} />)
          ) : courses.length === 0 ? (
            <EmptyState title="No Courses Enrolled" description="You haven't started any courses yet. Check back when your admin assigns you a course." />
          ) : (
            coursesWithCalculations.map((course, index) => (
              <CourseCard 
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                index={index}
                totalItems={course.totalItems}
                completedItems={course.completedItems}
                progressPercentage={course.progressPercentage}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
