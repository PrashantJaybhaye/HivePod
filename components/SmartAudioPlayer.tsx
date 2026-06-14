"use client";

import { useEffect, useRef, useState } from "react";
import { markMaterialCompleted, addTimeInvested } from "@/lib/tracking";
import { useAuth } from "@/components/AuthProvider";

interface SmartAudioPlayerProps {
  url: string;
  userId: string;
  materialId: string;
  courseId: string;
}

export default function SmartAudioPlayer({ url, userId, materialId, courseId }: SmartAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playStartTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef(0);
  const { isAdmin } = useAuth();

  // Function to commit tracked time to Firebase
  const commitTimeInvested = async () => {
    let currentSessionSeconds = 0;
    if (isPlaying && playStartTimeRef.current) {
      currentSessionSeconds = (Date.now() - playStartTimeRef.current) / 1000;
      playStartTimeRef.current = Date.now(); // reset start time for next chunk
    }
    
    const totalSeconds = accumulatedSecondsRef.current + currentSessionSeconds;
    const minutesToLog = Math.floor(totalSeconds / 60);

    if (minutesToLog > 0) {
      await addTimeInvested(userId, minutesToLog);
      accumulatedSecondsRef.current = totalSeconds % 60; // Keep the remainder
    } else {
      accumulatedSecondsRef.current = totalSeconds;
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    playStartTimeRef.current = Date.now();
  };

  const handlePause = () => {
    setIsPlaying(false);
    commitTimeInvested(); // Save time when paused
  };

  const handleEnded = async () => {
    setIsPlaying(false);
    await commitTimeInvested();
    await markMaterialCompleted(userId, materialId, courseId);
  };

  // Commit time when unmounting or leaving page
  useEffect(() => {
    return () => {
      commitTimeInvested();
    };
  }, [isPlaying]);

  return (
    <audio 
      ref={audioRef}
      controls 
      controlsList={isAdmin ? undefined : "nodownload"}
      onContextMenu={(e) => !isAdmin && e.preventDefault()}
      src={url} 
      className="w-full outline-none" 
      autoPlay={false}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
    />
  );
}
