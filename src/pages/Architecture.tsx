import { motion } from "framer-motion";
import { Cpu, Database, Globe, Layers, Brain, BarChart3, ArrowDown, Search, MessageCircle, Shield, Code2, Plug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  { icon: Globe, title: "Frontend (React UI)", desc: "User enters a GitHub repository URL. The React app sends a request to the backend API.", color: "text-primary" },
  { icon: Plug, title: "API Layer / Edge Functions", desc: "Serverless backend validates URL, checks 24h cache, and orchestrates the analysis pipeline. Also serves the public REST API.", color: "text-accent" },
  { icon: Search, title: "Repository Mining Engine", desc: "Fetches repository metadata, README, file tree (recursive), contributors, and commit history from GitHub API in parallel.", color: "text-chart-3" },
  { icon: Layers, title: "Metrics Extraction", desc: "Computes 7 category scores: documentation, structure, community health, activity, code complexity, dependency health, and maintainability.", color: "text-chart-4" },
  { icon: Code2, title: "Risk Prediction Engine", desc: "Analyzes commit trends, contributor patterns, and issue backlog to predict repository health risks (Low/Moderate/High).", color: "text-destructive" },
  { icon: BarChart3, title: "Weighted Scoring Engine", desc: "Combines all sub-scores with weighted averaging. Each category generates an explainable reason for its score.", color: "text-primary" },
  { icon: Brain, title: "AI Insight Generator", desc: "Sends metrics + README to AI for maintainability refinement, summary, architecture explanation, and actionable recommendations.", color: "text-accent" },
  { icon: MessageCircle, title: "Codebase Q&A (AI Chat)", desc: "Streaming AI assistant that answers developer questions using the repository's README and file structure as context.", color: "text-chart-3" },
  { icon: Database, title: "Database Storage", desc: "Stores all metrics, scores, risk predictions, file trees, and AI insights. Results cached for 24 hours.", color: "text-chart-4" },
  { icon: Shield, title: "Repository Intelligence API", desc: "Public REST API endpoints for external tools: /score, /metrics, /risk. Returns JSON for any analyzed repository.", color: "text-primary" },
];

const scoringWeights = [
  { category: "Documentation", weight: "20%", factors: "README quality, sections detected, contributing guide, license" },
  { category: "Maintainability", weight: "20%", factors: "Tests, CI/CD, TypeScript, linting, AI refinement" },
  { category: "Structure", weight: "15%", factors: "Test folder, CI/CD config, docs folder, modular organization" },
  { category: "Community Health", weight: "15%", factors: "Stars, forks, contributors, commit frequency, issues" },
  { category: "Activity", weight: "15%", factors: "Commit recency, frequency, issue activity, contributor growth" },
  { category: "Dependency Health", weight: "10%", factors: "Dependency count, dependency files, risk assessment" },
  { category: "Code Complexity", weight: "5%", factors: "File count, large files, directory depth" },
];

const apiEndpoints = [
  { method: "GET", path: "/repo-api/score?repo=owner/repo", desc: "Quality scores for a repository" },
  { method: "GET", path: "/repo-api/metrics?repo=owner/repo", desc: "Detailed repository metrics" },
  { method: "GET", path: "/repo-api/risk?repo=owner/repo", desc: "Risk prediction and reasons" },
];

export default function Architecture() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">System Architecture</h1>
        <p className="text-muted-foreground mb-12">Complete pipeline from URL to developer intelligence.</p>

        {/* Pipeline */}
        <div className="space-y-1 mb-16">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="glass-card">
                <CardContent className="py-5 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <step.icon className={`h-6 w-6 ${step.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">STEP {i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Scoring */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Scoring Model Weights</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scoringWeights.map((w) => (
                  <div key={w.category} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-40 shrink-0">{w.category}</span>
                    <div className="flex-1 bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: w.weight }} />
                    </div>
                    <span className="text-sm font-bold text-primary w-10 text-right">{w.weight}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                {scoringWeights.map((w) => (
                  <p key={w.category} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{w.category}:</span> {w.factors}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Docs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5 text-accent" /> Public API Reference</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Access repository intelligence via REST API. Repositories must be analyzed first.</p>
              {apiEndpoints.map((ep) => (
                <div key={ep.path} className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                  <Badge variant="secondary" className="text-xs font-mono shrink-0 mt-0.5">{ep.method}</Badge>
                  <div>
                    <code className="text-sm font-mono text-foreground">{ep.path}</code>
                    <p className="text-xs text-muted-foreground mt-1">{ep.desc}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-xs font-semibold text-foreground mb-2">Example Response (/score):</p>
                <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">{`{
  "repository": "facebook/react",
  "overall_score": 9.2,
  "documentation": 8.9,
  "maintainability": 9.1,
  "community_health": 9.5,
  "risk_level": "Low"
}`}</pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
