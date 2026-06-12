import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  index?: number;
}

export default function StatCard({ title, value, subtext, icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-[#0a0a0a]/50 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:bg-[#0a0a0a]/80 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        <Icon size={14} className="text-gray-500" />
      </div>
      <div>
        <div className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5">{value}</div>
        <div className="text-[11px] md:text-xs text-gray-500 font-medium">{subtext}</div>
      </div>
    </motion.div>
  );
}
