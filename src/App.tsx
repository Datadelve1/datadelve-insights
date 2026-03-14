import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Webinar from "./pages/Webinar";
import AmbassadorForm from "./pages/AmbassadorForm";
import CommitmentForm from "./pages/CommitmentForm";
import WeeklyReviewForm from "./pages/WeeklyReviewForm";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardCommitment from "./pages/DashboardCommitment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/webinar" element={<Webinar />} />
            <Route path="/ambassador" element={<AmbassadorForm />} />
            <Route path="/commitment" element={<CommitmentForm />} />
            <Route path="/weekly-review" element={<WeeklyReviewForm />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/commitment" element={<DashboardCommitment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
