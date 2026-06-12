"use client";

import { useAuth } from "@/components/AuthProvider";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import CourseCard from "@/components/CourseCard";
import { BookOpen, Target, Clock, Zap, Activity, UserCircle, FileCheck, LineChart } from "lucide-react";
import { recordLoginForStreak } from "@/lib/tracking";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ timeInvestedMinutes: 0, currentStreak: 0 });
  const [completedItemsByCourse, setCompletedItemsByCourse] = useState<Record<string, number>>({});
  const [courseItemCounts, setCourseItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch courses
      const coursesSnap = await getDocs(collection(db, "courses"));
      const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);

      // 2. Fetch all folders and materials to get item counts per course
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

      if (user) {
        // 3. Record streak and fetch user stats
        await recordLoginForStreak(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserStats({
            timeInvestedMinutes: data.timeInvestedMinutes || 0,
            currentStreak: data.currentStreak || 1
          });
        }

        // 4. Fetch user progress
        const progressSnap = await getDocs(collection(db, "users", user.uid, "progress"));
        const completedCounts: Record<string, number> = {};
        
        progressSnap.docs.forEach(d => {
          const data = d.data();
          if (data.completed && data.courseId) {
            completedCounts[data.courseId] = (completedCounts[data.courseId] || 0) + 1;
          }
        });
        setCompletedItemsByCourse(completedCounts);
      }
    };
    fetchData();
  }, [user]);

  // Calculate Average Progress across all enrolled courses
  let totalProgressPercentage = 0;
  let coursesWithProgress = 0;

  const coursesWithCalculations = courses.map(course => {
    const totalItems = courseItemCounts[course.id] || 0;
    const completedItems = completedItemsByCourse[course.id] || 0;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    if (progressPercentage > 0) {
      totalProgressPercentage += progressPercentage;
      coursesWithProgress += 1;
    }
    
    return { ...course, totalItems, completedItems, progressPercentage };
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login failed. Check credentials or create an account in Firebase Console.");
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card p-8 rounded-2xl border border-border w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-center text-primary mb-8">HivePod Login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-linear-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-4">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Determine user's first name for greeting
  const firstName = user.email ? user.email.split('@')[0].replace(/[^a-zA-Z]/g, '') : "Student";
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="flex flex-col flex-1 bg-background">
      <main className="flex-1 p-4 md:p-8">
        {/* Welcome Section */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {capitalizedName}, welcome! You're gonna love it here!
            </h2>
            <p className="text-gray-400">
              Your journey of a thousand miles begins with a single click.
            </p>
          </div>
          <div className="flex gap-4">
             {isAdmin && (
               <Link href="/admin">
                 <button className="bg-card border border-border px-4 py-2 rounded-lg text-sm hover:border-primary transition-colors">
                   Admin Panel
                 </button>
               </Link>
             )}
             <button onClick={() => signOut(auth)} className="bg-card border border-border px-4 py-2 rounded-lg text-sm hover:border-red-500 hover:text-red-500 transition-colors">
               Sign Out
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard 
            title="Enrolled" 
            value={courses.length.toString()} 
            subtext="Ready to start" 
            icon={BookOpen} 
            index={0}
          />
          <StatCard 
            title="Avg. Progress" 
            value={`${Math.round(totalProgressPercentage / Math.max(1, coursesWithProgress))}%`} 
            subtext="Across active courses" 
            icon={Target} 
            index={1}
          />
          <StatCard 
            title="Time Invested" 
            value={`${userStats.timeInvestedMinutes}m`} 
            subtext="Across all courses" 
            icon={Clock} 
            index={2}
          />
          <StatCard 
            title="Current Streak" 
            value={`${userStats.currentStreak}d`} 
            subtext="Learn today" 
            icon={Zap} 
            index={3}
          />
        </div>

        {/* Continue Learning Section */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">Continue learning</h3>
          <p className="text-sm text-gray-400 mb-6">Pick up where you left off — showing your {courses.length} recent courses</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesWithCalculations.map((course, index) => {
              return (
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
            )})}
            {courses.length === 0 && (
              <div className="col-span-full p-8 border border-dashed border-border rounded-xl text-center text-gray-500">
                You aren't enrolled in any courses yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">Recent activity</h3>
              <p className="text-sm text-gray-400">Last 2 events</p>
            </div>
            <LineChart className="text-gray-500" size={20} />
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border hover:bg-[#1a1a1c] transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center relative shrink-0">
                  <FileCheck size={18} className="text-gray-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-card"></div>
                </div>
                <span className="text-sm font-medium text-gray-200">Started assessment: CCNA Topic ...</span>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 hover:bg-[#1a1a1c] transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center relative shrink-0">
                  <UserCircle size={18} className="text-gray-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-card"></div>
                </div>
                <span className="text-sm font-medium text-gray-200">Updated profile</span>
              </div>
              <span className="text-xs text-gray-500">4 days ago</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-500 border-t border-border mt-8">
        © 2026 HivePod. All rights reserved.
      </footer>
    </div>
  );
}
