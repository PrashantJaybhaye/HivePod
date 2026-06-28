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

  // Robust Shaka Player integration for chunked fetching and retry
  useEffect(() => {
    let player: any = null;
    let isMounted = true;

    const initShaka = async () => {
      // Import shaka dynamically to avoid SSR window errors
      const shakaModule = await import("shaka-player");
      const shaka: any = shakaModule.default || shakaModule;
      
      shaka.polyfill.installAll();

      if (shaka.Player.isBrowserSupported() && audioRef.current) {
        // shaka.Player takes the audio element reference
        player = new shaka.Player(audioRef.current);
        
        // Configure extreme robustness similar to YouTube
        player.configure({
          streaming: {
            retryParameters: {
              maxAttempts: 10,
              baseDelay: 1000,
              backoffFactor: 2,
              fuzzFactor: 0.5,
              timeout: 0,
            }
          }
        });

        player.addEventListener("error", (event: any) => {
          console.error("Shaka Player Error:", event.detail);
        });

        try {
          // Tell Shaka to fetch and chunk the URL
          await player.load(url);
          if (isMounted) {
            console.log("Shaka Player: Chunked loading active");
          }
        } catch (e) {
          console.error("Failed to load audio via Shaka:", e);
        }
      }
    };

    initShaka();

    return () => {
      isMounted = false;
      if (player) {
        player.destroy();
      }
    };
  }, [url]);

  return (
    <audio 
      ref={audioRef}
      controls 
      controlsList={isAdmin ? undefined : "nodownload"}
      onContextMenu={(e) => !isAdmin && e.preventDefault()}
      className="w-full outline-none" 
      autoPlay={false}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
    />
  );
}
