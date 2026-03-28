import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Shield, RotateCcw, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface HistoryEntry {
  id: string;
  repository_name: string;
  repository_owner: string;
  score: number;
  risk_level: string;
  analyzed_at: string;
}

export default function MyDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("analyzed_at", { ascending: false });
    setHistory((data as HistoryEntry[]) || []);
    setLoading(false);
  };

  const handleReAnalyze = (owner: string, name: string) => {
    navigate(`/analyze?repo=https://github.com/${owner}/${name}`);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("analysis_history").delete().eq("id", id);
    setHistory((h) => h.filter((e) => e.id !== id));
    toast({ title: "Removed from history" });
  };

  const totalAnalyses = history.length;
  const avgScore = totalAnalyses ? (history.reduce((a, h) => a + Number(h.score), 0) / totalAnalyses).toFixed(1) : "—";
  const riskCounts = { Low: 0, Moderate: 0, High: 0 };
  history.forEach((h) => { if (h.risk_level in riskCounts) riskCounts[h.risk_level as keyof typeof riskCounts]++; });

  // Score over time chart data (group by repo, track score changes)
  const repoScores: Record<string, { scores: { date: string; score: number }[] }> = {};
  history.forEach((h) => {
    const key = `${h.repository_owner}/${h.repository_name}`;
    if (!repoScores[key]) repoScores[key] = { scores: [] };
    repoScores[key].scores.push({ date: new Date(h.analyzed_at).toLocaleDateString(), score: Number(h.score) });
  });

  // Timeline chart: recent analyses chronologically
  const timelineData = [...history].reverse().slice(-20).map((h) => ({
    name: `${h.repository_name}`.slice(0, 12),
    score: Number(h.score),
    date: new Date(h.analyzed_at).toLocaleDateString(),
  }));

  // Find repos with improvements
  const improvements = Object.entries(repoScores)
    .filter(([_, v]) => v.scores.length >= 2)
    .map(([repo, v]) => {
      const sorted = v.scores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const prev = sorted[sorted.length - 2].score;
      const current = sorted[sorted.length - 1].score;
      return { repo, prev, current, change: Math.round((current - prev) * 10) / 10 };
    })
    .filter((i) => i.change !== 0);

  const scoreColor = (s: number) => s >= 7 ? "text-green-400" : s >= 5 ? "text-yellow-400" : "text-red-400";
  const riskColor = (l: string) => l === "Low" ? "bg-green-500/10 text-green-400 border-green-500/30" : l === "Moderate" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-red-500/10 text-red-400 border-red-500/30";

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.username || "Developer"}</h1>
          <p className="text-muted-foreground">Your personal repository intelligence dashboard.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Analyses</p><p className="text-3xl font-bold text-foreground">{totalAnalyses}</p></div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Average Score</p><p className="text-3xl font-bold text-foreground">{avgScore}</p></div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Risk Distribution</p>
              <div className="flex gap-3">
                {Object.entries(riskCounts).map(([level, count]) => (
                  <Badge key={level} variant="outline" className={riskColor(level)}>{level}: {count}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score timeline chart */}
        {timelineData.length > 1 && (
          <Card className="glass-card">
            <CardHeader><CardTitle>Score Timeline</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ score: { label: "Score", color: "hsl(var(--primary))" } }}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Score Improvements</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {improvements.map((imp) => (
                  <div key={imp.repo} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                    <span className="font-medium text-foreground">{imp.repo}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{imp.prev.toFixed(1)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={scoreColor(imp.current)}>{imp.current.toFixed(1)}</span>
                      <Badge variant="outline" className={imp.change > 0 ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}>
                        {imp.change > 0 ? "+" : ""}{imp.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Analysis History</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No analyses yet. Start by analyzing a repository.</p>
                <Button onClick={() => navigate("/analyze")} className="glow-primary">Go to Analyze</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-lg font-bold ${scoreColor(Number(h.score))}`}>{Number(h.score).toFixed(1)}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{h.repository_owner}/{h.repository_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(h.analyzed_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={riskColor(h.risk_level)}>{h.risk_level}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleReAnalyze(h.repository_owner, h.repository_name)} title="Re-analyze">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <a href={`https://github.com/${h.repository_owner}/${h.repository_name}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
