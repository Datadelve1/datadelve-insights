import CourseDetailPage from "@/components/CourseDetailPage";
import { Shield } from "lucide-react";

const Cybersecurity = () => (
  <CourseDetailPage
    title="Cybersecurity"
    tagline="Protect systems and data with hands-on training in network security, ethical hacking, and penetration testing."
    icon={Shield}
    skills={["Network Security", "Ethical Hacking", "Penetration Testing", "Wireshark", "Kali Linux", "Risk Assessment"]}
    faqs={[
      { question: "Who can take this course?", answer: "Students, NYSC members, career switchers, and working professionals interested in cybersecurity." },
      { question: "Are any software installations required?", answer: "Yes, detailed instructions for all required tools are provided via the student dashboard." },
      { question: "What is covered in the hands-on project?", answer: "Realistic cybersecurity scenarios including vulnerability assessments and security audits." },
    ]}
  />
);

export default Cybersecurity;
