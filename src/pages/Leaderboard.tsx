import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TechBadge from "@/components/TechBadge";
import { supabase } from "@/integrations/supabase/client";
import type { Repository } from "@/lib/types";

export default function Leaderboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("repositories").select("*").order("score", { ascending: false });
      setRepos((data as any as Repository[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = repos.filter(
    (r) =>
      r.repo_name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase())
  );

  const medalColor = (i: number) =>
    i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground";

  const scoreColor = (s: number) =>
    s >= 7 ? "text-green-400" : s >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground mb-8">Top repositories ranked by weighted quality score.</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Repository</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden md:table-cell">Docs</TableHead>
                    <TableHead className="hidden md:table-cell">Maint.</TableHead>
                    <TableHead className="hidden lg:table-cell">Community</TableHead>
                    <TableHead>Stars</TableHead>
                    <TableHead className="hidden sm:table-cell">Language</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r, i) => (
                    <TableRow key={r.id} className="border-border/50">
                      <TableCell className={`font-bold ${medalColor(i)}`}>
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-foreground">{r.repo_name}</span>
                          <span className="text-muted-foreground text-xs ml-1">by {r.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold text-lg ${scoreColor(Number(r.score))}`}>{Number(r.score).toFixed(1)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{Number(r.documentation_score).toFixed(1)}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{Number(r.maintainability_score).toFixed(1)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{Number(r.community_health_score || 0).toFixed(1)}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3.5 w-3.5" /> {r.stars.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{r.language && <Badge variant="secondary">{r.language}</Badge>}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No repositories found. Analyze some repos first!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
