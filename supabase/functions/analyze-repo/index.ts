import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TECH_DETECTORS: Record<string, string[]> = {
  "React": ["react"], "Next.js": ["next"], "Vue.js": ["vue"], "Angular": ["@angular/core"],
  "Svelte": ["svelte"], "TypeScript": ["typescript"], "Node.js": ["package.json"],
  "Python": ["requirements.txt", "setup.py", "pyproject.toml"], "Docker": ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
  "Java": ["pom.xml", "build.gradle"], "Go": ["go.mod"], "Rust": ["Cargo.toml"],
  "Ruby": ["Gemfile"], "PHP": ["composer.json"], "Tailwind CSS": ["tailwindcss"],
  "PostgreSQL": ["postgres", "pg"], "MongoDB": ["mongoose", "mongodb"], "Redis": ["redis", "ioredis"],
  "GraphQL": ["graphql", "apollo"], "Prisma": ["prisma"], "Vite": ["vite"],
  "Webpack": ["webpack"], "Jest": ["jest"], "Vitest": ["vitest"],
  "ESLint": ["eslint"], "Prettier": ["prettier"], "Flask": ["flask"], "Django": ["django"],
  "FastAPI": ["fastapi"], "Express": ["express"], "Koa": ["koa"],
  "Spring Boot": ["spring-boot"], "Terraform": ["main.tf"], "Kubernetes": ["k8s", "kubernetes"],
};

const DEPENDENCY_FILE_NAMES = [
  "package.json", "requirements.txt", "Pipfile", "pyproject.toml",
  "pom.xml", "build.gradle", "Cargo.toml", "go.mod", "Gemfile",
  "composer.json", "Package.swift", "pubspec.yaml",
];

const README_SECTION_PATTERNS = [
  { name: "Installation", pattern: /#+\s*(install|getting\s*started|setup|quick\s*start)/i },
  { name: "Usage", pattern: /#+\s*(usage|how\s*to\s*use|examples?)/i },
  { name: "API", pattern: /#+\s*(api|reference|endpoints?)/i },
  { name: "Configuration", pattern: /#+\s*(config|configuration|options)/i },
  { name: "Contributing", pattern: /#+\s*(contribut)/i },
  { name: "License", pattern: /#+\s*(license)/i },
  { name: "Testing", pattern: /#+\s*(test|testing)/i },
  { name: "Deployment", pattern: /#+\s*(deploy|deployment|hosting)/i },
  { name: "Features", pattern: /#+\s*(features?|capabilities)/i },
  { name: "Architecture", pattern: /#+\s*(architect|design|structure)/i },
];

function detectReadmeSections(readme: string): string[] {
  return README_SECTION_PATTERNS.filter((p) => p.pattern.test(readme)).map((p) => p.name);
}

function detectTechFromFiles(fileNames: string[], packageJson: any): string[] {
  const techs = new Set<string>();
  for (const [tech, indicators] of Object.entries(TECH_DETECTORS)) {
    for (const indicator of indicators) {
      if (fileNames.some((f) => f.toLowerCase().includes(indicator.toLowerCase()))) techs.add(tech);
    }
  }
  if (packageJson) {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const [tech, indicators] of Object.entries(TECH_DETECTORS)) {
      for (const indicator of indicators) { if (allDeps[indicator]) techs.add(tech); }
    }
  }
  return Array.from(techs).sort();
}

function computeDocScore(readme: string, sections: string[], hasContributing: boolean, hasLicense: boolean): { score: number; explanation: string } {
  let score = 0;
  const reasons: string[] = [];
  if (readme.length > 5000) { score += 3; reasons.push("Comprehensive README (>5k chars)"); }
  else if (readme.length > 2000) { score += 2; reasons.push("Good README length (>2k chars)"); }
  else if (readme.length > 500) { score += 1; reasons.push("Basic README present"); }
  else reasons.push("README is very short or missing");

  const important = ["Installation", "Usage", "API", "Contributing"];
  const found = important.filter((s) => sections.includes(s));
  const missing = important.filter((s) => !sections.includes(s));
  score += found.length;
  if (found.length > 0) reasons.push(`Has sections: ${found.join(", ")}`);
  if (missing.length > 0) reasons.push(`Missing sections: ${missing.join(", ")}`);

  if (hasContributing) { score += 1.5; reasons.push("Contributing guide present"); }
  else reasons.push("No contributing guide");
  if (hasLicense) { score += 1.5; reasons.push("License present"); }
  else reasons.push("No license file");

  return { score: Math.min(10, Math.round(score * 10) / 10), explanation: reasons.join(". ") + "." };
}

function computeStructureScore(hasTests: boolean, hasCiCd: boolean, hasDocsFolder: boolean, fileCount: number, topLevelNames: string[]): { score: number; explanation: string } {
  let score = 5;
  const reasons: string[] = [];
  if (hasTests) { score += 2; reasons.push("Test folder present"); } else reasons.push("No test folder detected");
  if (hasCiCd) { score += 1.5; reasons.push("CI/CD configuration found"); } else reasons.push("No CI/CD setup");
  if (hasDocsFolder) { score += 0.5; reasons.push("Documentation folder exists"); }
  const goodFolders = ["src", "lib", "utils", "components", "services", "models", "tests", "docs"];
  const foundGood = topLevelNames.filter((n) => goodFolders.includes(n.toLowerCase()));
  score += Math.min(1, foundGood.length * 0.25);
  if (foundGood.length > 0) reasons.push(`Good structure: ${foundGood.join(", ")}`);
  return { score: Math.min(10, Math.round(score * 10) / 10), explanation: reasons.join(". ") + "." };
}

function computeCommunityScore(stars: number, forks: number, contributors: number, issues: number, commitFreq: string): { score: number; explanation: string } {
  let score = 0;
  const reasons: string[] = [];
  if (stars > 10000) { score += 2.5; reasons.push(`High star count (${stars.toLocaleString()})`); }
  else if (stars > 1000) { score += 2; reasons.push(`Good star count (${stars.toLocaleString()})`); }
  else if (stars > 100) { score += 1.5; reasons.push(`Moderate stars (${stars})`); }
  else { score += Math.min(1, stars > 10 ? 1 : 0.5); reasons.push(`Low star count (${stars})`); }

  if (forks > 1000) { score += 2; } else if (forks > 100) { score += 1.5; } else if (forks > 10) { score += 1; } else score += 0.5;
  reasons.push(`${forks.toLocaleString()} forks`);

  if (contributors > 100) { score += 2.5; reasons.push(`Large contributor base (~${contributors})`); }
  else if (contributors > 20) { score += 2; reasons.push(`Active contributors (~${contributors})`); }
  else if (contributors > 5) { score += 1.5; } else if (contributors > 1) { score += 1; } else { score += 0.5; reasons.push("Single contributor"); }

  if (commitFreq === "daily") { score += 1.5; reasons.push("Daily commits"); }
  else if (commitFreq === "weekly") { score += 1; reasons.push("Weekly commits"); }
  else if (commitFreq === "monthly") { score += 0.5; reasons.push("Monthly commits"); }
  else reasons.push("Infrequent commits");

  if (issues > 0 && issues < 500) { score += 1.5; } else if (issues >= 500) { score += 1; } else score += 0.5;
  return { score: Math.min(10, Math.round(score * 10) / 10), explanation: reasons.join(". ") + "." };
}

function computeActivityScore(commitFreq: string, lastCommitDate: string | null, issues: number, contributors: number): { score: number; explanation: string } {
  let score = 0;
  const reasons: string[] = [];
  if (commitFreq === "daily") { score += 3; reasons.push("Very active (daily commits)"); }
  else if (commitFreq === "weekly") { score += 2; reasons.push("Active (weekly commits)"); }
  else if (commitFreq === "monthly") { score += 1; reasons.push("Moderate activity (monthly)"); }
  else reasons.push("Low commit activity");

  if (lastCommitDate) {
    const daysSince = (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) { score += 3; reasons.push("Last commit within a week"); }
    else if (daysSince < 30) { score += 2.5; reasons.push("Last commit within a month"); }
    else if (daysSince < 90) { score += 1.5; reasons.push("Last commit within 3 months"); }
    else if (daysSince < 365) { score += 0.5; reasons.push("Last commit over 3 months ago"); }
    else reasons.push("No recent commits (>1 year)");
  }
  if (issues > 0 && issues < 200) { score += 2; } else if (issues >= 200) score += 1;
  if (contributors > 50) score += 2; else if (contributors > 10) score += 1.5; else if (contributors > 3) score += 1; else score += 0.5;
  return { score: Math.min(10, Math.round(score * 10) / 10), explanation: reasons.join(". ") + "." };
}

function computeComplexityScore(fileCount: number, largeFilesCount: number, maxDepth: number): { score: number; explanation: string } {
  let score = 7;
  const reasons: string[] = [];
  if (largeFilesCount > 10) { score -= 3; reasons.push(`${largeFilesCount} large files (>50KB) — high risk`); }
  else if (largeFilesCount > 5) { score -= 2; reasons.push(`${largeFilesCount} large files detected`); }
  else if (largeFilesCount > 0) { score -= 1; reasons.push(`${largeFilesCount} large file(s)`); }
  else reasons.push("No oversized files");

  if (maxDepth > 8) { score -= 2; reasons.push(`Deep nesting (depth ${maxDepth})`); }
  else if (maxDepth > 5) { score -= 1; reasons.push(`Moderate nesting (depth ${maxDepth})`); }
  else reasons.push(`Clean structure (depth ${maxDepth})`);

  if (fileCount > 5 && fileCount < 30) score += 1;
  reasons.push(`${fileCount.toLocaleString()} total files`);
  return { score: Math.min(10, Math.max(0, Math.round(score * 10) / 10)), explanation: reasons.join(". ") + "." };
}

function computeDependencyHealthScore(depCount: number, depFiles: string[]): { score: number; riskLevel: string; explanation: string } {
  let score = 7;
  const reasons: string[] = [];
  if (depCount > 200) { score -= 3; reasons.push(`Very high dependency count (${depCount})`); }
  else if (depCount > 100) { score -= 2; reasons.push(`High dependency count (${depCount})`); }
  else if (depCount > 50) { score -= 1; reasons.push(`Moderate dependencies (${depCount})`); }
  else reasons.push(`Manageable dependency count (${depCount})`);

  if (depFiles.length > 0) { score += 1; reasons.push(`Dependency files: ${depFiles.join(", ")}`); }
  if (depFiles.length > 3) score += 1;
  const riskLevel = score >= 7 ? "Low" : score >= 4 ? "Medium" : "High";
  return { score: Math.min(10, Math.max(0, Math.round(score * 10) / 10)), riskLevel, explanation: reasons.join(". ") + "." };
}

function computeRiskPrediction(commitFreq: string, lastCommitDate: string | null, issues: number, contributors: number, activityScore: number): { riskScore: number; riskLevel: string; reasons: string[] } {
  const reasons: string[] = [];
  let risk = 0;

  if (commitFreq === "infrequent" || commitFreq === "unknown") { risk += 3; reasons.push("Declining or unknown commit frequency"); }
  else if (commitFreq === "monthly") { risk += 1; reasons.push("Only monthly commits"); }

  if (lastCommitDate) {
    const daysSince = (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 365) { risk += 3; reasons.push("No commits in over a year"); }
    else if (daysSince > 180) { risk += 2; reasons.push("No commits in 6+ months"); }
    else if (daysSince > 90) { risk += 1; reasons.push("Last commit over 3 months ago"); }
  } else { risk += 2; reasons.push("No commit history available"); }

  if (issues > 500) { risk += 2; reasons.push(`Large issue backlog (${issues} open)`); }
  else if (issues > 100) { risk += 1; reasons.push(`Growing issue backlog (${issues} open)`); }

  if (contributors <= 1) { risk += 2; reasons.push("Single contributor — bus factor risk"); }
  else if (contributors <= 3) { risk += 1; reasons.push("Very few contributors"); }

  if (activityScore < 3) { risk += 1; reasons.push("Overall low activity score"); }

  const riskScore = Math.min(10, Math.round(risk * 10) / 10);
  const riskLevel = riskScore <= 3 ? "Low" : riskScore <= 6 ? "Moderate" : "High";

  if (reasons.length === 0) reasons.push("No significant risk indicators detected");
  return { riskScore, riskLevel, reasons };
}

// Fetch the file tree using the default branch and handle truncated responses
async function analyzeRepoTree(
  owner: string, repo: string, defaultBranch: string, ghHeaders: Record<string, string>
): Promise<{
  fileCount: number; largeFilesCount: number; maxDepth: number;
  avgFileSize: number; fileTree: any[]; allFilePaths: string[];
}> {
  const empty = { fileCount: 0, largeFilesCount: 0, maxDepth: 0, avgFileSize: 0, fileTree: [], allFilePaths: [] };
  try {
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    console.log(`Fetching tree: ${treeUrl}`);
    const treeRes = await fetch(treeUrl, { headers: ghHeaders });
    if (!treeRes.ok) {
      console.error(`Tree fetch failed: ${treeRes.status} ${treeRes.statusText}`);
      return empty;
    }
    const treeData = await treeRes.json();
    const truncated = treeData.truncated === true;
    const items: any[] = treeData.tree || [];

    if (items.length === 0) {
      console.log("Tree is empty — repo may have no files.");
      return empty;
    }

    console.log(`Tree items: ${items.length}, truncated: ${truncated}`);

    // Filter blobs (files) - ignore common binary/media extensions
    const binaryExts = new Set([
      ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".bmp", ".tiff",
      ".mp4", ".mp3", ".wav", ".avi", ".mov", ".flv", ".wmv",
      ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2",
      ".woff", ".woff2", ".ttf", ".eot", ".otf",
      ".pdf", ".doc", ".docx", ".xls", ".xlsx",
      ".exe", ".dll", ".so", ".dylib", ".o", ".obj",
      ".pyc", ".class", ".jar",
    ]);

    const blobs = items.filter((t: any) => {
      if (t.type !== "blob") return false;
      const ext = (t.path || "").substring((t.path || "").lastIndexOf(".")).toLowerCase();
      return !binaryExts.has(ext);
    });

    const allBlobs = items.filter((t: any) => t.type === "blob");
    const fileCount = allBlobs.length;
    const largeFilesCount = allBlobs.filter((b: any) => (b.size || 0) > 50000).length;
    const totalSize = allBlobs.reduce((s: number, b: any) => s + (b.size || 0), 0);
    const avgFileSize = fileCount > 0 ? Math.round(totalSize / fileCount) : 0;
    const maxDepth = allBlobs.reduce((max: number, b: any) => Math.max(max, (b.path || "").split("/").length), 0);

    // Collect all file paths for dependency/health detection
    const allFilePaths = items.map((i: any) => i.path as string);

    // Build file tree (limited to top 3 levels, max 250 nodes)
    const fileTree: any[] = [];
    const dirMap = new Map<string, any>();
    let nodeCount = 0;

    for (const item of items) {
      if (nodeCount > 250) break;
      const parts = item.path.split("/");
      if (parts.length > 3) continue;

      const node = {
        name: parts[parts.length - 1],
        type: item.type === "tree" ? "dir" : "file",
        path: item.path,
        size: item.size || 0,
        children: item.type === "tree" ? [] : undefined,
      };
      nodeCount++;

      if (parts.length === 1) {
        fileTree.push(node);
        if (item.type === "tree") dirMap.set(item.path, node);
      } else {
        const parentPath = parts.slice(0, -1).join("/");
        const parent = dirMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
          if (item.type === "tree") dirMap.set(item.path, node);
        }
      }
    }

    return { fileCount, largeFilesCount, maxDepth, avgFileSize, fileTree, allFilePaths };
  } catch (e) {
    console.error("Tree analysis error:", e);
    return empty;
  }
}

// Detect dependency files from the full file tree
function detectDependencyFilesFromTree(allFilePaths: string[]): string[] {
  const found = new Set<string>();
  for (const p of allFilePaths) {
    const fileName = p.split("/").pop() || "";
    if (DEPENDENCY_FILE_NAMES.some((df) => fileName.toLowerCase() === df.toLowerCase())) {
      found.add(fileName);
    }
  }
  return Array.from(found);
}

// Detect health indicators from full file tree
function detectHealthFromTree(allFilePaths: string[]): {
  hasTests: boolean; hasCiCd: boolean; hasDocsFolder: boolean;
  hasContributing: boolean; hasLicense: boolean;
} {
  const hasTests = allFilePaths.some((p) =>
    /^(tests?|__tests__|spec|__spec__|test)\//i.test(p) ||
    /\.(test|spec)\.(ts|js|tsx|jsx|py|rb|go|rs)$/i.test(p)
  );
  const hasCiCd = allFilePaths.some((p) =>
    p.startsWith(".github/workflows/") ||
    p.startsWith(".circleci/") ||
    /^(\.gitlab-ci\.yml|Jenkinsfile|\.travis\.yml|azure-pipelines\.yml)$/i.test(p)
  );
  const hasDocsFolder = allFilePaths.some((p) => /^(docs?|documentation)\//i.test(p));
  const hasContributing = allFilePaths.some((p) => /^contributing/i.test(p.split("/").pop() || ""));
  const hasLicense = allFilePaths.some((p) => /^license/i.test(p.split("/").pop() || ""));
  return { hasTests, hasCiCd, hasDocsFolder, hasContributing, hasLicense };
}

// Get contributor count using the Contributors API with pagination
async function getContributorCount(owner: string, repo: string, ghHeaders: Record<string, string>): Promise<number> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
      { headers: ghHeaders }
    );
    if (!res.ok) return 0;
    const linkHeader = res.headers.get("link") || "";
    const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
    if (match) return parseInt(match[1]);
    // If no pagination header, count from body
    const body = await res.json();
    return Array.isArray(body) ? body.length : 0;
  } catch {
    return 0;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse GitHub URL - handle various formats
    const cleaned = url.trim().replace(/\/+$/, "");
    const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s?#]+)\/([^\/\s?#]+)/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const [, owner, rawName] = match;
    const repo_name = rawName.replace(/\.git$/, "");

    console.log(`Analyzing: ${owner}/${repo_name}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 24h Cache - only use cached results that have real data (cached_at is set)
    const { data: cached } = await supabase
      .from("repositories").select("*")
      .eq("owner", owner).eq("repo_name", repo_name)
      .not("cached_at", "is", null)
      .gte("cached_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (cached && cached.file_count > 0) {
      console.log("Returning cached result");
      return new Response(JSON.stringify({ ...cached, _cached: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ghToken = Deno.env.get("GITHUB_TOKEN");
    const ghHeaders: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "RepoInsight",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (ghToken) ghHeaders["Authorization"] = `Bearer ${ghToken}`;

    // Step 1: Fetch repo metadata to get the default branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo_name}`, { headers: ghHeaders });
    if (!repoRes.ok) {
      const status = repoRes.status;
      if (status === 404) {
        return new Response(JSON.stringify({ error: `Repository ${owner}/${repo_name} not found` }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 403) {
        return new Response(JSON.stringify({ error: "GitHub API rate limit exceeded. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: `GitHub API error: ${status}` }), { status: status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const repoData = await repoRes.json();
    const stars = repoData.stargazers_count || 0;
    const forks = repoData.forks_count || 0;
    const issues = repoData.open_issues_count || 0;
    const watchers = repoData.subscribers_count || 0;
    const language = repoData.language || null;
    const description = repoData.description || "";
    const repoHasLicense = !!repoData.license;
    const defaultBranch = repoData.default_branch || "main";

    console.log(`Repo metadata: stars=${stars}, forks=${forks}, branch=${defaultBranch}`);

    // Step 2: Fetch everything in parallel using the correct default branch
    const [readmeRes, commitsRes, treeMetrics, contributorCount] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo_name}/readme`, { headers: ghHeaders }),
      fetch(`https://api.github.com/repos/${owner}/${repo_name}/commits?per_page=30`, { headers: ghHeaders }),
      analyzeRepoTree(owner, repo_name, defaultBranch, ghHeaders),
      getContributorCount(owner, repo_name, ghHeaders),
    ]);

    // README
    let readmeContent = "";
    if (readmeRes.ok) {
      const d = await readmeRes.json();
      try { readmeContent = atob(d.content.replace(/\n/g, "")); } catch {}
    }
    const readmeLength = readmeContent.length;
    const readmeSections = detectReadmeSections(readmeContent);
    const readmeExcerpt = readmeContent.slice(0, 4000);

    console.log(`README: ${readmeLength} chars, sections: ${readmeSections.join(", ")}`);

    // Detect health indicators from the full file tree
    const treeHealth = detectHealthFromTree(treeMetrics.allFilePaths);
    const hasTests = treeHealth.hasTests;
    const hasCiCd = treeHealth.hasCiCd;
    const hasDocsFolder = treeHealth.hasDocsFolder;
    const hasContributing = treeHealth.hasContributing;
    const hasLicense = repoHasLicense || treeHealth.hasLicense;

    // Detect dependency files from the full tree
    const depFiles = detectDependencyFilesFromTree(treeMetrics.allFilePaths);

    // Fetch package.json if it exists for dependency counting & tech detection
    let packageJson: any = null;
    let depCount = 0;

    if (treeMetrics.allFilePaths.some((p) => p === "package.json" || p.endsWith("/package.json"))) {
      try {
        const pkgRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo_name}/contents/package.json`,
          { headers: ghHeaders }
        );
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          const content = atob(pkgData.content.replace(/\n/g, ""));
          packageJson = JSON.parse(content);
          depCount = Object.keys(packageJson.dependencies || {}).length +
                     Object.keys(packageJson.devDependencies || {}).length;
        }
      } catch (e) { console.error("Failed to fetch package.json:", e); }
    }

    // Also check for requirements.txt
    if (treeMetrics.allFilePaths.some((p) => p === "requirements.txt")) {
      try {
        const reqRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo_name}/contents/requirements.txt`,
          { headers: ghHeaders }
        );
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          const content = atob(reqData.content.replace(/\n/g, ""));
          depCount += content.split("\n").filter((l: string) => l.trim() && !l.startsWith("#") && !l.startsWith("-")).length;
        }
      } catch {}
    }

    // Also check go.mod
    if (treeMetrics.allFilePaths.some((p) => p === "go.mod")) {
      try {
        const goRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo_name}/contents/go.mod`,
          { headers: ghHeaders }
        );
        if (goRes.ok) {
          const goData = await goRes.json();
          const content = atob(goData.content.replace(/\n/g, ""));
          const requireMatches = content.match(/require\s*\(/g);
          if (requireMatches) {
            const lines = content.split("\n").filter((l: string) => l.trim() && !l.startsWith("//") && !l.includes("module") && !l.includes("go "));
            depCount += lines.filter((l: string) => l.includes("/")).length;
          }
        }
      } catch {}
    }

    // Top-level names for tech detection
    const topLevelNames = treeMetrics.allFilePaths
      .map((p) => p.split("/")[0])
      .filter((v, i, a) => a.indexOf(v) === i);

    const detectedTechnologies = detectTechFromFiles(
      [...topLevelNames, ...treeMetrics.allFilePaths.map((p) => p.split("/").pop() || "")],
      packageJson
    );

    // Commits
    let commitFrequency = "unknown";
    let lastCommitDate: string | null = null;
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits) && commits.length > 0) {
        lastCommitDate = commits[0]?.commit?.committer?.date || null;
        if (commits.length >= 2) {
          const first = new Date(commits[0].commit.committer.date).getTime();
          const last = new Date(commits[commits.length - 1].commit.committer.date).getTime();
          const daySpan = (first - last) / (1000 * 60 * 60 * 24);
          const avg = commits.length / Math.max(daySpan, 1);
          if (avg >= 1) commitFrequency = "daily";
          else if (avg >= 1 / 7) commitFrequency = "weekly";
          else if (avg >= 1 / 30) commitFrequency = "monthly";
          else commitFrequency = "infrequent";
        }
      }
    }

    console.log(`Metrics: files=${treeMetrics.fileCount}, deps=${depCount}, contributors=${contributorCount}, commits=${commitFrequency}`);

    // Compute all scores
    const doc = computeDocScore(readmeContent, readmeSections, hasContributing, hasLicense);
    const struct = computeStructureScore(hasTests, hasCiCd, hasDocsFolder, treeMetrics.fileCount, topLevelNames);
    const community = computeCommunityScore(stars, forks, contributorCount, issues, commitFrequency);
    const activity = computeActivityScore(commitFrequency, lastCommitDate, issues, contributorCount);
    const complexity = computeComplexityScore(treeMetrics.fileCount, treeMetrics.largeFilesCount, treeMetrics.maxDepth);
    const dep = computeDependencyHealthScore(depCount, depFiles);
    const risk = computeRiskPrediction(commitFrequency, lastCommitDate, issues, contributorCount, activity.score);

    const scoreExplanations: Record<string, string> = {
      documentation: doc.explanation,
      structure: struct.explanation,
      community_health: community.explanation,
      activity: activity.explanation,
      code_complexity: complexity.explanation,
      dependency_health: dep.explanation,
    };

    const baseMaintainability = (
      (hasTests ? 3 : 0) + (hasCiCd ? 2 : 0) +
      (detectedTechnologies.includes("TypeScript") ? 1.5 : 0) +
      (detectedTechnologies.includes("ESLint") ? 1 : 0) +
      (detectedTechnologies.includes("Prettier") ? 0.5 : 0) + 2
    );

    // AI Analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: "AI key not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const prompt = `Analyze "${owner}/${repo_name}".
Description: ${description}
Language: ${language || "Unknown"}

COMPUTED METRICS:
- Doc: ${doc.score}/10, Structure: ${struct.score}/10, Community: ${community.score}/10
- Activity: ${activity.score}/10, Complexity: ${complexity.score}/10, Deps: ${dep.score}/10
- Risk: ${risk.riskLevel} (${risk.riskScore}/10)
- Base Maintainability: ${baseMaintainability}/10
- ${treeMetrics.fileCount} files, ${treeMetrics.largeFilesCount} large (>50KB), depth ${treeMetrics.maxDepth}, avg size ${(treeMetrics.avgFileSize / 1024).toFixed(1)}KB
- Dependencies: ${depCount} (files: ${depFiles.join(", ") || "none"})
- Technologies: ${detectedTechnologies.join(", ") || "None"}
- Tests: ${hasTests}, CI/CD: ${hasCiCd}, Docs: ${hasDocsFolder}, Contributing: ${hasContributing}, License: ${hasLicense}
- Contributors: ~${contributorCount}, Commits: ${commitFrequency}, Last: ${lastCommitDate || "unknown"}
- README: ${readmeLength} chars, Sections: ${readmeSections.join(", ") || "None"}

README excerpt:
${readmeExcerpt || "No README."}

Top-level: ${topLevelNames.join(", ")}

Return JSON:
{
  "maintainability_score": <refine ${baseMaintainability}, 0-10>,
  "maintainability_explanation": "<why this score>",
  "summary": "<2-3 sentences covering all scores>",
  "recommendations": ["<5-7 actionable items based on actual issues>"],
  "explanation": {
    "purpose": "<what it does>",
    "architecture": "<high-level design>",
    "key_modules": ["<3-5 modules>"],
    "technologies": ["<techs>"],
    "how_to_run": "<instructions>",
    "score_explanation": "<why overall score, referencing metrics>"
  }
}
Only valid JSON.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Expert software engineer. Respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const s = aiRes.status;
      if (s === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (s === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    let aiContent = aiData.choices?.[0]?.message?.content || "";
    aiContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysis: any;
    try { analysis = JSON.parse(aiContent); } catch {
      analysis = {
        maintainability_score: baseMaintainability,
        maintainability_explanation: "Based on computed metrics.",
        summary: "Analysis completed.",
        recommendations: [],
        explanation: { purpose: description, architecture: "Unknown", key_modules: [], technologies: detectedTechnologies, how_to_run: "See README", score_explanation: "Score based on metrics." },
      };
    }

    const maintainabilityScore = Math.min(10, Math.max(0, analysis.maintainability_score || baseMaintainability));
    scoreExplanations.maintainability = analysis.maintainability_explanation || `Base score ${baseMaintainability}/10, refined by AI.`;

    const finalScore = Math.round(
      (doc.score * 0.2 + maintainabilityScore * 0.2 + struct.score * 0.15 + community.score * 0.15 + activity.score * 0.15 + dep.score * 0.1 + complexity.score * 0.05) * 10
    ) / 10;

    const record = {
      repo_name, owner, repo_url: `https://github.com/${owner}/${repo_name}`, description,
      stars, forks, issues, watchers, contributors: contributorCount,
      commit_frequency: commitFrequency, last_commit_date: lastCommitDate, language,
      score: finalScore, documentation_score: doc.score, maintainability_score: maintainabilityScore,
      structure_score: struct.score, community_health_score: community.score,
      dependency_health_score: dep.score, code_complexity_score: complexity.score,
      activity_score: activity.score, dependency_count: depCount,
      large_files_count: treeMetrics.largeFilesCount, max_directory_depth: treeMetrics.maxDepth,
      avg_file_size: treeMetrics.avgFileSize, dependency_files: depFiles,
      dependency_risk_level: dep.riskLevel,
      risk_score: risk.riskScore, risk_level: risk.riskLevel, risk_reasons: risk.reasons,
      score_explanations: scoreExplanations, file_tree: treeMetrics.fileTree,
      summary: analysis.summary || "", recommendations: analysis.recommendations || [],
      has_tests: hasTests, has_ci_cd: hasCiCd, has_docs_folder: hasDocsFolder,
      has_contributing: hasContributing, has_license: hasLicense,
      readme_length: readmeLength, readme_sections: readmeSections,
      detected_technologies: detectedTechnologies, explanation: analysis.explanation || {},
      file_count: treeMetrics.fileCount,
      cached_at: new Date().toISOString(),
    };

    console.log(`Final score: ${finalScore}, saving to DB...`);

    const { data: inserted, error: dbError } = await supabase.from("repositories").insert(record).select().single();
    if (dbError) console.error("DB error:", dbError);

    return new Response(JSON.stringify(inserted || record), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
