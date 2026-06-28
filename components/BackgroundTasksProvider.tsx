"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { getPresignedUrl } from "@/app/actions/upload";
import { transcribeAudio } from "@/app/actions/transcribe";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Task {
  id: string;
  title: string;
  progress: number;
  statusText: string;
  isComplete: boolean;
  isError: boolean;
  docId?: string;
  publicUrl?: string;
  type?: "audio" | "pdf" | "image";
  transcriptionState: "idle" | "queued" | "processing" | "done" | "error";
}

interface BackgroundTasksContextType {
  tasks: Task[];
  enqueueUpload: (file: File, courseId: string, folderId: string, type: "audio" | "pdf" | "image", title: string) => void;
  removeTask: (id: string) => void;
}

const BackgroundTasksContext = createContext<BackgroundTasksContextType | undefined>(undefined);

export function BackgroundTasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const isProcessingRef = useRef(false);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Transcription Queue Worker
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingRef.current) return;
      
      const nextTask = tasks.find(t => t.transcriptionState === "queued" && !t.isComplete && !t.isError);
      if (!nextTask || !nextTask.docId || !nextTask.publicUrl) return;

      isProcessingRef.current = true;
      updateTask(nextTask.id, { 
        transcriptionState: "processing",
        statusText: "Transcribing audio (this may take a minute)..." 
      });

      try {
        const transcript = await transcribeAudio(nextTask.publicUrl);
        await updateDoc(doc(db, "materials", nextTask.docId), { transcript });
        
        updateTask(nextTask.id, { 
          transcriptionState: "done",
          statusText: "Complete!", 
          isComplete: true 
        });
      } catch (transcriptionError: any) {
        console.error("Transcription Server Action failed:", transcriptionError);
        updateTask(nextTask.id, { 
          transcriptionState: "error",
          statusText: "Transcription failed, but file uploaded.", 
          isComplete: true,
          isError: true
        });
      } finally {
        isProcessingRef.current = false;
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          removeTask(nextTask.id);
        }, 8000);
      }
    };

    processQueue();
  }, [tasks, updateTask, removeTask]);

  const enqueueUpload = useCallback(async (file: File, courseId: string, folderId: string, type: "audio" | "pdf" | "image", title: string) => {
    const taskId = crypto.randomUUID();
    
    setTasks(prev => [...prev, {
      id: taskId,
      title: title || file.name,
      progress: 0,
      statusText: "Initializing...",
      isComplete: false,
      isError: false,
      transcriptionState: "idle"
    }]);

    try {
      // 1. Get Presigned URL
      let signedUrl: string;
      let publicUrl: string;
      try {
        const res = await getPresignedUrl(courseId, folderId, file.name, file.type);
        signedUrl = res.signedUrl;
        publicUrl = res.publicUrl;
      } catch (err: any) {
        console.error("Error in getPresignedUrl Server Action:", err);
        throw new Error(`Failed to get presigned URL: ${err.message}`);
      }
      
      updateTask(taskId, { statusText: "Uploading file..." });

      // 2. Upload file to R2 via XMLHttpRequest to track real progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            updateTask(taskId, { progress: percentage });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Failed to upload to storage"));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      // 3. Save to Firestore
      updateTask(taskId, { statusText: "Saving to database...", progress: 100 });

      const docRef = await addDoc(collection(db, "materials"), {
        folderId,
        courseId,
        title: title || file.name,
        type,
        url: publicUrl,
        transcript: null,
        createdAt: serverTimestamp(),
      });

      // 4. Queue Transcription if Audio
      if (type === "audio") {
        updateTask(taskId, { 
          docId: docRef.id, 
          publicUrl: publicUrl,
          type: type,
          statusText: "Waiting in transcription queue...",
          transcriptionState: "queued" 
        });
      } else {
        updateTask(taskId, { statusText: "Complete!", isComplete: true });
        // Auto-remove after 8 seconds
        setTimeout(() => {
          removeTask(taskId);
        }, 8000);
      }

    } catch (error: any) {
      console.error("Upload process error:", error);
      updateTask(taskId, { statusText: error.message || "Error uploading", isError: true, isComplete: true });
    }
  }, [updateTask, removeTask]);

  return (
    <BackgroundTasksContext.Provider value={{ tasks, enqueueUpload, removeTask }}>
      {children}
    </BackgroundTasksContext.Provider>
  );
}

export function useBackgroundTasks() {
  const context = useContext(BackgroundTasksContext);
  if (context === undefined) {
    throw new Error("useBackgroundTasks must be used within a BackgroundTasksProvider");
  }
  return context;
}
