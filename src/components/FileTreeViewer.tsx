import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FileTreeNode } from "@/lib/types";

interface FileTreeViewerProps {
  tree: FileTreeNode[];
  largeFilesCount?: number;
  maxDepth?: number;
}

function TreeNode({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === "dir";
  const isLarge = !isDir && (node.size || 0) > 50000;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md text-sm cursor-pointer hover:bg-secondary/50 transition-colors ${isLarge ? "text-yellow-400" : "text-muted-foreground"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDir && setOpen(!open)}
      >
        {isDir ? (
          <>
            {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {open ? <FolderOpen className="h-4 w-4 text-primary shrink-0" /> : <Folder className="h-4 w-4 text-primary shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className="h-4 w-4 shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
        {isLarge && <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0 ml-auto" />}
        {!isDir && node.size && node.size > 0 && (
          <span className="text-xs text-muted-foreground/60 ml-auto shrink-0">{(node.size / 1024).toFixed(1)}KB</span>
        )}
      </div>
      {isDir && open && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "dir" ? -1 : 1;
            })
            .map((child) => (
              <TreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FileTreeViewer({ tree, largeFilesCount, maxDepth }: FileTreeViewerProps) {
  if (!tree || tree.length === 0) return null;

  const sorted = [...tree].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "dir" ? -1 : 1;
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          Repository Structure
          <span className="text-xs text-muted-foreground font-normal ml-2">
            (top 3 levels)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
          {maxDepth !== undefined && <span>Max depth: {maxDepth}</span>}
          {largeFilesCount !== undefined && largeFilesCount > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="h-3 w-3" /> {largeFilesCount} large file{largeFilesCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="bg-secondary/20 rounded-lg p-2 max-h-96 overflow-y-auto font-mono text-xs">
          {sorted.map((node) => (
            <TreeNode key={node.path} node={node} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
