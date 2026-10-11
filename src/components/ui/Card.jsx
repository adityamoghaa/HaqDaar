// Glassmorphic Card component
import { motion } from "framer-motion";

const variants = {
  default: "glass",
  elevated: "glass-strong",
  interactive: "glass glass-hover cursor-pointer",
  colored: "",
};

export default function Card({
  children,
  variant = "default",
  className = "",
  animate = true,
  onClick,
  ...props
}) {
  const Component = animate ? motion.div : "div";
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`rounded-xl p-4 ${variants[variant]} ${className}`}
      {...animateProps}
      {...props}
    >
      {children}
    </Component>
  );
}
