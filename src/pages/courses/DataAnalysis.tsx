import CourseDetailPage from "@/components/CourseDetailPage";
import { BarChart2 } from "lucide-react";

const DataAnalysis = () => (
  <CourseDetailPage
    title="Data Analysis"
    tagline="Master data analysis from fundamentals to advanced, and build a portfolio of real-world projects."
    icon={BarChart2}
    registrationClosed
    skills={["SQL", "Excel", "Power BI", "Data Cleaning", "Visualization", "Reporting"]}
    faqs={[
      { question: "Do I need prior experience?", answer: "No, the program covers fundamentals to advanced topics so you can start from scratch." },
      { question: "How do I access class recordings?", answer: "Recordings are available on your student dashboard after you submit your weekly review." },
      { question: "What's included in the hands-on project?", answer: "Real-world data exercises that simulate actual job scenarios, giving you practical portfolio pieces." },
      { question: "What tools will I use?", answer: "You will work with SQL, Excel, Power BI, and learn data cleaning, visualization, and reporting techniques." },
      { question: "Is a certificate provided?", answer: "Yes, you receive a certificate of completion after finishing the 8-week program and meeting all requirements. Please note that certificates are paid and not included in free/standard access." },
    ]}
  />
);

export default DataAnalysis;
