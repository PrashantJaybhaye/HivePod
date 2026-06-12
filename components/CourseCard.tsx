import Link from "next/link";
import { BookOpen, Clock, BarChart } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  index?: number;
  progressPercentage?: number;
  completedItems?: number;
  totalItems?: number;
}

export default function CourseCard({
  id, title, description, index = 0,
  progressPercentage = 0, completedItems = 0, totalItems = 0
}: CourseCardProps) {

  const statusLabel = progressPercentage === 0 ? "Not started" : progressPercentage === 100 ? "Completed" : "In progress";
  const statusColor = progressPercentage === 0 ? "text-blue-500 bg-blue-500/10" : progressPercentage === 100 ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10";
  const statusDot = progressPercentage === 0 ? "bg-blue-500" : progressPercentage === 100 ? "bg-green-500" : "bg-yellow-500";

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-4 sm:p-5 border border-white/10 flex flex-col h-full hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 group">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-2 w-fit ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
          {statusLabel}
        </span>
        
        {/* Level Indicator Placeholder */}
        <span className="text-xs text-gray-500 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
          <BarChart size={12} /> Beginner
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2 line-clamp-2">
        {title}
      </h3>
      
      <p className="text-xs sm:text-sm text-gray-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
        {description || "No description available for this course. Start learning today!"}
      </p>

      {/* Meta info row */}
      <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-400 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-gray-500" />
          <span>{totalItems} Lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-500" />
          <span>~{totalItems * 10} mins</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-white leading-none">{progressPercentage}%</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">{completedItems} / {totalItems || 0} items</span>
        </div>
        
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500 group-hover:bg-blue-400"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex mt-auto">
        <Link href={`/course/${id}`} className="w-full">
          <button className="w-full bg-white text-black hover:bg-gray-200 transition-colors py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
            {progressPercentage === 0 ? "Start Course" : progressPercentage === 100 ? "Review Course" : "Continue Learning"}
          </button>
        </Link>
      </div>
    </div>
  );
}
