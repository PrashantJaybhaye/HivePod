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
  const [audioTracks, setAudioTracks] = useState("0");
  const [resourcesCount, setResourcesCount] = useState("0");
  const [xpReward, setXpReward] = useState("100");
  const [language, setLanguage] = useState("English");
  const [updatedAtText, setUpdatedAtText] = useState("Updated Today");
  const [audioDuration, setAudioDuration] = useState("2 hrs");

  const fetchCourses = async () => {
    setDbLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
    setAudioTracks("0");
    setResourcesCount("0");
    setXpReward("100");
    setLanguage("English");
    setUpdatedAtText("Updated Today");
    setAudioDuration("2 hrs");
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
    setAudioTracks(course.audioTracks?.toString() || "0");
    setResourcesCount(course.resourcesCount?.toString() || "0");
    setXpReward(course.xpReward?.toString() || "100");
    setLanguage(course.language || "English");
    setUpdatedAtText(course.updatedAtText || "Updated Today");
    setAudioDuration(course.audioDuration || "2 hrs");
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
        audioTracks: parseInt(audioTracks) || 0,
        resourcesCount: parseInt(resourcesCount) || 0,
        xpReward: parseInt(xpReward) || 100,
        language: language.trim() || "English",
        updatedAtText: updatedAtText.trim() || "Updated Today",
        audioDuration: audioDuration.trim() || "2 hrs",
        createdAt: serverTimestamp(),
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
        audioTracks: parseInt(audioTracks) || 0,
        resourcesCount: parseInt(resourcesCount) || 0,
        xpReward: parseInt(xpReward) || 100,
        language: language.trim() || "English",
        updatedAtText: updatedAtText.trim() || "Updated Today",
        audioDuration: audioDuration.trim() || "2 hrs"
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
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider uppercase mb-2">Total Courses</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalCourses}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider uppercase mb-2">Audio Tracks</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalAudioPods}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider uppercase mb-2">PDF Resources</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalPDFs}</span>
        </div>
        <div className="bg-[#1c1c1e]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-[#86868b] font-semibold tracking-wider uppercase mb-2">XP Reward Total</span>
          <span className="text-2xl font-semibold text-white tracking-tight">{totalXP}</span>
        </div>
      </div>

      {/* Courses iOS-Widget Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wider">Curriculum Catalog</h2>
        </div>
        
        {dbLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white/[0.01] border border-white/5 rounded-2xl h-44 shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-[#1c1c1e]/30 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[220px] transition-all duration-200 group relative hover:bg-white/[0.02] shadow-xs cursor-pointer hover:-translate-y-0.5"
                onClick={() => router.push(`/admin/course/${course.id}`)}
              >
                {/* Header: Category Badge and Pencil/Trash Actions */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-[#86868b] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase">
                    {course.category || "IT & Tech"}
                  </span>
                  
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-150 relative z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(course);
                      }} 
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-[#86868b] hover:text-white border border-white/5 hover:border-white/10 transition-colors cursor-pointer" 
                      title="Edit"
                    >
                      <Pencil size={11} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }} 
                      className="p-1 rounded-md bg-white/5 hover:bg-red-500/10 text-[#86868b] hover:text-red-400 border border-white/5 hover:border-red-500/10 transition-colors cursor-pointer" 
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Course Metadata Content */}
                <div className="flex-1 flex flex-col mt-1">
                  <h3 className="font-semibold text-sm text-white tracking-tight leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-[#86868b] line-clamp-2 leading-normal flex-1 mb-3">
                    {course.description || "No description provided."}
                  </p>

                  {/* iOS-Widget Styled Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-2 my-3 text-center">
                    <div>
                      <span className="text-[9px] text-[#86868b] block mb-0.5 uppercase tracking-wider font-semibold">Pods</span>
                      <span className="text-xs font-semibold text-white flex items-center justify-center gap-1">
                        <Headphones size={11} className="text-primary shrink-0" />
                        {course.audioTracks || 0}
                      </span>
                    </div>
                    <div className="border-x border-white/5">
                      <span className="text-[9px] text-[#86868b] block mb-0.5 uppercase tracking-wider font-semibold">PDFs</span>
                      <span className="text-xs font-semibold text-white flex items-center justify-center gap-1">
                        <FileText size={11} className="text-primary shrink-0" />
                        {course.resourcesCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#86868b] block mb-0.5 uppercase tracking-wider font-semibold">XP</span>
                      <span className="text-xs font-semibold text-white flex items-center justify-center gap-1">
                        <Zap size={11} className="text-primary shrink-0" />
                        {course.xpReward || 0}
                      </span>
                    </div>
                  </div>

                  {/* Apple Spec Sheet Key-Value Grid */}
                  <div className="space-y-1 text-[10px] text-white/50 border-t border-white/5 pt-3 mb-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#86868b]">Instructor</span>
                      <span className="text-white font-medium truncate max-w-[110px]">{course.instructor || "Faculty Team"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#86868b]">Difficulty</span>
                      <span className="text-white font-medium">{course.difficulty || "Beginner"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#86868b]">Listening Time</span>
                      <span className="text-white font-medium">{course.audioDuration || "2 hrs"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer link overlay indicator */}
                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-primary font-semibold hover:text-primary/85 transition-colors">
                  <span>Manage Track</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
            
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#1c1c1e]/10">
                <BookOpen size={24} className="mx-auto text-[#86868b]/30 mb-2" />
                <p className="text-xs text-[#86868b] font-medium">No courses listed yet</p>
                <button 
                  onClick={handleOpenCreateModal}
                  className="mt-3 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-[#e8e8ed] transition-colors"
                >
                  Add Your First Course
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
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Title</label>
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
                <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Description</label>
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
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. IT & Tech"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Instructor</label>
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
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Difficulty</label>
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
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Language</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
              </div>

              {/* Field 5: Audio Pods & PDF count */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Audio Tracks</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={audioTracks}
                    onChange={(e) => setAudioTracks(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">PDF Resources</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={resourcesCount}
                    onChange={(e) => setResourcesCount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={xpReward}
                    onChange={(e) => setXpReward(e.target.value)}
                  />
                </div>
              </div>

              {/* Field 6: Duration & Update Freq */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Listen Time</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    placeholder="e.g. 2 hrs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] mb-1 uppercase tracking-wider">Update Freq</label>
                  <input
                    type="text"
                    className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    value={updatedAtText}
                    onChange={(e) => setUpdatedAtText(e.target.value)}
                    placeholder="e.g. Updated Today"
                  />
                </div>
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
