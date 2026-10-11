// Audio Visualizer — animated bars for voice mode
import { motion } from "framer-motion";

export default function AudioVisualizer({ isActive = false, barCount = 5, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-[3px] h-6 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-orange-400"
          animate={
            isActive
              ? {
                  height: [4, 12 + Math.random() * 12, 4],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            isActive
              ? {
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.08,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
