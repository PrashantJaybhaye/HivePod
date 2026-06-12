"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          // Build metadata from Firebase Auth profile
          const providerData = currentUser.providerData[0];
          const metadata = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || null,
            photoURL: currentUser.photoURL || null,
            phoneNumber: currentUser.phoneNumber || null,
            provider: providerData?.providerId || "unknown",
            lastLoginAt: serverTimestamp(),
          };
          
          if (userSnap.exists()) {
            // Existing user — update metadata, preserve isAdmin & other fields
            setIsAdmin(userSnap.data().isAdmin === true);
            await setDoc(userRef, metadata, { merge: true });
          } else {
            // New user — create full document
            await setDoc(userRef, {
              ...metadata,
              isAdmin: false,
              createdAt: serverTimestamp(),
            });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error syncing user data:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
