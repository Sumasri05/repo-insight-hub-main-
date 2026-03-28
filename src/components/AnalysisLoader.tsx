import { motion } from "framer-motion";

const steps = [
  "Fetching repository metadata...",
  "Analyzing codebase structure...",
  "Scanning for technologies...",
  "Evaluating documentation quality...",
  "Computing community health...",
  "Running AI analysis...",
  "Generating recommendations...",
];

export default function AnalysisLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Animated orb */}
      <div className="relative">
        <motion.div
          className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent opacity-20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-accent opacity-40"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-primary to-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Cycling step labels */}
      <div className="h-6 overflow-hidden">
        <motion.div
          animate={{ y: [0, -steps.length * 24] }}
          transition={{ duration: steps.length * 2.5, repeat: Infinity, ease: "linear" }}
        >
          {[...steps, ...steps].map((step, i) => (
            <div key={i} className="h-6 flex items-center text-sm text-muted-foreground">
              {step}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
