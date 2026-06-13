"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-primary">Loading Admin Panel...</div>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-20 pt-4 lg:pt-8 pb-6 md:pb-10 max-w-7xl mx-auto w-full">
      {children}
    </div>
  );
}
