import { BookOpen } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ 
  title = "No Courses Yet", 
  description = "You aren't enrolled in any courses at the moment. When you join a course, it will appear here." 
}: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/5 bg-background/30 backdrop-blur-md">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        <BookOpen size={32} className="text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-8">{description}</p>
      
      <Link href="/">
        <button className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          Browse Catalog
        </button>
      </Link>
    </div>
  );
}
