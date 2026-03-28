import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, GitCompareArrows, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sparkles, title: "AI-Powered Analysis", desc: "Get intelligent quality scores and actionable recommendations for any GitHub repo." },
  { icon: BarChart3, title: "Visual Dashboard", desc: "Track trends and scores with beautiful interactive charts and analytics." },
  { icon: GitCompareArrows, title: "Side-by-Side Compare", desc: "Compare two repositories head-to-head across every key metric." },
  { icon: Zap, title: "Instant Insights", desc: "Enter a URL and get a comprehensive analysis in seconds, not hours." },
];

export default function Index() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-sm text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-Powered Repository Intelligence
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Analyze GitHub Repos
            <br />
            <span className="gradient-text">with AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Get instant quality insights, AI-powered recommendations, and detailed reports for any GitHub repository.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="glow-primary">
              <Link to="/analyze">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-6 hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
