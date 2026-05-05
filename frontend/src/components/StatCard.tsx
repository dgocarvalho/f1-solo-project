import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  variant?: "default" | "red" | "green";
}

const StatCard = ({ title, value, icon: Icon, description, variant = "default" }: StatCardProps) => {
  const borderClass =
    variant === "red"
      ? "f1-border-glow"
      : variant === "green"
      ? "border-f1-green/30"
      : "border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${borderClass} bg-card p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-md p-2 ${variant === "red" ? "f1-gradient-red" : variant === "green" ? "f1-gradient-green" : "bg-secondary"}`}>
            <Icon className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
