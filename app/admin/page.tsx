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
  const [newCategory, setNewCategory] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Beginner");
  const [newRating, setNewRating] = useState("4.8");
  const [newReviewsCount, setNewReviewsCount] = useState("12");
  const [newAudioTracks, setNewAudioTracks] = useState("0");
  const [newResourcesCount, setNewResourcesCount] = useState("0");
  const [newXpReward, setNewXpReward] = useState("100");
  const [newHasCertificate, setNewHasCertificate] = useState(false);
  const [newLanguage, setNewLanguage] = useState("English");
  const [newUpdatedAtText, setNewUpdatedAtText] = useState("Updated Today");
  const [newAudioDuration, setNewAudioDuration] = useState("2 hrs");
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editInstructor, setEditInstructor] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("Beginner");
  const [editRating, setEditRating] = useState("4.8");
  const [editReviewsCount, setEditReviewsCount] = useState("12");
  const [editAudioTracks, setEditAudioTracks] = useState("0");
  const [editResourcesCount, setEditResourcesCount] = useState("0");
  const [editXpReward, setEditXpReward] = useState("100");
  const [editHasCertificate, setEditHasCertificate] = useState(false);
  const [editLanguage, setEditLanguage] = useState("English");
  const [editUpdatedAtText, setEditUpdatedAtText] = useState("Updated Today");
  const [editAudioDuration, setEditAudioDuration] = useState("2 hrs");

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
        title: newCourseTitle.trim(),
        description: newCourseDesc.trim(),
        category: newCategory.trim() || "IT & Tech",
        instructor: newInstructor.trim() || "HivePod Faculty Team",
        difficulty: newDifficulty,
        rating: parseFloat(newRating) || 4.8,
        reviewsCount: parseInt(newReviewsCount) || 12,
        audioTracks: parseInt(newAudioTracks) || 0,
        resourcesCount: parseInt(newResourcesCount) || 0,
        xpReward: parseInt(newXpReward) || 100,
        hasCertificate: newHasCertificate,
        language: newLanguage.trim() || "English",
        updatedAtText: newUpdatedAtText.trim() || "Updated Today",
        audioDuration: newAudioDuration.trim() || "2 hrs",
        createdAt: serverTimestamp(),
      });
      setNewCourseTitle("");
      setNewCourseDesc("");
      setNewCategory("");
      setNewInstructor("");
      setNewDifficulty("Beginner");
      setNewRating("4.8");
      setNewReviewsCount("12");
      setNewAudioTracks("0");
      setNewResourcesCount("0");
      setNewXpReward("100");
      setNewHasCertificate(false);
      setNewLanguage("English");
      setNewUpdatedAtText("Updated Today");
      setNewAudioDuration("2 hrs");
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
    setEditCategory(course.category || "");
    setEditInstructor(course.instructor || "");
    setEditDifficulty(course.difficulty || "Beginner");
    setEditRating(course.rating?.toString() || "4.8");
    setEditReviewsCount(course.reviewsCount?.toString() || "12");
    setEditAudioTracks(course.audioTracks?.toString() || "0");
    setEditResourcesCount(course.resourcesCount?.toString() || "0");
    setEditXpReward(course.xpReward?.toString() || "100");
    setEditHasCertificate(course.hasCertificate || false);
    setEditLanguage(course.language || "English");
    setEditUpdatedAtText(course.updatedAtText || "Updated Today");
    setEditAudioDuration(course.audioDuration || "2 hrs");
  };

  const cancelEditing = () => {
    setEditingCourseId(null);
    setEditTitle("");
    setEditDesc("");
    setEditCategory("");
    setEditInstructor("");
    setEditDifficulty("Beginner");
    setEditRating("4.8");
    setEditReviewsCount("12");
    setEditAudioTracks("0");
    setEditResourcesCount("0");
    setEditXpReward("100");
    setEditHasCertificate(false);
    setEditLanguage("English");
    setEditUpdatedAtText("Updated Today");
    setEditAudioDuration("2 hrs");
  };

  const handleUpdateCourse = async (courseId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      await updateDoc(doc(db, "courses", courseId), {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory.trim() || "IT & Tech",
        instructor: editInstructor.trim() || "HivePod Faculty Team",
        difficulty: editDifficulty,
        rating: parseFloat(editRating) || 4.8,
        reviewsCount: parseInt(editReviewsCount) || 12,
        audioTracks: parseInt(editAudioTracks) || 0,
        resourcesCount: parseInt(editResourcesCount) || 0,
        xpReward: parseInt(editXpReward) || 100,
        hasCertificate: editHasCertificate,
        language: editLanguage.trim() || "English",
        updatedAtText: editUpdatedAtText.trim() || "Updated Today",
        audioDuration: editAudioDuration.trim() || "2 hrs"
      });
      setEditingCourseId(null);
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 pt-3 pb-8 lg:pt-6 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Premium Header */}
        <div className="relative mb-8 rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-blue-500/10 opacity-50"></div>
          
          <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-gray-400">
                  Manage your platform's courses and content.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-black/30 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{courses.length}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Course Section */}
        <div className="mb-8 bg-[#111111] p-5 md:p-6 rounded-2xl border border-white/10 shadow-md">
          <h2 className="text-lg font-bold tracking-tight mb-4 text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
            Create New Course
          </h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Course Title</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced React"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Web Development"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Instructor</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Difficulty</label>
                <select
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Reviews</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={newReviewsCount}
                    onChange={(e) => setNewReviewsCount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* New Metadata Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Audio Pods</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  value={newAudioTracks}
                  onChange={(e) => setNewAudioTracks(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">PDF Resources</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  value={newResourcesCount}
                  onChange={(e) => setNewResourcesCount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">XP Reward</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  value={newXpReward}
                  onChange={(e) => setNewXpReward(e.target.value)}
                />
              </div>
              <div className="flex items-center h-full pt-6">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-400 select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                    checked={newHasCertificate}
                    onChange={(e) => setNewHasCertificate(e.target.checked)}
                  />
                  <span>CERTIFICATE INCLUDED</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Language</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g. English"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Update Frequency</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newUpdatedAtText}
                  onChange={(e) => setNewUpdatedAtText(e.target.value)}
                  placeholder="e.g. Updated Weekly"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Audio Listening Hours</label>
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                  value={newAudioDuration}
                  onChange={(e) => setNewAudioDuration(e.target.value)}
                  placeholder="e.g. 4.5 hrs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600 min-h-[80px]"
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                placeholder="Brief course description..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>

        {/* Course List */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-200">
              Manage Courses
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex flex-col h-full hover:border-primary/50 transition-all duration-300 relative group min-h-[200px] shadow-sm hover:shadow-primary/5">
                {editingCourseId === course.id ? (
                  <div className="flex flex-col gap-3 h-full overflow-y-auto">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-primary text-xs font-semibold"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Category</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Instructor</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editInstructor}
                          onChange={(e) => setEditInstructor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Difficulty</label>
                        <select
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs cursor-pointer"
                          value={editDifficulty}
                          onChange={(e) => setEditDifficulty(e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Rating</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editRating}
                          onChange={(e) => setEditRating(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Reviews</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editReviewsCount}
                          onChange={(e) => setEditReviewsCount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Audio Pods</label>
                        <input
                          type="number"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editAudioTracks}
                          onChange={(e) => setEditAudioTracks(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">PDF Resources</label>
                        <input
                          type="number"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editResourcesCount}
                          onChange={(e) => setEditResourcesCount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">XP Reward</label>
                        <input
                          type="number"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editXpReward}
                          onChange={(e) => setEditXpReward(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center h-full pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-400 font-bold select-none">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-white/10 bg-black/50 text-primary cursor-pointer accent-primary"
                            checked={editHasCertificate}
                            onChange={(e) => setEditHasCertificate(e.target.checked)}
                          />
                          <span>CERTIFICATE</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Language</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editLanguage}
                          onChange={(e) => setEditLanguage(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Update Freq</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editUpdatedAtText}
                          onChange={(e) => setEditUpdatedAtText(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Listen Time</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-primary text-xs"
                          value={editAudioDuration}
                          onChange={(e) => setEditAudioDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Description</label>
                      <textarea
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-primary text-xs flex-1 resize-none"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-auto pt-2">
                      <button onClick={cancelEditing} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                        <X size={16} />
                      </button>
                      <button onClick={() => handleUpdateCourse(course.id)} className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#111111]/80 backdrop-blur-sm p-1 rounded-lg border border-white/5">
                      <button onClick={() => startEditing(course)} className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <Link href={`/admin/course/${course.id}`} className="flex-1 flex flex-col pt-1">
                      <h3 className="font-bold text-lg text-white pr-14 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">{course.description}</p>
                      
                      {/* Enriched Display on Admin Card */}
                      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                        <div><span className="text-gray-600">Cat:</span> {course.category || "IT & Tech"}</div>
                        <div><span className="text-gray-600">Inst:</span> {course.instructor || "HivePod Team"}</div>
                        <div><span className="text-gray-600">Diff:</span> {course.difficulty || "Beginner"}</div>
                        <div><span className="text-gray-600">Rating:</span> {course.rating || "4.8"} ({course.reviewsCount || "12"})</div>
                        <div><span className="text-gray-600">Pods:</span> {course.audioTracks || 0}</div>
                        <div><span className="text-gray-600">PDFs:</span> {course.resourcesCount || 0}</div>
                        <div><span className="text-gray-600">XP:</span> {course.xpReward || 100}</div>
                        <div><span className="text-gray-600">Cert:</span> {course.hasCertificate ? "Yes" : "No"}</div>
                        <div><span className="text-gray-600">Lang:</span> {course.language || "English"}</div>
                        <div><span className="text-gray-600">Update:</span> {course.updatedAtText || "Updated Today"}</div>
                        <div><span className="text-gray-600">Listen Time:</span> {course.audioDuration || "2 hrs"}</div>
                      </div>

                      <div className="mt-auto pt-5 flex items-center justify-between">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          Manage Content <span className="text-lg leading-none">&rarr;</span>
                        </span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-gray-400 text-sm">No courses available. Create your first course above!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
