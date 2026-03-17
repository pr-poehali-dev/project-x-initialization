
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import EditProfile from "./pages/EditProfile";
import ProjectCard from "./pages/ProjectCard";
import Events from "./pages/Events";
import ExpertLogin from "./pages/ExpertLogin";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertProjectCard from "./pages/ExpertProjectCard";
import TelegramCallback from "./pages/TelegramCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/projects/:id" element={<ProjectCard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/expert" element={<ExpertLogin />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/projects/:id" element={<ExpertProjectCard />} />
          <Route path="/auth/telegram/callback" element={<TelegramCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;