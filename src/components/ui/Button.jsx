// Reusable Button component with variants
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30",
  secondary:
    "glass glass-hover text-white",
  ghost:
    "bg-transparent hover:bg-white/[0.06] text-gray-400 hover:text-white",
  outline:
    "bg-transparent border border-white/10 hover:border-white/20 text-gray-400 hover:text-white",
  danger:
    "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-sm rounded-xl gap-2",
  xl: "px-8 py-4 text-base rounded-2xl gap-2.5",
  icon: "w-10 h-10 rounded-xl",
  "icon-sm": "w-8 h-8 rounded-lg",
  "icon-lg": "w-12 h-12 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
