import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Github, Save, BarChart3, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalAnalyses: 0, avgScore: 0, riskSummary: { Low: 0, Moderate: 0, High: 0 } });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setGithubUsername(profile.github_username || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    async function loadStats() {
      const { data } = await supabase.from("analysis_history").select("*").eq("user_id", user!.id);
      if (data) {
        const total = data.length;
        const avg = total ? data.reduce((a, r) => a + Number(r.score), 0) / total : 0;
        const risk = { Low: 0, Moderate: 0, High: 0 };
        data.forEach((r) => { if (r.risk_level in risk) risk[r.risk_level as keyof typeof risk]++; });
        setStats({ totalAnalyses: total, avgScore: Math.round(avg * 10) / 10, riskSummary: risk });
      }
    }
    loadStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ username, github_username: githubUsername }).eq("id", user.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      await refreshProfile();
    }
    setSaving(false);
  };

  if (authLoading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-card md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{(profile?.username || "U")[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{profile?.username || "User"}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Analyses</span><span className="font-bold text-foreground">{stats.totalAnalyses}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Score</span><span className="font-bold text-foreground">{stats.avgScore}/10</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span className="font-bold text-foreground">{profile ? new Date(profile.created_at).toLocaleDateString() : "—"}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Edit & Stats */}
          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Edit Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Username</label>
                  <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 bg-secondary/50" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">GitHub Username</label>
                  <div className="relative"><Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="your-github-handle" className="pl-10 bg-secondary/50" /></div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="glow-primary"><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Risk Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Low Risk", value: stats.riskSummary.Low, color: "text-green-400" },
                    { label: "Moderate", value: stats.riskSummary.Moderate, color: "text-yellow-400" },
                    { label: "High Risk", value: stats.riskSummary.High, color: "text-red-400" },
                  ].map((r) => (
                    <div key={r.label} className="text-center px-4 py-3 rounded-lg border border-border/50 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className={`text-2xl font-bold ${r.color}`}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
