"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AuthUI } from "@/components/ui/auth-fuse";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth or if already logged in
  if (loading || user) {
    return null;
  }

  return <AuthUI />;
}
