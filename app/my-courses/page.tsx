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
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-3 pb-8 lg:pt-6 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Compact & Premium Header */}
        <div className="relative mb-8 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>

          <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                  My Courses
                </h2>
                <p className="text-sm text-gray-400">
                  Pick up exactly where you left off.
                </p>
              </div>
            </div>

            {/* Quick Stats (Compact) */}
            {!isDataLoading && courses.length > 0 && (
              <div className="flex items-center gap-5 bg-black/30 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{courses.length}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Enrolled</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {coursesWithCalculations.filter(c => c.progressPercentage === 100).length}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Completed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-bold text-neutral-200">
            {courses.length > 0 ? "Continue Learning" : "Your Learning Path"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {isDataLoading ? (
            Array.from({ length: 8 }).map((_, i) => <CourseSkeleton key={i} />)
          ) : courses.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="No Courses Enrolled" description="You haven't started any courses yet. Check back when your admin assigns you a course." />
            </div>
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
