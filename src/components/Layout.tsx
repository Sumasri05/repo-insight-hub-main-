import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, BarChart3, Trophy, GitCompareArrows, History, Search, Menu, X, Workflow, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Home", icon: GitBranch },
  { path: "/analyze", label: "Analyze", icon: Search },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/compare", label: "Compare", icon: GitCompareArrows },
  { path: "/history", label: "History", icon: History },
  { path: "/architecture", label: "Architecture", icon: Workflow },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">RepoInsight</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {isActive && <motion.div layoutId="activeNav" className="absolute inset-0 bg-secondary rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
                    <span className="relative flex items-center gap-1.5"><item.icon className="h-4 w-4" />{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 px-2 gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{(profile?.username || "U")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium text-foreground">{profile?.username || "User"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/my-dashboard")}><LayoutDashboard className="h-4 w-4 mr-2" />My Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive"><LogOut className="h-4 w-4 mr-2" />Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="hidden md:inline-flex">
                  Sign In
                </Button>
              )}

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary">
                <User className="h-4 w-4" />Sign In
              </Link>
            )}
            {user && (
              <>
                <Link to="/my-dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="h-4 w-4" />My Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive w-full text-left">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </>
            )}
          </motion.div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}
