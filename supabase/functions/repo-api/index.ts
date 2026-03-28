import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop() || "";
    const repoParam = url.searchParams.get("repo"); // owner/repo

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (path === "score" || path === "metrics" || path === "risk") {
      if (!repoParam) {
        return new Response(JSON.stringify({ error: "Missing ?repo=owner/repo parameter" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const [owner, repo_name] = repoParam.split("/");
      if (!owner || !repo_name) {
        return new Response(JSON.stringify({ error: "Invalid repo format. Use owner/repo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data, error } = await supabase
        .from("repositories")
        .select("*")
        .eq("owner", owner)
        .eq("repo_name", repo_name)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Repository not found. Analyze it first at /analyze" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (path === "score") {
        return new Response(JSON.stringify({
          repository: `${data.owner}/${data.repo_name}`,
          overall_score: Number(data.score),
          documentation: Number(data.documentation_score),
          maintainability: Number(data.maintainability_score),
          structure: Number(data.structure_score),
          community_health: Number(data.community_health_score),
          activity: Number(data.activity_score),
          dependency_health: Number(data.dependency_health_score),
          code_complexity: Number(data.code_complexity_score),
          risk_level: data.risk_level,
          analyzed_at: data.created_at,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (path === "metrics") {
        return new Response(JSON.stringify({
          repository: `${data.owner}/${data.repo_name}`,
          language: data.language,
          stars: data.stars,
          forks: data.forks,
          issues: data.issues,
          watchers: data.watchers,
          contributors: data.contributors,
          commit_frequency: data.commit_frequency,
          last_commit_date: data.last_commit_date,
          file_count: data.file_count,
          avg_file_size: data.avg_file_size,
          large_files_count: data.large_files_count,
          max_directory_depth: data.max_directory_depth,
          dependency_count: data.dependency_count,
          dependency_risk_level: data.dependency_risk_level,
          has_tests: data.has_tests,
          has_ci_cd: data.has_ci_cd,
          has_license: data.has_license,
          has_contributing: data.has_contributing,
          detected_technologies: data.detected_technologies,
          analyzed_at: data.created_at,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (path === "risk") {
        return new Response(JSON.stringify({
          repository: `${data.owner}/${data.repo_name}`,
          risk_score: Number(data.risk_score),
          risk_level: data.risk_level,
          risk_reasons: data.risk_reasons,
          recommendations: data.recommendations,
          analyzed_at: data.created_at,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Default: list all endpoints
    return new Response(JSON.stringify({
      api: "RepoInsight Repository Intelligence API",
      version: "1.0",
      endpoints: {
        "GET /repo-api/score?repo=owner/repo": "Get quality scores",
        "GET /repo-api/metrics?repo=owner/repo": "Get repository metrics",
        "GET /repo-api/risk?repo=owner/repo": "Get risk prediction",
      },
      note: "Repositories must be analyzed first via the RepoInsight web interface.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("API error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
