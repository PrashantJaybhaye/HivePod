export default function CourseSkeleton() {
  return (
    <div className="bg-background rounded-xl p-4 sm:p-5 border border-white/10 flex flex-col h-full animate-pulse">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="h-6 w-20 bg-white/5 rounded-md"></div>
        <div className="h-6 w-16 bg-white/5 rounded-md"></div>
      </div>

      {/* Title */}
      <div className="h-6 w-3/4 bg-white/5 rounded-md mb-2"></div>
      
      {/* Description */}
      <div className="space-y-2 mb-4 flex-1 mt-2">
        <div className="h-3 w-5/6 bg-white/5 rounded-md"></div>
        <div className="h-3 w-2/3 bg-white/5 rounded-md"></div>
      </div>

      {/* Meta info row */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 border-b border-white/5">
        <div className="h-3 w-16 bg-white/5 rounded-md"></div>
        <div className="h-3 w-16 bg-white/5 rounded-md"></div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-end justify-between mb-2">
          <div className="h-5 w-10 bg-white/5 rounded-md"></div>
          <div className="h-3 w-16 bg-white/5 rounded-md"></div>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full"></div>
      </div>

      {/* Action Button */}
      <div className="flex mt-auto">
        <div className="w-full h-10 bg-white/5 rounded-lg"></div>
      </div>
    </div>
  );
}
