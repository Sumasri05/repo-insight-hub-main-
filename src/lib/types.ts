export interface Repository {
  id: string;
  repo_name: string;
  owner: string;
  repo_url: string;
  description: string;
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  contributors: number;
  commit_frequency: string;
  last_commit_date: string | null;
  language: string | null;
  score: number;
  documentation_score: number;
  maintainability_score: number;
  structure_score: number;
  community_health_score: number;
  dependency_health_score: number;
  code_complexity_score: number;
  activity_score: number;
  dependency_count: number;
  large_files_count: number;
  max_directory_depth: number;
  avg_file_size: number;
  dependency_files: string[];
  dependency_risk_level: string;
  risk_score: number;
  risk_level: string;
  risk_reasons: string[];
  score_explanations: ScoreExplanations;
  file_tree: FileTreeNode[];
  summary: string;
  recommendations: string[];
  has_tests: boolean;
  has_ci_cd: boolean;
  has_docs_folder: boolean;
  has_contributing: boolean;
  has_license: boolean;
  readme_length: number;
  readme_sections: string[];
  detected_technologies: string[];
  explanation: RepoExplanation;
  file_count: number;
  created_at: string;
  cached_at: string | null;
}

export interface RepoExplanation {
  purpose?: string;
  architecture?: string;
  key_modules?: string[];
  technologies?: string[];
  how_to_run?: string;
  score_explanation?: string;
}

export interface ScoreExplanations {
  documentation?: string;
  maintainability?: string;
  structure?: string;
  community_health?: string;
  activity?: string;
  dependency_health?: string;
  code_complexity?: string;
}

export interface FileTreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  size?: number;
  children?: FileTreeNode[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
