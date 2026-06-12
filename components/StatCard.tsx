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
      className="bg-[#0a0a0a]/50 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-white/5 flex flex-col justify-between hover:bg-[#0a0a0a]/80 transition-colors"
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        <Icon size={16} className="text-gray-500" />
      </div>
      <div>
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-1">{value}</div>
        <div className="text-xs md:text-sm text-gray-500 font-medium">{subtext}</div>
      </div>
    </motion.div>
  );
}
