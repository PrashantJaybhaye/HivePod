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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white/1.5 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/3 active:scale-[0.99] cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.15),0_12px_38px_rgba(0,0,0,0.35)]"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] md:text-xs font-semibold tracking-wider text-white/40 uppercase">
          {title}
        </span>
        <div className="p-1.5 rounded-lg bg-white/3 border border-white/6 text-white/50">
          <Icon size={14} className="stroke-2" />
        </div>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5">{value}</div>
        <div className="text-[11px] md:text-xs text-white/50 font-normal">{subtext}</div>
      </div>
    </motion.div>
  );
}
