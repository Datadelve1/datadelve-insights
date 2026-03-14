import CourseDetailPage from "@/components/CourseDetailPage";
import { Code } from "lucide-react";

const SoftwareEngineering = () => (
  <CourseDetailPage
    title="Software Engineering"
    tagline="Build scalable applications with modern development practices, from programming fundamentals to real-world projects."
    icon={Code}
    skills={["Programming Fundamentals", "Python", "Java", "Git/GitHub", "Database Basics", "Agile Development"]}
    faqs={[
      { question: "Do I need coding experience?", answer: "No, the program starts with fundamentals and progresses to advanced topics." },
      { question: "What kind of projects will I work on?", answer: "Small real-world applications that demonstrate your ability to build functional software." },
      { question: "Are all tools provided?", answer: "Yes, step-by-step installation instructions for all required tools are included in the dashboard." },
    ]}
  />
);

export default SoftwareEngineering;
