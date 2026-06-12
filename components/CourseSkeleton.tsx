import { motion } from "framer-motion";

export default function CourseSkeleton() {
  return (
    <div className="bg-[#0a0a0a]/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col h-[400px] relative overflow-hidden animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-24 bg-white/5 rounded-full"></div>
      </div>
      
      <div className="h-6 w-3/4 bg-white/5 rounded-md mb-2"></div>
      <div className="h-6 w-1/2 bg-white/5 rounded-md mb-8"></div>
      
      <div className="space-y-2 mb-8 flex-1 mt-1">
        <div className="h-4 w-5/6 bg-white/5 rounded-md"></div>
        <div className="h-4 w-2/3 bg-white/5 rounded-md"></div>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1 mb-2">
          <div className="h-10 w-16 bg-white/5 rounded-md"></div>
          <div className="h-6 w-6 bg-white/5 rounded-md mb-1"></div>
        </div>
        <div className="h-3 w-1/2 bg-white/5 rounded-md mb-3"></div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4"></div>

        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="h-3 w-16 bg-white/5 rounded-md"></div>
          <div className="h-3 w-16 bg-white/5 rounded-md"></div>
          <div className="h-3 w-16 bg-white/5 rounded-md"></div>
        </div>
      </div>

      <div className="w-full bg-white/5 rounded-xl h-20 mb-4"></div>

      <div className="flex gap-3 mt-auto pt-2">
        <div className="flex-1 h-10 bg-white/5 rounded-xl"></div>
        <div className="flex-1 h-10 bg-white/5 rounded-xl"></div>
      </div>
    </div>
  );
}
