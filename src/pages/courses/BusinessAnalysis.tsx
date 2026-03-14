import CourseDetailPage from "@/components/CourseDetailPage";
import { Briefcase } from "lucide-react";

const BusinessAnalysis = () => (
  <CourseDetailPage
    title="Business Analysis"
    tagline="Bridge business needs with technical solutions through requirements gathering, process mapping, and data skills."
    icon={Briefcase}
    skills={["Requirements Gathering", "Process Mapping", "UML", "Excel", "SQL"]}
    faqs={[
      { question: "Is prior business experience required?", answer: "No, the program is designed for beginners and covers everything from fundamentals to advanced concepts." },
      { question: "How are assignments graded?", answer: "Assignments are scored automatically through the dashboard, with additional admin review for detailed feedback." },
      { question: "Will I work on real business cases?", answer: "Yes, the 2-week hands-on project includes realistic business case studies and scenarios." },
    ]}
  />
);

export default BusinessAnalysis;
