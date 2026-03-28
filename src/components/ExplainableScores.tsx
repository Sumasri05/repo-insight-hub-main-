import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { ScoreExplanations } from "@/lib/types";

interface ExplainableScoresProps {
  explanations: ScoreExplanations;
  scores: {
    documentation: number;
    maintainability: number;
    structure: number;
    community_health: number;
    activity: number;
    dependency_health: number;
    code_complexity: number;
  };
}

const SCORE_LABELS: Record<string, string> = {
  documentation: "Documentation",
  maintainability: "Maintainability",
  structure: "Structure",
  community_health: "Community Health",
  activity: "Activity",
  dependency_health: "Dependency Health",
  code_complexity: "Code Complexity",
};

export default function ExplainableScores({ explanations, scores }: ExplainableScoresProps) {
  const scoreColor = (s: number) =>
    s >= 7 ? "text-green-400 border-green-500/30 bg-green-500/5" :
    s >= 5 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" :
    "text-red-400 border-red-500/30 bg-red-500/5";

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Explainable Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(scores).map(([key, value]) => {
          const explanation = (explanations as any)?.[key];
          return (
            <div key={key} className={`px-4 py-3 rounded-lg border ${scoreColor(Number(value))}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{SCORE_LABELS[key] || key}</span>
                <span className="text-sm font-bold">{Number(value).toFixed(1)}/10</span>
              </div>
              {explanation && (
                <p className="text-xs opacity-80">{explanation}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
