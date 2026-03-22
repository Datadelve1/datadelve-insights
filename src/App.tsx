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
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import StudentTracking from "./pages/admin/StudentTracking";
import WeeklyReports from "./pages/admin/WeeklyReports";
import VideoManagement from "./pages/admin/VideoManagement";
import StudentVideos from "./pages/admin/StudentVideos";
import ComingSoon from "./pages/admin/ComingSoon";
import AssignmentManagement from "./pages/admin/AssignmentManagement";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DataAnalysis from "./pages/courses/DataAnalysis";
import ProjectManagement from "./pages/courses/ProjectManagement";
import BusinessAnalysis from "./pages/courses/BusinessAnalysis";
import Cybersecurity from "./pages/courses/Cybersecurity";
import SoftwareEngineering from "./pages/courses/SoftwareEngineering";
import DataEngineering from "./pages/courses/DataEngineering";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Blog from "./pages/Blog";
import CaseStudies from "./pages/CaseStudies";
import ComingSoonPage from "./pages/ComingSoon";

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
            <Route path="/courses/data-analysis" element={<DataAnalysis />} />
            <Route path="/courses/project-management" element={<ProjectManagement />} />
            <Route path="/courses/business-analysis" element={<BusinessAnalysis />} />
            <Route path="/courses/cybersecurity" element={<Cybersecurity />} />
            <Route path="/courses/software-engineering" element={<SoftwareEngineering />} />
            <Route path="/courses/data-engineering" element={<DataEngineering />} />
            <Route path="/webinar" element={<Webinar />} />
            <Route path="/ambassador" element={<AmbassadorForm />} />
            <Route path="/commitment" element={<CommitmentForm />} />
            <Route path="/weekly-review" element={<WeeklyReviewForm />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/commitment" element={<DashboardCommitment />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="students" element={<StudentTracking />} />
              <Route path="reports" element={<WeeklyReports />} />
              <Route path="videos" element={<VideoManagement />} />
              <Route path="student-videos" element={<StudentVideos />} />
              <Route path="assignments" element={<AssignmentManagement />} />
              <Route path="certificates" element={<ComingSoon />} />
              <Route path="ambassadors" element={<ComingSoon />} />
              <Route path="notifications" element={<ComingSoon />} />
            </Route>
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
