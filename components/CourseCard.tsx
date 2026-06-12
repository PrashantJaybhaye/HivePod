import Link from "next/link";
import { BookOpen, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
  const statusColor = progressPercentage === 0 ? "text-blue-400 bg-blue-500/10" : progressPercentage === 100 ? "text-green-400 bg-green-500/10" : "text-yellow-400 bg-yellow-500/10";
  const statusDot = progressPercentage === 0 ? "bg-blue-400" : progressPercentage === 100 ? "bg-green-400" : "bg-yellow-400";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-card rounded-2xl p-6 border border-border hover:border-gray-600 transition-colors flex flex-col h-full group relative overflow-hidden shadow-lg"
    >
      {/* Subtle top gradient glow effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 w-fit ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
          {statusLabel}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
        {title}
      </h3>
      
      <div className="space-y-2 mb-8 flex-1">
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <BookOpen size={14} /> {description}
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar size={14} /> Valid indefinitely
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-foreground leading-none">{progressPercentage}</span>
          <span className="text-xl text-gray-400 font-medium mb-1">%</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">{completedItems} of {totalItems || 0} items completed</p>
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-linear-to-r from-primary to-secondary h-full"
          ></motion.div>
        </div>
      </div>

      <Link href={`/course/${id}`}>
        <div className="w-full bg-linear-to-r from-[#1f1616] to-[#241310] border border-primary/20 hover:border-primary/50 transition-colors rounded-xl p-4 flex items-center gap-4 cursor-pointer mb-4">
          <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Begin to start tracking</h4>
            <p className="text-xs text-gray-400">Time spent, engagement, and streak will show up here</p>
          </div>
        </div>
      </Link>

      <div className="flex gap-3 mt-auto pt-2">
        <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          My batch
        </button>
        <Link href={`/course/${id}`} className="flex-1">
          <button className="w-full bg-white hover:bg-gray-100 text-black py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            Start
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
