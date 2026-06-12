"use client";

import { useAuth } from "@/components/AuthProvider";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    };
    fetchCourses();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Login failed. Check credentials or create an account in Firebase Console.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">HivePod</h1>
        
        {user ? (
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400">{user.email}</span>
            {isAdmin && (
              <Link href="/admin" className="text-primary hover:underline">
                Admin Panel
              </Link>
            )}
            <button onClick={() => signOut(auth)} className="text-sm border border-border px-3 py-1 rounded hover:bg-border transition">
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-background border border-border rounded px-2 text-sm text-foreground"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-background border border-border rounded px-2 text-sm text-foreground"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-primary text-white text-sm px-3 py-1 rounded hover:bg-primary-hover">
              Login
            </button>
          </form>
        )}
      </header>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8 text-foreground">Available Courses</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link href={`/course/${course.id}`} key={course.id}>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                <p className="text-gray-400 line-clamp-3">{course.description}</p>
              </div>
            </Link>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p>No courses available right now.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
