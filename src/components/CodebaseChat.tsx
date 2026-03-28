import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Bot, User, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/lib/types";

interface CodebaseChatProps {
  repoUrl: string;
  repoName: string;
}

export default function CodebaseChat({ repoUrl, repoName }: CodebaseChatProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/repo-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ repo_url: repoUrl, messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) { toast({ title: "Rate limited", description: "Please wait and try again.", variant: "destructive" }); }
        else if (resp.status === 402) { toast({ title: "Credits exhausted", description: "Add AI credits to continue.", variant: "destructive" }); }
        else { toast({ title: "Chat failed", description: "Could not get AI response.", variant: "destructive" }); }
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Button onClick={() => setOpen(true)} className="gap-2 glow-primary">
          <MessageCircle className="h-4 w-4" />
          Ask AI About This Repo
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
        <Card className={`glass-card overflow-hidden ${expanded ? "fixed inset-4 z-50" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI Codebase Assistant</span>
              <span className="text-xs text-muted-foreground">— {repoName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setOpen(false); setExpanded(false); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className={`overflow-y-auto px-4 py-3 space-y-3 ${expanded ? "h-[calc(100%-7rem)]" : "h-80"}`}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Ask me anything about <span className="font-medium text-foreground">{repoName}</span></p>
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                  {["How does this project work?", "What technologies are used?", "How do I run this?"].map((q) => (
                    <button key={q} onClick={() => { setInput(q); }} className="text-xs px-2.5 py-1.5 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-primary/10 text-foreground px-3 py-2 rounded-2xl rounded-tr-sm" : "text-muted-foreground"}`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2.5">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-1" />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/50 p-3 flex gap-2">
            <Input
              placeholder="Ask about the codebase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="bg-secondary/50 text-sm"
              disabled={loading}
            />
            <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
