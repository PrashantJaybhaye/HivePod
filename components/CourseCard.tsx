"use client";

import Link from "next/link";
import { BookOpen, Clock, BarChart2, ArrowRight, Play, CheckCircle2, Headphones, FileText, Zap, Award, Globe, RotateCw, Volume2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getTimeAgo } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  index?: number;
  progressPercentage?: number;
  completedItems?: number;
  totalItems?: number;
  category?: string;
  instructor?: string;
  difficulty?: string;
  rating?: number;
  reviewsCount?: number;
  audioTracks?: number;
  resourcesCount?: number;
  xpReward?: number;
  language?: string;
  updatedAtText?: string;
  audioDuration?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function CourseCard({
  id, title, description, index = 0,
  progressPercentage = 0, completedItems = 0, totalItems = 0,
  category,
  instructor,
  difficulty,
  rating,
  reviewsCount,
  audioTracks = 0,
  resourcesCount = 0,
  xpReward = 100,
  language = "English",
  updatedAtText,
  audioDuration = "",
  createdAt,
  updatedAt
}: CourseCardProps) {

  const isCompleted = progressPercentage === 100;
  const isNotStarted = progressPercentage === 0;

  const statusLabel = isNotStarted ? "Not started" : isCompleted ? "Completed" : "In progress";

  // iOS Widget style status colors
  const statusColor = isNotStarted
    ? "text-[#0a84ff] border border-[#0a84ff]/20 bg-[#0a84ff]/10"
    : isCompleted
      ? "text-[#30d158] border border-[#30d158]/20 bg-[#30d158]/10"
      : "text-[#ff9f0a] border border-[#ff9f0a]/20 bg-[#ff9f0a]/10";

  const statusDot = isNotStarted
    ? "bg-[#0a84ff]"
    : isCompleted
      ? "bg-[#30d158]"
      : "bg-[#ff9f0a]";

  const statusDotPulse = !isNotStarted && !isCompleted ? "animate-pulse" : "";

  // Dynamic fallbacks for missing db fields
  const derivedCategory = category || (() => {
    const lower = title.toLowerCase();
    if (lower.includes("ccna") || lower.includes("cisco") || lower.includes("network")) return "Networking";
    if (lower.includes("security") || lower.includes("comptia") || lower.includes("cyber")) return "Security";
    if (lower.includes("aws") || lower.includes("cloud") || lower.includes("azure")) return "Cloud Computing";
    return "IT & Tech";
  })();

  const derivedDifficulty = difficulty || "Beginner";

  const derivedInstructor = instructor || (() => {
    const lower = title.toLowerCase();
    if (lower.includes("ccna") || lower.includes("cisco")) return "Cisco Expert";
    if (lower.includes("security") || lower.includes("comptia")) return "Security Expert";
    if (lower.includes("aws")) return "Cloud Architect";
    return "HivePod Faculty Team";
  })();

  const derivedRating = rating || 4.8;
  const derivedReviewsCount = reviewsCount || 12;

  // Format total duration nicely
  const formatDuration = (lessonsCount: number) => {
    const minutes = lessonsCount * 15; // Assume average 15 mins per lesson/audio pod
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hrs`;
  };

  const durationText = formatDuration(totalItems);

  // iOS-style buttons
  const getButtonConfig = () => {
    if (isNotStarted) {
      return {
        className: "w-full bg-[#ff453a] hover:bg-[#ff453a]/90 text-white text-xs font-semibold py-2.5 rounded-xl active:scale-[0.97] transition-all duration-150 flex justify-center items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(255,69,58,0.2)]",
        icon: ArrowRight,
        text: "Start Course"
      };
    } else if (isCompleted) {
      return {
        className: "w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold py-2.5 rounded-xl active:scale-[0.97] transition-all duration-150 flex justify-center items-center gap-1.5 cursor-pointer",
        icon: CheckCircle2,
        text: "Review Course"
      };
    } else {
      return {
        className: "w-full bg-white/8 hover:bg-white/[0.12] border border-white/[0.08] text-white text-xs font-semibold py-2.5 rounded-xl active:scale-[0.97] transition-all duration-150 flex justify-center items-center gap-1.5 cursor-pointer",
        icon: Play,
        text: "Continue Learning"
      };
    }
  };

  const btnConfig = getButtonConfig();
  const BtnIcon = btnConfig.icon;

  let displayUpdatedAt = updatedAtText;
  if (updatedAt) {
    displayUpdatedAt = `Updated ${getTimeAgo(updatedAt)}`;
  } else if (createdAt) {
    displayUpdatedAt = `Updated ${getTimeAgo(createdAt)}`;
  } else if (!updatedAtText || updatedAtText === "Updated Today" || updatedAtText.startsWith("Updated ")) {
    displayUpdatedAt = "Updated just now";
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/1.5 bg-linear-to-b from-white/4 to-transparent backdrop-blur-[32px] flex flex-col h-full transition-all duration-300 active:scale-[0.98] active:bg-white/8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      {/* Liquid glass light reflection sheen */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/1 to-white/4 pointer-events-none" />

      {/* Top border catch-light effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-3 relative z-10">
        <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide flex items-center gap-1.5 w-fit ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot} ${statusDotPulse}`}></span>
          {statusLabel.toUpperCase()}
        </div>
        <span className="text-[10px] text-white/50 bg-white/4 border border-white/8 px-2.5 py-0.5 rounded-full font-medium tracking-wide">
          {derivedCategory}
        </span>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-1 pb-0 relative z-10">
        <CardTitle className="text-base font-bold text-white mb-2 tracking-tight line-clamp-2">
          {title}
        </CardTitle>

        <CardDescription className="text-xs text-white/60 mb-3 line-clamp-3 leading-relaxed font-normal">
          {description || "No description available for this course. Start learning today!"}
        </CardDescription>

        {/* Instructor & Active Students Row */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-white/45 mb-4 flex-wrap">
          <div className="flex items-center gap-1">
            by <span className="text-white/75 font-semibold">{derivedInstructor}</span>
          </div>
        </div>

        {/* iOS-Style Translucent Badges */}
        {(audioTracks > 0 || resourcesCount > 0 || xpReward > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4 mt-1">
            {audioTracks > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#5e5ce6]/10 text-[#7d7aff] border border-[#5e5ce6]/20 shadow-[0_2px_8px_rgba(94,92,230,0.05)]">
                <Headphones size={11} className="stroke-[2.5]" />
                <span>{audioTracks} Pods</span>
              </div>
            )}

            {resourcesCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#64d2ff]/10 text-[#64d2ff] border border-[#64d2ff]/20 shadow-[0_2px_8px_rgba(100,210,255,0.05)]">
                <FileText size={11} className="stroke-[2.5]" />
                <span>{resourcesCount} PDFs</span>
              </div>
            )}

            {xpReward > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20 shadow-[0_2px_8px_rgba(255,159,10,0.05)]">
                <Zap size={11} className="stroke-[2.5]" />
                <span>+{xpReward} XP</span>
              </div>
            )}
          </div>
        )}

        {/* iOS-Style Product Sheet Spec Row */}
        <div className="flex flex-col gap-1.5 mb-4 mt-auto pt-3.5 border-t border-white/6">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold tracking-wider text-white/55 uppercase">
            <span>{totalItems} {totalItems === 1 ? "MODULE" : "MODULES"}</span>
            <div className="w-px h-2.5 bg-white/15 shrink-0" />
            <span>{(audioDuration || durationText).toUpperCase()}</span>
            <div className="w-px h-2.5 bg-white/15 shrink-0" />
            <span>{derivedDifficulty.toUpperCase()}</span>
            <div className="w-px h-2.5 bg-white/15 shrink-0" />
            {language && (
              <>
                <span>{language.toUpperCase()}</span>
                <div className="w-px h-2.5 bg-white/15 shrink-0" />
              </>
            )}
          </div>
          {displayUpdatedAt && (
            <span className="text-[10px] text-white/35 font-normal tracking-normal normal-case">{displayUpdatedAt}</span>
          )}
        </div>

        {/* Progress tracking */}
        <div className="mb-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">Progress</span>
            <span className="text-[11px] text-white/70 font-semibold">
              {completedItems} of {totalItems} {totalItems === 1 ? "module" : "modules"} ({progressPercentage}%)
            </span>
          </div>
          <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#ff453a] to-[#ff9f0a] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-1 pb-5 px-6 border-0 bg-transparent mt-auto relative z-10">
        <Link href={`/course/${id}`} className="w-full">
          <button className={btnConfig.className}>
            {btnConfig.text}
            <BtnIcon size={14} />
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
