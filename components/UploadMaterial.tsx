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
    <div className="bg-[#1c1c1e]/30 border border-white/5 p-6 rounded-2xl">
      <h3 className="text-sm font-semibold text-[#86868b] capitalizetracking-wider mb-4">Upload Material</h3>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#86868b] mb-1.5 capitalizetracking-wider">Title</label>
          <input
            type="text"
            required
            className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Session 1 Slides"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/3">
            <label className="block text-[10px] font-semibold text-[#86868b] mb-1.5 capitalizetracking-wider">Type</label>
            <select
              className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer transition-colors"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="audio" className="bg-[#1c1c1e] text-white">Audio Track</option>
              <option value="pdf" className="bg-[#1c1c1e] text-white">PDF Lecture</option>
              <option value="image" className="bg-[#1c1c1e] text-white">Image Asset</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-[#86868b] mb-1.5 capitalizetracking-wider">File</label>
            <input
              type="file"
              required
              className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept={type === "audio" ? "audio/*" : type === "pdf" ? ".pdf" : "image/*"}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#86868b] font-medium">Uploading:</span>
              <span className="text-xs font-semibold text-white">{progress}%</span>
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="ml-auto bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Material"}
          </button>
        </div>
      </form>
    </div>
  );
}
