import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, Star, GitFork, AlertCircle, CheckCircle2, FileText, Code2,
  Users, Activity, Shield, BookOpen, FolderGit2, TestTube2, Workflow,
  Lightbulb, Layers, Package, Gauge, TrendingUp, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ScoreGauge from "@/components/ScoreGauge";
import TechBadge from "@/components/TechBadge";
import AnalysisLoader from "@/components/AnalysisLoader";
import ReportDownload from "@/components/ReportDownload";
import CodebaseChat from "@/components/CodebaseChat";
import FileTreeViewer from "@/components/FileTreeViewer";
import RiskPrediction from "@/components/RiskPrediction";
import ExplainableScores from "@/components/ExplainableScores";
import type { Repository } from "@/lib/types";

export default function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Repository | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const repo = searchParams.get("repo");
    if (repo) {
      setUrl(repo);
    }
  }, [searchParams]);

  const saveToHistory = async (data: Repository) => {
    if (!user) return;
    try {
      await supabase.from("analysis_history").insert({
        user_id: user.id,
        repository_id: data.id,
        repository_name: data.repo_name,
        repository_owner: data.owner,
        score: data.score,
        risk_level: data.risk_level || "unknown",
      });
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-repo", { body: { url: url.trim() } });
      if (error) throw error;
      const isCached = (data as any)?._cached;
      const repo = data as Repository;
      setResult(repo);
      await saveToHistory(repo);
      toast({
        title: isCached ? "Cached result returned" : "Analysis complete!",
        description: `${data.owner}/${data.repo_name} scored ${Number(data.score).toFixed(1)}/10${isCached ? " (cached)" : ""}`,
      });
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const r = result;
  const riskColor = (level: string) => level === "Low" ? "text-green-400 border-green-500/30 bg-green-500/5" : level === "Medium" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" : "text-red-400 border-red-500/30 bg-red-500/5";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Analyze Repository</h1>
        <p className="text-muted-foreground mb-8">Enter a GitHub repository URL for deep engineering analysis.</p>
        <div className="flex gap-3 mb-12">
          <Input placeholder="https://github.com/owner/repo" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} className="bg-secondary/50" />
          <Button onClick={handleAnalyze} disabled={loading || !url.trim()} className="glow-primary shrink-0">
            <Search className="h-4 w-4" /> Analyze
          </Button>
        </div>
      </motion.div>

      {loading && <AnalysisLoader />}

      <AnimatePresence>
        {r && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Header */}
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-bold">{r.owner}/{r.repo_name}</h2>
                      {(r as any)._cached && <Badge variant="secondary" className="text-xs">Cached</Badge>}
                    </div>
                    {r.description && <p className="text-muted-foreground max-w-xl">{r.description}</p>}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {r.stars.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><GitFork className="h-4 w-4" /> {r.forks.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {r.issues}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> ~{r.contributors}</span>
                      <span className="flex items-center gap-1"><Activity className="h-4 w-4" /> {r.commit_frequency}</span>
                    </div>
                    <div className="pt-2 flex gap-2 flex-wrap">
                      <ReportDownload repoId={r.id} repoName={`${r.owner}-${r.repo_name}`} />
                    </div>
                  </div>
                  <ScoreGauge score={r.score} label="Overall" size="lg" />
                </div>
              </div>
            </Card>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: "Documentation", score: r.documentation_score },
                { label: "Maintainability", score: r.maintainability_score },
                { label: "Structure", score: r.structure_score },
                { label: "Community", score: r.community_health_score },
                { label: "Activity", score: r.activity_score },
                { label: "Dependency", score: r.dependency_health_score },
                { label: "Complexity", score: r.code_complexity_score },
              ].map((s) => (
                <Card key={s.label} className="glass-card">
                  <CardContent className="pt-6 flex flex-col items-center gap-3">
                    <ScoreGauge score={s.score} label={s.label} size="md" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Prediction */}
            <RiskPrediction riskScore={r.risk_score} riskLevel={r.risk_level} riskReasons={r.risk_reasons || []} />

            {/* Dependency & Complexity */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Dependency Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Dependencies</p>
                      <p className="text-2xl font-bold text-foreground">{r.dependency_count}</p>
                    </div>
                    <div className={`px-4 py-3 rounded-lg border ${riskColor(r.dependency_risk_level)}`}>
                      <p className="text-xs text-muted-foreground">Risk Level</p>
                      <p className="text-2xl font-bold">{r.dependency_risk_level}</p>
                    </div>
                  </div>
                  {r.dependency_files?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Dependency Files:</p>
                      <div className="flex flex-wrap gap-1.5">{r.dependency_files.map((f) => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" /> Code Complexity</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Total Files</p>
                      <p className="text-2xl font-bold text-foreground">{r.file_count.toLocaleString()}</p>
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Avg File Size</p>
                      <p className="text-2xl font-bold text-foreground">{(r.avg_file_size / 1024).toFixed(1)}KB</p>
                    </div>
                    <div className={`px-4 py-3 rounded-lg border ${r.large_files_count > 5 ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-secondary/30"}`}>
                      <p className="text-xs text-muted-foreground">Large Files</p>
                      <p className={`text-2xl font-bold ${r.large_files_count > 5 ? "text-red-400" : "text-foreground"}`}>{r.large_files_count}</p>
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Max Depth</p>
                      <p className="text-2xl font-bold text-foreground">{r.max_directory_depth}</p>
                    </div>
                  </div>
                  {r.large_files_count > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-yellow-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {r.large_files_count} file{r.large_files_count > 1 ? "s" : ""} exceed 800 lines
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* File Tree */}
            <FileTreeViewer tree={r.file_tree || []} largeFilesCount={r.large_files_count} maxDepth={r.max_directory_depth} />

            {/* Technologies */}
            {r.detected_technologies?.length > 0 && (
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FolderGit2 className="h-5 w-5 text-primary" /> Detected Technologies</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{r.detected_technologies.map((t) => <TechBadge key={t} name={t} />)}</div></CardContent>
              </Card>
            )}

            {/* Health Indicators */}
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Health Indicators</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Tests", present: r.has_tests, icon: TestTube2 },
                    { label: "CI/CD", present: r.has_ci_cd, icon: Workflow },
                    { label: "Documentation Folder", present: r.has_docs_folder, icon: BookOpen },
                    { label: "Contributing Guide", present: r.has_contributing, icon: Users },
                    { label: "License", present: r.has_license, icon: Shield },
                  ].map((h) => (
                    <div key={h.label} className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${h.present ? "border-green-500/30 bg-green-500/5" : "border-border/50 bg-secondary/30"}`}>
                      <h.icon className={`h-4 w-4 ${h.present ? "text-green-400" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${h.present ? "text-green-400" : "text-muted-foreground"}`}>{h.label}</span>
                      <span className={`ml-auto text-xs font-bold ${h.present ? "text-green-400" : "text-muted-foreground"}`}>{h.present ? "✓" : "✗"}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">README</span>
                    <span className="ml-auto text-xs text-muted-foreground">{(r.readme_length / 1000).toFixed(1)}k chars</span>
                  </div>
                </div>
                {r.readme_sections?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">README Sections:</p>
                    <div className="flex flex-wrap gap-1.5">{r.readme_sections.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explainable Scores */}
            {r.score_explanations && (
              <ExplainableScores
                explanations={r.score_explanations}
                scores={{
                  documentation: r.documentation_score,
                  maintainability: r.maintainability_score,
                  structure: r.structure_score,
                  community_health: r.community_health_score,
                  activity: r.activity_score,
                  dependency_health: r.dependency_health_score,
                  code_complexity: r.code_complexity_score,
                }}
              />
            )}

            {/* AI Summary */}
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> AI Analysis Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{r.summary}</p>
                {r.explanation?.score_explanation && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-1">Why this score?</p>
                    <p className="text-sm text-muted-foreground">{r.explanation.score_explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explain */}
            {r.explanation?.purpose && (
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-accent" /> Explain This Repository</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><h4 className="text-sm font-semibold text-foreground mb-1">Purpose</h4><p className="text-sm text-muted-foreground">{r.explanation.purpose}</p></div>
                  {r.explanation.architecture && <div><h4 className="text-sm font-semibold text-foreground mb-1">Architecture</h4><p className="text-sm text-muted-foreground">{r.explanation.architecture}</p></div>}
                  {r.explanation.key_modules?.length > 0 && (
                    <div><h4 className="text-sm font-semibold text-foreground mb-1">Key Modules</h4><div className="flex flex-wrap gap-2">{r.explanation.key_modules.map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}</div></div>
                  )}
                  {r.explanation.how_to_run && <div><h4 className="text-sm font-semibold text-foreground mb-1">How to Run</h4><p className="text-sm text-muted-foreground font-mono bg-secondary/50 rounded-lg p-3">{r.explanation.how_to_run}</p></div>}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Improvement Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {r.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Codebase Q&A Chat */}
            <CodebaseChat repoUrl={r.repo_url} repoName={`${r.owner}/${r.repo_name}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
