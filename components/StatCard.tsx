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
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-card rounded-2xl p-6 border border-border flex flex-col justify-between hover:border-gray-600 transition-colors shadow-lg"
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        <Icon size={16} className="text-gray-500" />
      </div>
      <div>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-gray-500">{subtext}</div>
      </div>
    </motion.div>
  );
}
