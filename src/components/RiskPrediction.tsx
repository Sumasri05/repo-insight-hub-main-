import { AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RiskPredictionProps {
  riskScore: number;
  riskLevel: string;
  riskReasons: string[];
}

export default function RiskPrediction({ riskScore, riskLevel, riskReasons }: RiskPredictionProps) {
  const color = riskLevel === "Low"
    ? "text-green-400 border-green-500/30 bg-green-500/5"
    : riskLevel === "Moderate"
    ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
    : "text-red-400 border-red-500/30 bg-red-500/5";

  const icon = riskLevel === "Low" ? Shield : riskLevel === "Moderate" ? AlertTriangle : TrendingDown;
  const Icon = icon;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          Risk Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`px-5 py-4 rounded-xl border ${color} flex items-center gap-3`}>
            <Icon className="h-6 w-6" />
            <div>
              <p className="text-2xl font-bold">{riskLevel}</p>
              <p className="text-xs opacity-70">Risk Score: {riskScore}/10</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Predictive Analysis
          </Badge>
        </div>
        {riskReasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Risk Indicators:</p>
            {riskReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-xs mt-0.5">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
