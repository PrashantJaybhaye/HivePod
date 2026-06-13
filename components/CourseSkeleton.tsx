export default function CourseSkeleton() {
  return (
    <div className="relative flex flex-col h-full rounded-2xl border border-white/6 bg-neutral-900/40 p-5 overflow-hidden min-h-[360px]">
      {/* Card Header Shimmer */}
      <div className="flex flex-row justify-between items-center pb-3.5 relative z-10">
        <div className="h-5 w-24 rounded-full shimmer-bg"></div>
        <div className="h-5 w-16 rounded-full shimmer-bg"></div>
      </div>

      {/* Card Content Shimmer */}
      <div className="flex-1 flex flex-col pt-1 pb-0 relative z-10">
        {/* Title */}
        <div className="h-6 w-4/5 rounded-md shimmer-bg mb-3"></div>

        {/* Description */}
        <div className="space-y-2 mb-4 flex-1 mt-1">
          <div className="h-3.5 w-full rounded-md shimmer-bg"></div>
          <div className="h-3.5 w-5/6 rounded-md shimmer-bg"></div>
        </div>

        {/* Badges Shimmer */}
        <div className="flex gap-2 mb-4.5">
          <div className="h-6 w-16 rounded-full shimmer-bg"></div>
          <div className="h-6 w-14 rounded-full shimmer-bg"></div>
        </div>

        {/* Spec Sheet Row Shimmer */}
        <div className="flex items-center gap-2.5 mb-4 pt-3.5 border-t border-white/5 mt-auto">
          <div className="h-3 w-14 rounded shimmer-bg"></div>
          <div className="w-1 h-1 rounded-full bg-white/10"></div>
          <div className="h-3 w-10 rounded shimmer-bg"></div>
          <div className="w-1 h-1 rounded-full bg-white/10"></div>
          <div className="h-3 w-16 rounded shimmer-bg"></div>
        </div>

        {/* Progress Shimmer */}
        <div className="mb-5.5">
          <div className="flex justify-between items-center mb-1.5">
            <div className="h-3 w-12 rounded shimmer-bg"></div>
            <div className="h-3 w-8 rounded shimmer-bg"></div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full shimmer-bg"></div>
        </div>
      </div>

      {/* Action Button Shimmer */}
      <div className="pt-2 pb-5 border-0 bg-transparent mt-auto relative z-10">
        <div className="w-full h-10 rounded-xl shimmer-bg"></div>
      </div>
    </div>
  );
}
