import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { repo_url, messages } = await req.json();

    if (!repo_url || !messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "repo_url and messages[] required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const match = repo_url.match(/github\.com\/([^\/]+)\/([^\/\s?#]+)/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid GitHub URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const [, owner, rawName] = match;
    const repo = rawName.replace(/\.git$/, "");
    const ghHeaders: Record<string, string> = { Accept: "application/vnd.github.v3+json", "User-Agent": "RepoInsight" };

    // Fetch README and file tree for context
    const [readmeRes, treeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers: ghHeaders }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, { headers: ghHeaders }),
    ]);

    let readmeContent = "";
    if (readmeRes.ok) {
      const data = await readmeRes.json();
      try { readmeContent = atob(data.content); } catch {}
    }

    let fileList = "";
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const files = (treeData.tree || [])
        .filter((t: any) => t.type === "blob")
        .slice(0, 150)
        .map((t: any) => t.path);
      fileList = files.join("\n");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are RepoInsight AI, an expert codebase assistant for the GitHub repository "${owner}/${repo}".

You have access to the repository's README and file structure. Use this context to answer developer questions about the project.

README CONTENT:
${readmeContent.slice(0, 8000) || "No README available."}

FILE STRUCTURE (up to 150 files):
${fileList || "File tree unavailable."}

INSTRUCTIONS:
- Answer questions about the repository's purpose, architecture, setup, dependencies, and code structure.
- Reference specific files and folders when relevant.
- If you don't have enough context to fully answer, say so and suggest what the developer should look at.
- Be concise but thorough. Use markdown formatting.
- Do NOT make up information about code you haven't seen.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // keep last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI chat failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
