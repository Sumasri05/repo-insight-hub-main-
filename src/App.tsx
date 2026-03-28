import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Compare from "./pages/Compare";
import HistoryPage from "./pages/HistoryPage";
import Architecture from "./pages/Architecture";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyDashboard from "./pages/MyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-dashboard" element={<MyDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
