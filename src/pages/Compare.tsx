import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ScoreGauge from "@/components/ScoreGauge";
import TechBadge from "@/components/TechBadge";
import AnalysisLoader from "@/components/AnalysisLoader";
import type { Repository } from "@/lib/types";

export default function Compare() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<[Repository, Repository] | null>(null);
  const { toast } = useToast();

  const handleCompare = async () => {
    if (!url1.trim() || !url2.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const [r1, r2] = await Promise.all([
        supabase.functions.invoke("analyze-repo", { body: { url: url1.trim() } }),
        supabase.functions.invoke("analyze-repo", { body: { url: url2.trim() } }),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      setResults([r1.data as Repository, r2.data as Repository]);
    } catch (e: any) {
      toast({ title: "Comparison failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const a = results?.[0];
  const b = results?.[1];

  const chartData = a && b ? [
    { metric: "Overall", a: Number(a.score), b: Number(b.score) },
    { metric: "Docs", a: Number(a.documentation_score), b: Number(b.documentation_score) },
    { metric: "Maintain.", a: Number(a.maintainability_score), b: Number(b.maintainability_score) },
    { metric: "Structure", a: Number(a.structure_score), b: Number(b.structure_score) },
    { metric: "Community", a: Number(a.community_health_score), b: Number(b.community_health_score) },
    { metric: "Activity", a: Number(a.activity_score || 0), b: Number(b.activity_score || 0) },
    { metric: "Deps", a: Number(a.dependency_health_score || 0), b: Number(b.dependency_health_score || 0) },
    { metric: "Complexity", a: Number(a.code_complexity_score || 0), b: Number(b.code_complexity_score || 0) },
  ] : [];

  const metrics = a && b ? [
    { label: "Overall Score", va: a.score, vb: b.score, max: 10 },
    { label: "Documentation", va: a.documentation_score, vb: b.documentation_score, max: 10 },
    { label: "Maintainability", va: a.maintainability_score, vb: b.maintainability_score, max: 10 },
    { label: "Structure", va: a.structure_score, vb: b.structure_score, max: 10 },
    { label: "Community Health", va: a.community_health_score, vb: b.community_health_score, max: 10 },
    { label: "Activity", va: a.activity_score || 0, vb: b.activity_score || 0, max: 10 },
    { label: "Dependency Health", va: a.dependency_health_score || 0, vb: b.dependency_health_score || 0, max: 10 },
    { label: "Code Complexity", va: a.code_complexity_score || 0, vb: b.code_complexity_score || 0, max: 10 },
    { label: "Stars", va: a.stars, vb: b.stars, max: Math.max(a.stars, b.stars) || 1 },
    { label: "Forks", va: a.forks, vb: b.forks, max: Math.max(a.forks, b.forks) || 1 },
    { label: "Contributors", va: a.contributors, vb: b.contributors, max: Math.max(a.contributors, b.contributors) || 1 },
    { label: "Dependencies", va: a.dependency_count || 0, vb: b.dependency_count || 0, max: Math.max(a.dependency_count || 0, b.dependency_count || 0) || 1 },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <GitCompareArrows className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Compare Repositories</h1>
        </div>
        <p className="text-muted-foreground mb-8">Deep side-by-side comparison across all quality metrics.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Input placeholder="https://github.com/owner/repo-1" value={url1} onChange={(e) => setUrl1(e.target.value)} className="bg-secondary/50" />
          <Input placeholder="https://github.com/owner/repo-2" value={url2} onChange={(e) => setUrl2(e.target.value)} className="bg-secondary/50" />
        </div>
        <Button onClick={handleCompare} disabled={loading || !url1.trim() || !url2.trim()} className="glow-primary mb-12">
          <GitCompareArrows className="h-4 w-4 mr-2" />
          {loading ? "Comparing..." : "Compare"}
        </Button>
      </motion.div>

      {loading && <AnalysisLoader />}

      {a && b && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score headers */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Card className="glass-card p-6 text-center">
              <p className="font-bold text-lg truncate">{a.owner}/{a.repo_name}</p>
              <ScoreGauge score={Number(a.score)} label="Score" size="md" />
              {a.language && <Badge variant="secondary" className="mt-2">{a.language}</Badge>}
            </Card>
            <span className="text-2xl font-bold text-muted-foreground">VS</span>
            <Card className="glass-card p-6 text-center">
              <p className="font-bold text-lg truncate">{b.owner}/{b.repo_name}</p>
              <ScoreGauge score={Number(b.score)} label="Score" size="md" />
              {b.language && <Badge variant="secondary" className="mt-2">{b.language}</Badge>}
            </Card>
          </div>

          {/* Bar chart comparison */}
          <Card className="glass-card">
            <CardHeader><CardTitle>Score Comparison</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{
                a: { label: `${a.repo_name}`, color: "hsl(var(--primary))" },
                b: { label: `${b.repo_name}`, color: "hsl(var(--accent))" },
              }}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="a" name={a.repo_name} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="b" name={b.repo_name} fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Metric bars */}
          {metrics.map((m) => (
            <Card key={m.label} className="glass-card">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-center mb-3">{m.label}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm min-w-[4ch] text-right ${Number(m.va) >= Number(m.vb) ? "text-green-400" : "text-muted-foreground"}`}>
                      {Number(m.va).toLocaleString()}
                    </span>
                    <Progress value={(Number(m.va) / m.max) * 100} className="h-2 flex-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <div className="flex items-center gap-3">
                    <Progress value={(Number(m.vb) / m.max) * 100} className="h-2 flex-1" />
                    <span className={`font-bold text-sm min-w-[4ch] ${Number(m.vb) >= Number(m.va) ? "text-green-400" : "text-muted-foreground"}`}>
                      {Number(m.vb).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Tech stack comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {[a, b].map((repo) => (
              <Card key={repo.id || repo.repo_name} className="glass-card">
                <CardHeader><CardTitle className="text-sm">{repo.repo_name} Tech Stack</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {(repo.detected_technologies || []).map((t) => (
                      <TechBadge key={t} name={t} />
                    ))}
                    {(!repo.detected_technologies || repo.detected_technologies.length === 0) && (
                      <span className="text-sm text-muted-foreground">No technologies detected</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
