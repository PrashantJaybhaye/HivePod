"use client";

import { useState } from "react";
import { getPresignedUrl } from "@/app/actions/upload";
import { transcribeAudio } from "@/app/actions/transcribe";
import { collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UploadMaterial({ courseId, folderId }: { courseId: string, folderId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"audio" | "pdf" | "image">("audio");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setProgress(10);
    try {
      // 1. Get Presigned URL
      const { signedUrl, publicUrl } = await getPresignedUrl(courseId, folderId, file.name, file.type);
      setProgress(30);

      // 2. Upload file to Cloudflare R2
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to R2");
      setProgress(80);

      // 3. Save to Firestore
      const docRef = await addDoc(collection(db, "materials"), {
        folderId,
        courseId,
        title,
        type,
        url: publicUrl,
        transcript: null, // Will be filled by Deepgram if audio
        createdAt: serverTimestamp(),
      });
      setProgress(100);
      
      // Reset form visually
      setFile(null);
      setTitle("");
      setTimeout(() => setProgress(0), 2000);
      
      // 4. Trigger Deepgram transcription for Audio files
      if (type === "audio") {
        try {
          const transcript = await transcribeAudio(publicUrl);
          await updateDoc(docRef, { transcript });
        } catch (transcriptionError) {
          console.error("Transcription failed:", transcriptionError);
        }
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg mb-8">
      <h3 className="text-lg font-bold mb-4 text-primary">Upload Material</h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-foreground">Title</label>
          <input 
            type="text" 
            required
            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture 1"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1 text-foreground">Type</label>
            <select 
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="audio">Audio</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div className="flex-2">
            <label className="block text-sm mb-1 text-foreground">File</label>
            <input 
              type="file" 
              required
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-foreground"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept={type === "audio" ? "audio/*" : type === "pdf" ? ".pdf" : "image/*"}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={uploading || !file}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover disabled:opacity-50"
        >
          {uploading ? `Uploading... ${progress}%` : "Upload"}
        </button>
      </form>
    </div>
  );
}
