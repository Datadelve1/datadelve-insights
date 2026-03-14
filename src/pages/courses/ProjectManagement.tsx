import CourseDetailPage from "@/components/CourseDetailPage";
import { FolderKanban } from "lucide-react";

const ProjectManagement = () => (
  <CourseDetailPage
    title="Project Management"
    tagline="Learn PRINCE2, Agile, and Scrum frameworks to manage projects confidently in any industry."
    icon={FolderKanban}
    skills={["PRINCE2", "Agile", "Scrum", "Project Planning", "Risk Management", "MS Project", "Jira", "Trello"]}
    faqs={[
      { question: "Who is this course for?", answer: "Students, NYSC members, career switchers, and working professionals looking to break into or advance in project management." },
      { question: "Do I need prior project experience?", answer: "No, this course is beginner-friendly and covers fundamentals through advanced techniques." },
      { question: "What tools will I use?", answer: "MS Project, Jira, and Trello for hands-on project planning and tracking." },
      { question: "Will I earn any certifications or badges?", answer: "Yes, you receive a certificate of completion including PRINCE2 and Agile badges." },
    ]}
  />
);

export default ProjectManagement;
