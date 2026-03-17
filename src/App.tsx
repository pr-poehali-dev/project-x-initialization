
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import EditProfile from "./pages/EditProfile";
import ProjectCard from "./pages/ProjectCard";
import Events from "./pages/Events";
import ExpertLogin from "./pages/ExpertLogin";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertProjectCard from "./pages/ExpertProjectCard";
import ExpertProfile from "./pages/ExpertProfile";
import TelegramCallback from "./pages/TelegramCallback";
import AdminEvents from "./pages/AdminEvents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/projects/:id" element={<ProjectCard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/expert" element={<ExpertLogin />} />
            <Route path="/expert/dashboard" element={<ExpertDashboard />} />
            <Route path="/expert/projects/:id" element={<ExpertProjectCard />} />
            <Route path="/expert/profile" element={<ExpertProfile />} />
            <Route path="/auth/telegram/callback" element={<TelegramCallback />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
