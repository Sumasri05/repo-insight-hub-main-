import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  max?: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreGauge({ score, max = 10, label, size = "md" }: ScoreGaugeProps) {
  const pct = (score / max) * 100;
  const radius = size === "lg" ? 54 : size === "md" ? 42 : 32;
  const stroke = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const dim = (radius + stroke) * 2;

  const color =
    score >= 7 ? "stroke-green-400" : score >= 5 ? "stroke-yellow-400" : "stroke-red-400";
  const textColor =
    score >= 7 ? "text-green-400" : score >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            className="stroke-secondary"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(color, "transition-all duration-1000 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textColor, size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm")}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
