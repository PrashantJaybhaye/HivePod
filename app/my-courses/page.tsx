"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CourseCard from "@/components/CourseCard";
import CourseSkeleton from "@/components/CourseSkeleton";
import EmptyState from "@/components/EmptyState";
import { BookOpen, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { safeConvertToDate, safeGetMillis } from "@/lib/utils";

export default function MyCourses() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [completedItemsByCourse, setCompletedItemsByCourse] = useState<Record<string, number>>({});
  const [courseItemCounts, setCourseItemCounts] = useState<Record<string, { audio: number; pdf: number; total: number }>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
            where("userId", "==", user.uid)
          );
          const reqSnap = await getDocs(reqQuery);

          // Map each courseId to its latest request
          const latestRequestsByCourse: Record<string, any> = {};

          reqSnap.docs.forEach(doc => {
            const data = doc.data();
            const courseId = data.courseId;
            if (!courseId) return;

            const existing = latestRequestsByCourse[courseId];
            const currentReqTime = safeGetMillis(data.requestedAt, Date.now());
            const existingReqTime = safeGetMillis(existing?.requestedAt, 0);

            if (!existing || currentReqTime > existingReqTime) {
              latestRequestsByCourse[courseId] = data;
            }
          });

          const approvedCourseIds = new Set(
            Object.keys(latestRequestsByCourse)
              .filter(courseId => {
                const reqData = latestRequestsByCourse[courseId];
                if (reqData.status !== "approved") return false;
                const expiresAt = safeConvertToDate(reqData.restrictions?.expiresAt);
                if (expiresAt && expiresAt.getTime() < Date.now()) {
                  return false;
                }
                return true;
              })
          );
          coursesData = coursesData.filter(c => approvedCourseIds.has(c.id));
        }

        // 2. Fetch item counts
        const materialsSnap = await getDocs(collection(db, "materials"));
        const foldersSnap = await getDocs(collection(db, "folders"));

        const folderToCourse: Record<string, string> = {};
        foldersSnap.docs.forEach(f => {
          folderToCourse[f.id] = f.data().courseId;
        });

        const counts: Record<string, { audio: number; pdf: number; total: number }> = {};
        materialsSnap.docs.forEach(m => {
          const data = m.data();
          const folderId = data.folderId;
          const courseId = folderToCourse[folderId];
          if (courseId) {
            if (!counts[courseId]) counts[courseId] = { audio: 0, pdf: 0, total: 0 };
            counts[courseId].total += 1;
            if (data.type === 'audio') counts[courseId].audio += 1;
            else if (data.type === 'pdf') counts[courseId].pdf += 1;
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
    const totalItems = courseItemCounts[course.id]?.total || 0;
    const audioTracks = courseItemCounts[course.id]?.audio || 0;
    const resourcesCount = courseItemCounts[course.id]?.pdf || 0;
    const completedItems = completedItemsByCourse[course.id] || 0;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { ...course, totalItems, audioTracks, resourcesCount, completedItems, progressPercentage };
  });

  const filteredCourses = coursesWithCalculations.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "active") {
      return matchesSearch && course.progressPercentage > 0 && course.progressPercentage < 100;
    }
    if (activeTab === "completed") {
      return matchesSearch && course.progressPercentage === 100;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-4 pb-8 lg:pt-8 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* iOS Ultra-Compact Single-Row Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/4">
          {/* Left: Title + Count Badge */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              My Courses
            </h2>
            {!isDataLoading && courses.length > 0 && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs font-semibold text-white/60">
                {courses.length}
              </span>
            )}
          </div>

          {/* Right: Search & Segmented Control */}
          {!isDataLoading && courses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={13} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 hover:border-white/15 focus:border-white/20 focus:bg-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/35 transition-all outline-none"
                />
              </div>

              {/* Segmented Control Pills */}
              <div className="flex bg-white/2 border border-white/6 rounded-xl p-0.5 w-full sm:w-auto justify-between">
                {(["all", "active", "completed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 capitalizeflex-1 sm:flex-initial text-center cursor-pointer ${activeTab === tab
                      ? "bg-white/8 text-white shadow-xs"
                      : "text-white/45 hover:text-white/70"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {isDataLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CourseSkeleton key={i} />)
          ) : courses.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="No Courses Enrolled" description="You haven't started any courses yet. Check back when your admin assigns you a course." />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-white/40 mb-1.5">No courses match your criteria.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                className="text-xs font-semibold text-white/60 hover:text-white underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                index={index}
                totalItems={course.totalItems}
                audioTracks={course.audioTracks}
                resourcesCount={course.resourcesCount}
                completedItems={course.completedItems}
                progressPercentage={course.progressPercentage}
                category={course.category}
                instructor={course.instructor}
                difficulty={course.difficulty}
                rating={course.rating}
                reviewsCount={course.reviewsCount}
                xpReward={course.xpReward}
                language={course.language}
                updatedAtText={course.updatedAtText}
                audioDuration={course.audioDuration}
                createdAt={course.createdAt}
                updatedAt={course.updatedAt}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
