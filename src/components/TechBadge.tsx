import { Badge } from "@/components/ui/badge";

const techColors: Record<string, string> = {
  "React": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "TypeScript": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Next.js": "bg-foreground/10 text-foreground border-foreground/20",
  "Node.js": "bg-green-500/15 text-green-400 border-green-500/30",
  "Python": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "Docker": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Tailwind CSS": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Vue.js": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Go": "bg-cyan-600/15 text-cyan-300 border-cyan-600/30",
  "Rust": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Java": "bg-red-500/15 text-red-400 border-red-500/30",
  "PostgreSQL": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Redis": "bg-red-600/15 text-red-400 border-red-600/30",
  "Vite": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Jest": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Vitest": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "ESLint": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Prettier": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "GraphQL": "bg-pink-600/15 text-pink-300 border-pink-600/30",
  "Prisma": "bg-teal-600/15 text-teal-300 border-teal-600/30",
};

export default function TechBadge({ name }: { name: string }) {
  const classes = techColors[name] || "bg-secondary text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={`${classes} text-xs font-medium`}>
      {name}
    </Badge>
  );
}
