import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, ExternalLink, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TechBadge from "@/components/TechBadge";
import { supabase } from "@/integrations/supabase/client";
import type { Repository } from "@/lib/types";

export default function HistoryPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("repositories").select("*").order("created_at", { ascending: false });
      setRepos((data as any as Repository[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const scoreColor = (s: number) => s >= 7 ? "text-green-400" : s >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analysis History</h1>
        </div>
        <p className="text-muted-foreground mb-8">All previously analyzed repositories. Click a row to expand details.</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          <Card className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Repository</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Language</TableHead>
                  <TableHead className="hidden md:table-cell">Technologies</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map((r) => (
                  <>
                    <TableRow
                      key={r.id}
                      className="border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      <TableCell className="font-medium text-foreground">{r.owner}/{r.repo_name}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${scoreColor(Number(r.score))}`}>{Number(r.score).toFixed(1)}/10</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{r.language && <Badge variant="secondary">{r.language}</Badge>}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(r.detected_technologies || []).slice(0, 3).map((t) => (
                            <TechBadge key={t} name={t} />
                          ))}
                          {(r.detected_technologies || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{r.detected_technologies.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a href={r.repo_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === r.id ? "rotate-180" : ""}`} />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded === r.id && (
                      <TableRow key={`${r.id}-detail`} className="border-border/50 hover:bg-transparent">
                        <TableCell colSpan={6} className="bg-secondary/20">
                          <div className="py-3 space-y-3">
                            <div className="grid sm:grid-cols-4 gap-3 text-sm">
                              <div><span className="text-muted-foreground">Documentation:</span> <span className={`font-bold ${scoreColor(Number(r.documentation_score))}`}>{Number(r.documentation_score).toFixed(1)}</span></div>
                              <div><span className="text-muted-foreground">Maintainability:</span> <span className={`font-bold ${scoreColor(Number(r.maintainability_score))}`}>{Number(r.maintainability_score).toFixed(1)}</span></div>
                              <div><span className="text-muted-foreground">Structure:</span> <span className={`font-bold ${scoreColor(Number(r.structure_score))}`}>{Number(r.structure_score).toFixed(1)}</span></div>
                              <div><span className="text-muted-foreground">Community:</span> <span className={`font-bold ${scoreColor(Number(r.community_health_score || 0))}`}>{Number(r.community_health_score || 0).toFixed(1)}</span></div>
                            </div>
                            {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
                            {r.detected_technologies && r.detected_technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {r.detected_technologies.map((t) => <TechBadge key={t} name={t} />)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {repos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No analyses yet. Go analyze some repos!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
