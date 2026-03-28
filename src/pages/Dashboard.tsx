import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Hash, Star, TrendingUp, FileText, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Repository } from "@/lib/types";

const PIE_COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(160 60% 45%)",
  "hsl(200 70% 50%)", "hsl(280 60% 55%)",
];

export default function Dashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("repositories").select("*").order("created_at", { ascending: false });
      setRepos((data as any as Repository[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const totalScans = repos.length;
  const avg = (key: string) => totalScans ? (repos.reduce((a, r) => a + Number((r as any)[key] || 0), 0) / totalScans).toFixed(1) : "—";
  const bestRepo = totalScans ? repos.reduce((best, r) => (Number(r.score) > Number(best.score) ? r : best), repos[0]) : null;

  const scoreDist = [
    { range: "0–2", count: repos.filter((r) => Number(r.score) <= 2).length },
    { range: "3–4", count: repos.filter((r) => Number(r.score) > 2 && Number(r.score) <= 4).length },
    { range: "5–6", count: repos.filter((r) => Number(r.score) > 4 && Number(r.score) <= 6).length },
    { range: "7–8", count: repos.filter((r) => Number(r.score) > 6 && Number(r.score) <= 8).length },
    { range: "9–10", count: repos.filter((r) => Number(r.score) > 8).length },
  ];

  const langCounts: Record<string, number> = {};
  repos.forEach((r) => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1; });
  const langData = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  // Avg score by language
  const langScores: Record<string, { total: number; count: number }> = {};
  repos.forEach((r) => {
    if (r.language) {
      if (!langScores[r.language]) langScores[r.language] = { total: 0, count: 0 };
      langScores[r.language].total += Number(r.score);
      langScores[r.language].count++;
    }
  });
  const avgScoreByLang = Object.entries(langScores)
    .map(([name, v]) => ({ name, score: Math.round((v.total / v.count) * 10) / 10 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Stars vs Maintainability scatter
  const scatterData = repos.slice(0, 30).map((r) => ({
    stars: Math.min(Number(r.stars), 50000),
    maintainability: Number(r.maintainability_score),
    name: r.repo_name,
  }));

  const recentScans = repos.slice(0, 8).map((r) => ({ name: r.repo_name.slice(0, 14), score: Number(r.score) }));

  const stats = [
    { label: "Total Scans", value: totalScans, icon: Hash },
    { label: "Average Score", value: avg("score"), icon: TrendingUp },
    { label: "Best Score", value: bestRepo ? `${Number(bestRepo.score).toFixed(1)}` : "—", icon: Star, sub: bestRepo ? `${bestRepo.owner}/${bestRepo.repo_name}` : "" },
    { label: "Avg Documentation", value: avg("documentation_score"), icon: FileText },
    { label: "Avg Maintainability", value: avg("maintainability_score"), icon: BarChart3 },
    { label: "Avg Community", value: avg("community_health_score"), icon: Users },
    { label: "Avg Activity", value: avg("activity_score"), icon: TrendingUp },
    { label: "Avg Dep. Health", value: avg("dependency_health_score"), icon: Package },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Research analytics across all analyzed repositories.</p>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-3xl font-bold text-foreground">{s.value}</p>
                      {s.sub && <p className="text-xs text-muted-foreground mt-1 truncate max-w-[160px]">{s.sub}</p>}
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Card className="glass-card">
            <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: "Repos", color: "hsl(var(--primary))" } }}>
                <BarChart data={scoreDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle>Language Distribution</CardTitle></CardHeader>
            <CardContent>
              {langData.length > 0 ? (
                <ChartContainer config={{ value: { label: "Repos" } }}>
                  <PieChart>
                    <Pie data={langData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {langData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : <p className="text-center text-muted-foreground py-12">No data yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 - Research */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Card className="glass-card">
            <CardHeader><CardTitle>Average Score by Language</CardTitle></CardHeader>
            <CardContent>
              {avgScoreByLang.length > 0 ? (
                <ChartContainer config={{ score: { label: "Avg Score", color: "hsl(var(--chart-3))" } }}>
                  <BarChart data={avgScoreByLang} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="hsl(var(--chart-3))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : <p className="text-center text-muted-foreground py-12">Not enough data</p>}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle>Stars vs Maintainability</CardTitle></CardHeader>
            <CardContent>
              {scatterData.length > 0 ? (
                <ChartContainer config={{ stars: { label: "Stars" }, maintainability: { label: "Maintainability" } }}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="stars" name="Stars" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="maintainability" name="Maintainability" domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ZAxis range={[40, 120]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Scatter data={scatterData} fill="hsl(var(--accent))" />
                  </ScatterChart>
                </ChartContainer>
              ) : <p className="text-center text-muted-foreground py-12">Not enough data</p>}
            </CardContent>
          </Card>
        </div>

        {/* Recent scans */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Recent Scans</CardTitle></CardHeader>
          <CardContent>
            {recentScans.length > 0 ? (
              <ChartContainer config={{ score: { label: "Score", color: "hsl(var(--accent))" } }}>
                <BarChart data={recentScans} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground py-12">No scans yet.</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
