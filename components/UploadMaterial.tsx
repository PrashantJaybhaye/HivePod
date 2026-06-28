"use client";

import { useState, useRef } from "react";
import { useBackgroundTasks } from "./BackgroundTasksProvider";

export default function UploadMaterial({ courseId, folderId }: { courseId: string, folderId: string }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [type, setType] = useState<"audio" | "pdf" | "image">("audio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueUpload } = useBackgroundTasks();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Fire and forget into the global queue
      enqueueUpload(file, courseId, folderId, type, file.name.split('.').slice(0, -1).join('.'));
    }

    // Instantly reset the form
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[#1c1c1e]/30 border border-white/5 p-6 rounded-2xl">
      <h3 className="text-sm font-semibold text-[#86868b] capitalizetracking-wider mb-4">Upload Material</h3>

      <form onSubmit={handleUpload} className="space-y-4">

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
            <label className="block text-[10px] font-semibold text-[#86868b] mb-1.5 capitalizetracking-wider">File(s)</label>
            <input
              ref={fileInputRef}
              type="file"
              required
              multiple
              className="w-full bg-[#2c2c2e]/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
              onChange={(e) => setFiles(e.target.files)}
              accept={type === "audio" ? "audio/*" : type === "pdf" ? ".pdf" : "image/*"}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {files && files.length > 0 && (
             <span className="text-xs text-[#86868b] font-medium">{files.length} file(s) selected</span>
          )}
          <button
            type="submit"
            disabled={!files || files.length === 0}
            className="ml-auto bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            Add to Upload Queue
          </button>
        </div>
      </form>
    </div>
  );
}
