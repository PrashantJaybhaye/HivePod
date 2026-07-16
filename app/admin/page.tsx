"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  X,
  Plus,
  BookOpen,
  Headphones,
  FileText,
  Zap,
  ChevronRight,
  Globe,
  Clock,
  Layers
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Shared Form States (Ratings and reviews removed)
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [xpReward, setXpReward] = useState("100");
  const [language, setLanguage] = useState("English");

  const fetchCourses = async () => {
    setDbLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const foldersSnap = await getDocs(collection(db, "folders"));
      const materialsSnap = await getDocs(collection(db, "materials"));

      const folderToCourse: Record<string, string> = {};
      foldersSnap.docs.forEach(f => {
        folderToCourse[f.id] = f.data().courseId;
      });

      const counts: Record<string, { audio: number; pdf: number; total: number }> = {};
      materialsSnap.docs.forEach(m => {
        const data = m.data();
        const courseId = folderToCourse[data.folderId];
        if (courseId) {
          if (!counts[courseId]) counts[courseId] = { audio: 0, pdf: 0, total: 0 };
          counts[courseId].total += 1;
          if (data.type === 'audio') counts[courseId].audio += 1;
          else if (data.type === 'pdf') counts[courseId].pdf += 1;
        }
      });

      const coursesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const stats = counts[doc.id] || { audio: 0, pdf: 0, total: 0 };
        const audioTracks = stats.audio;
        const resourcesCount = stats.pdf;
        
        // Calculate dynamic duration
        const minutes = stats.total * 15;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        const audioDuration = minutes === 0 ? "0 hrs" : 
          (minutes < 60 ? `${minutes} mins` : 
            (remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hrs`));

        return {
          id: doc.id,
          ...data,
          audioTracks,
          resourcesCount,
          audioDuration
        };
      });
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setCourseTitle("");
    setCourseDesc("");
    setCategory("");
    setInstructor("");
    setDifficulty("Beginner");
    setXpReward("100");
    setLanguage("English");
    setEditingCourseId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: any) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title || "");
    setCourseDesc(course.description || "");
    setCategory(course.category || "");
    setInstructor(course.instructor || "");
    setDifficulty(course.difficulty || "Beginner");
    setXpReward(course.xpReward?.toString() || "100");
    setLanguage(course.language || "English");
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        title: courseTitle.trim(),
        description: courseDesc.trim(),
        category: category.trim() || "IT & Tech",
        instructor: instructor.trim() || "HivePod Faculty Team",
        difficulty: difficulty,
        xpReward: parseInt(xpReward) || 100,
        language: language.trim() || "English",
        audioTracks: 0,
        resourcesCount: 0,
        audioDuration: "0 hrs",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId || !courseTitle.trim()) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "courses", editingCourseId), {
        title: courseTitle.trim(),
        description: courseDesc.trim(),
        category: category.trim() || "IT & Tech",
        instructor: instructor.trim() || "HivePod Faculty Team",
        difficulty: difficulty,
        xpReward: parseInt(xpReward) || 100,
        language: language.trim() || "English",
        updatedAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
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

  // Dashboard aggregates
  const totalCourses = courses.length;
  const totalAudioPods = courses.reduce((sum, c) => sum + (c.audioTracks || 0), 0);
  const totalPDFs = courses.reduce((sum, c) => sum + (c.resourcesCount || 0), 0);
  const totalXP = courses.reduce((sum, c) => sum + (c.xpReward || 0), 0);

  return (
    <div className="flex flex-col flex-1 pb-16 px-4 md:px-0 bg-background">
      {/* Apple Developer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Courses
          </h1>
          <p className="text-xs text-[#86868b] mt-0.5">
            Create and manage course syllabi, files, and metadata settings.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start sm:self-center bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} className="stroke-[2.5]" />
          New Course
        </button>
      </div>

      {/* Analytics Widgets Grid (Apple Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider capitalizemb-2">Total Courses</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalCourses}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider capitalizemb-2">Audio Tracks</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalAudioPods}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider capitalizemb-2">PDF Resources</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalPDFs}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider capitalizemb-2">XP Reward Total</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalXP}</span>
        </div>
      </div>

      {/* Courses iOS-Widget Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#86868b] capitalizetracking-wider">Curriculum Catalog</h2>
        </div>

        {dbLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white/1 border border-white/5 rounded-2xl h-44 shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-white/10 bg-[#09090b] overflow-hidden flex flex-col cursor-pointer group"
                onClick={() => router.push(`/admin/course/${course.id}`)}
              >
                <div className="p-3 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-white/5 border border-white/10 text-[8px] font-bold tracking-wider text-white/50 uppercase">
                      {course.category || "IT & Tech"}
                    </span>
                    <div className="flex gap-1 relative z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(course);
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center bg-white/5 text-[#86868b] border border-white/5 hover:text-white"
                        title="Edit"
                      >
                        <Pencil size={9} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center bg-white/5 text-[#86868b] border border-white/5 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>

                  {/* Course Metadata Content */}
                  <h3 className="text-[13px] font-bold text-white leading-tight mb-1 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-white/40 mb-2 line-clamp-1">
                    {course.description || "No description provided."}
                  </p>

                  {/* Compact Stats Row */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Headphones size={10} className="text-red-500" />
                      <span className="text-[10px] font-bold text-white">{course.audioTracks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={10} className="text-red-500" />
                      <span className="text-[10px] font-bold text-white">{course.resourcesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-red-500" />
                      <span className="text-[10px] font-bold text-white">{course.xpReward || 0}</span>
                    </div>
                  </div>

                  {/* Single Line Metadata */}
                  <div className="flex justify-between items-center text-[9px] mt-auto">
                    <span className="text-white/40">Inst: <span className="text-white/80">{course.instructor || "HivePod Faculty"}</span></span>
                    <span className="text-white/40">{course.audioDuration || "10h 15m"}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/6 px-3 py-2 bg-white/[0.01]">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-red-500">
                      Manage Track
                    </span>
                    <ChevronRight size={10} className="text-red-500" />
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="text-white/20 mb-3">
                  <BookOpen size={32} strokeWidth={1} />
                </div>
                <h3 className="text-sm font-medium text-white/60 mb-1">
                  No courses listed yet
                </h3>
                <p className="text-xs text-white/30 max-w-[260px] mb-4">
                  Get started by adding your first course to the catalog.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors group cursor-pointer"
                >
                  <Plus size={14} className="group-hover:scale-110 transition-transform" />
                  <span>Add Course</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apple Settings Sheet-Style Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1c1c1e]">
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "create" ? "Add Course" : "Edit Course Details"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-[#86868b] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={modalMode === "create" ? handleCreateCourse : handleUpdateCourse} className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Field 1: Title */}
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Title</label>
                <input
                  type="text"
                  className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced Network Security"
                  required
                />
              </div>

              {/* Field 2: Description */}
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Description</label>
                <textarea
                  className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20 min-h-[70px] resize-y"
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Brief course objectives and details..."
                />
              </div>

              {/* Field 3: Category & Instructor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Category</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. IT & Tech"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Instructor</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. Faculty Team"
                  />
                </div>
              </div>

              {/* Field 4: Difficulty & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Difficulty</label>
                  <select
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Beginner" className="bg-[#1c1c1e] text-white">Beginner</option>
                    <option value="Intermediate" className="bg-[#1c1c1e] text-white">Intermediate</option>
                    <option value="Advanced" className="bg-[#1c1c1e] text-white">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">Language</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
              </div>

              {/* Field 5: XP Reward */}
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 capitalizetracking-wider">XP Reward</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-[#f5f5f7] text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  {loading ? "Saving..." : (modalMode === "create" ? "Create Course" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
