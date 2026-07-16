"use client";

import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Edit Modes
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Firestore Data
  const [firestoreData, setFirestoreData] = useState<{
    bio?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    provider?: string;
    createdAt?: any;
    isAdmin?: boolean;
    photoURL?: string;
  }>({});

  useEffect(() => {
    if (user) {
      setNewName(user.displayName || "");
      setNewEmail(user.email || "");

      // Fetch extra fields from Firestore
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFirestoreData(data);
          setNewBio(data.bio || "");
          setNewPhone(data.phoneNumber || user.phoneNumber || "");
        }
      });
    }
  }, [user]);

  const displayName = firestoreData.displayName?.split(" ")[0] || user?.displayName?.split(" ")[0] || "User";
  const fullDisplayName = firestoreData.displayName || user?.displayName || "Add a name";
  const email = firestoreData.email || user?.email || "No email";
  const isGoogleProvider = user?.providerData?.[0]?.providerId === "google.com";
  const photoURL = firestoreData.photoURL || user?.photoURL;

  const getInitials = (name: string) => {
    if (!name || name === "User") return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 1);
  };

  const handleUpdate = async (field: string) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      if (field === "name") {
        await updateProfile(user, { displayName: newName });
        await updateDoc(doc(db, "users", user.uid), { displayName: newName });
      } else if (field === "email") {
        await updateEmail(user, newEmail);
        await updateDoc(doc(db, "users", user.uid), { email: newEmail });
      } else if (field === "password") {
        await updatePassword(user, newPassword);
        setNewPassword(""); // clear after setting
      } else if (field === "bio") {
        await updateDoc(doc(db, "users", user.uid), { bio: newBio });
        setFirestoreData(prev => ({ ...prev, bio: newBio }));
      } else if (field === "phone") {
        await updateDoc(doc(db, "users", user.uid), { phoneNumber: newPhone });
        setFirestoreData(prev => ({ ...prev, phoneNumber: newPhone }));
      }

      setEditingField(null);
      if (field === "name" || field === "email") {
        window.location.reload();
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in before updating sensitive information.");
      } else {
        alert(error.message || "Failed to update.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const renderRow = (
    fieldId: string,
    title: string,
    value: string,
    actionText: string | null,
    inputType: "text" | "email" | "password" | "textarea",
    stateValue: string,
    setStateValue: (val: string) => void
  ) => {
    const isEditing = editingField === fieldId;

    if (isEditing) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4">
          <div className="space-y-1.5 w-full">
            <p className="text-xs font-semibold tracking-wide text-white">{title}</p>
            {inputType === "textarea" ? (
              <textarea
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full max-w-[320px] bg-white/10 text-white text-xs px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-white/30 resize-none min-h-[80px]"
                autoFocus
              />
            ) : (
              <input
                type={inputType}
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
                placeholder={`Enter new ${title.toLowerCase()}`}
                className="w-full max-w-[260px] bg-white/10 text-white text-xs px-3 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-white/30"
                autoFocus
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 sm:mt-6 shrink-0">
            <button onClick={() => setEditingField(null)} className="text-xs font-bold text-white/60 hover:text-white">Cancel</button>
            <button onClick={() => handleUpdate(fieldId)} disabled={isUpdating} className="text-xs font-bold text-[#ff453a] hover:underline">
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start sm:items-center justify-between py-5 gap-4 group">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold tracking-wide text-white">{title}</p>
          <p className="text-xs text-white/60 wrap-break-words whitespace-pre-wrap max-w-sm">
            {inputType === "password" ? "••••••••" : value}
          </p>
        </div>
        {actionText && (
          <button
            onClick={() => setEditingField(fieldId)}
            className="text-xs font-bold text-white hover:underline whitespace-nowrap mt-0.5 sm:mt-0 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  };

  const memberSince = firestoreData.createdAt
    ? new Date(firestoreData.createdAt.toDate?.() || firestoreData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <main className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 py-8 lg:py-12 max-w-7xl mx-auto w-full space-y-12 md:space-y-16 pb-20">



        {/* Profile Header */}
        <div className="flex items-center gap-6 pb-8 border-b border-white/10">
          <div className="w-[84px] h-[84px] rounded-full bg-linear-to-tr from-[#ff453a] to-[#ff9f0a] flex items-center justify-center text-white text-[32px] font-medium tracking-tight shadow-md overflow-hidden shrink-0">
            {photoURL ? (
              <img src={photoURL} referrerPolicy="no-referrer" alt={displayName} className="w-full h-full object-cover" />
            ) : (
              getInitials(fullDisplayName)
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">{displayName}</h1>
            <p className="text-white/60 text-[15px]">{email}</p>
          </div>
        </div>

        {/* Personal details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-2">
          <div className="md:col-span-1">
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">Personal details</h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Update your public profile information and how we can reach you.</p>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <div className="h-px w-full bg-white/10 hidden md:block" />
            {renderRow("name", "Name", fullDisplayName, "Edit", "text", newName, setNewName)}
            <div className="h-px w-full bg-white/10" />
            {renderRow("bio", "Bio", firestoreData.bio || "No bio added", "Edit", "textarea", newBio, setNewBio)}
            <div className="h-px w-full bg-white/10" />
            {renderRow("email", "Email address", email, null, "email", newEmail, setNewEmail)}
            <div className="h-px w-full bg-white/10" />
            {renderRow("phone", "Phone number", firestoreData.phoneNumber || "Not added", "Edit", "text", newPhone, setNewPhone)}
            <div className="h-px w-full bg-white/10 hidden md:block" />
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-2">
          <div className="md:col-span-1">
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">Account details</h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Manage your login methods, password, and view your account history.</p>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <div className="h-px w-full bg-white/10 hidden md:block" />

            {renderRow("provider", "Sign-in method", firestoreData.provider === "google.com" ? "Google Account" : "Email & Password", null, "text", "", () => { })}

            <div className="h-px w-full bg-white/10" />
            {renderRow("joined", "Member since", memberSince, null, "text", "", () => { })}
            {!isGoogleProvider && (
              <>
                <div className="h-px w-full bg-white/10" />
                {renderRow("password", "Password", "", "Change", "password", newPassword, setNewPassword)}
              </>
            )}
            <div className="h-px w-full bg-white/10 hidden md:block" />
          </div>
        </div>

        {/* Manage account */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-2">
          <div className="md:col-span-1">
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">Manage account</h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Permanently remove your account and all associated data.</p>
          </div>
          <div className="md:col-span-2 flex flex-col">
            <div className="h-px w-full bg-white/10 hidden md:block" />
            <div className="flex items-center justify-between py-5">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold tracking-wide text-white">Delete account</p>
                <p className="text-xs text-white/60">Permanently delete your account.</p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs font-bold text-[#ff453a] hover:underline"
              >
                Delete
              </button>
            </div>
            <div className="h-px w-full bg-white/10 hidden md:block" />
          </div>
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[18px] p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
            <p className="text-[14px] text-white/60 mb-6 leading-relaxed">
              Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-full text-[14px] font-bold text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Account deleted.");
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 rounded-full text-[14px] font-bold bg-[#ff453a] text-white hover:bg-[#ff453a]/90 transition-colors"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
