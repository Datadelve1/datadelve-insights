import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Unsubscribe from "./pages/Unsubscribe";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Webinar from "./pages/Webinar";
import AmbassadorSignup from "./pages/AmbassadorSignup";
import ReferrerTracking from "./pages/ReferrerTracking";
import CommitmentForm from "./pages/CommitmentForm";
import WeeklyReviewForm from "./pages/WeeklyReviewForm";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardCommitment from "./pages/DashboardCommitment";
import StudentProjects from "./pages/StudentProjects";
import StudentProjectDetail from "./pages/StudentProjectDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import StudentTracking from "./pages/admin/StudentTracking";
import WeeklyReports from "./pages/admin/WeeklyReports";
import VideoManagement from "./pages/admin/VideoManagement";
import StudentVideos from "./pages/admin/StudentVideos";
import StorageManager from "./pages/admin/StorageManager";
import ComingSoon from "./pages/admin/ComingSoon";
import CertificateManagement from "./pages/admin/CertificateManagement";
import AssignmentManagement from "./pages/admin/AssignmentManagement";
import DatasetManagement from "./pages/admin/DatasetManagement";
import EnrollmentManagement from "./pages/admin/EnrollmentManagement";
import AmbassadorManagement from "./pages/admin/AmbassadorManagement";
import ReviewQuestions from "./pages/admin/ReviewQuestions";
import ResetPassword from "./pages/ResetPassword";
import EnrollmentCallback from "./pages/EnrollmentCallback";
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
import StaffLogin from "./pages/StaffLogin";
import StaffChangePassword from "./pages/StaffChangePassword";
import StaffOnboarding from "./pages/StaffOnboarding";
import StaffDashboard from "./pages/StaffDashboard";
import StaffAdminDashboard from "./pages/StaffAdminDashboard";
import EnrollHub from "./pages/EnrollHub";
import EnrollTier from "./pages/EnrollTier";
import RouteTracker from "./components/RouteTracker";
import StaffOpsLayout from "./components/ops/StaffOpsLayout";
import OpsDashboard from "./pages/ops/OpsDashboard";
import OpsCalendar from "./pages/ops/OpsCalendar";
import OpsTrainingSchedule from "./pages/ops/OpsTrainingSchedule";
import OpsCohorts from "./pages/ops/OpsCohorts";
import OpsCohortDetail from "./pages/ops/OpsCohortDetail";
import OpsCommunications from "./pages/ops/OpsCommunications";
import OpsTasks from "./pages/ops/OpsTasks";
import OpsActivity from "./pages/ops/OpsActivity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RouteTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses/data-analysis" element={<DataAnalysis />} />
            <Route path="/courses/project-management" element={<ProjectManagement />} />
            <Route path="/courses/business-analysis" element={<BusinessAnalysis />} />
            <Route path="/courses/cybersecurity" element={<Cybersecurity />} />
            <Route path="/courses/software-engineering" element={<SoftwareEngineering />} />
            <Route path="/courses/data-engineering" element={<DataEngineering />} />
            <Route path="/webinar" element={<Webinar />} />
            <Route path="/ambassador" element={<AmbassadorSignup />} />
            <Route path="/become-ambassador" element={<AmbassadorSignup />} />
            <Route path="/track/:code" element={<ReferrerTracking />} />
            <Route path="/commitment" element={<CommitmentForm />} />
            <Route path="/weekly-review" element={<WeeklyReviewForm />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/commitment" element={<DashboardCommitment />} />
            <Route path="/dashboard/projects" element={<StudentProjects />} />
            <Route path="/dashboard/projects/:slug" element={<StudentProjectDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="students" element={<StudentTracking />} />
              <Route path="reports" element={<WeeklyReports />} />
              <Route path="videos" element={<VideoManagement />} />
              <Route path="student-videos" element={<StudentVideos />} />
              <Route path="storage" element={<StorageManager />} />
              <Route path="assignments" element={<AssignmentManagement />} />
              <Route path="datasets" element={<DatasetManagement />} />
              <Route path="enrollments" element={<EnrollmentManagement />} />
              <Route path="ambassadors" element={<AmbassadorManagement />} />
              <Route path="referrers" element={<AmbassadorManagement />} />
              <Route path="review-questions" element={<ReviewQuestions />} />
              <Route path="certificates" element={<CertificateManagement />} />
              <Route path="notifications" element={<ComingSoon />} />
              <Route path="staff" element={<StaffAdminDashboard />} />
            </Route>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/enrollment-callback" element={<EnrollmentCallback />} />
            <Route path="/enroll" element={<EnrollHub />} />
            <Route path="/enroll/:tier" element={<EnrollTier />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/change-password" element={<StaffChangePassword />} />
            <Route path="/staff/onboarding" element={<StaffOnboarding />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/ops" element={<StaffOpsLayout />}>
              <Route index element={<OpsDashboard />} />
              <Route path="calendar" element={<OpsCalendar />} />
              <Route path="cohorts" element={<OpsCohorts />} />
              <Route path="cohorts/:id" element={<OpsCohortDetail />} />
              <Route path="emails" element={<OpsCommunications />} />
              <Route path="tasks" element={<OpsTasks />} />
              <Route path="activity" element={<OpsActivity />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
