import CourseDetailPage from "@/components/CourseDetailPage";
import { Database } from "lucide-react";

const DataEngineering = () => (
  <CourseDetailPage
    title="Data Engineering"
    tagline="Build robust data pipelines and scalable data infrastructure using modern cloud and big data technologies."
    icon={Database}
    skills={["ETL Processes", "Data Pipelines", "Cloud Data Warehousing", "Apache Spark", "SQL", "Python", "Airflow", "AWS/Azure/GCP Basics"]}
    faqs={[
      { question: "Do I need prior experience?", answer: "No, the program covers fundamentals to advanced topics so you can start from scratch." },
      { question: "What tools will I use?", answer: "You will work with SQL, Python, Apache Spark, Airflow, and cloud platforms like AWS, Azure, or GCP." },
      { question: "What's included in the hands-on project?", answer: "You'll build a complete data pipeline from ingestion to transformation and loading, simulating real job scenarios." },
      { question: "Is cloud access provided?", answer: "Yes, instructions and access details for cloud platforms are provided via the student dashboard." },
      { question: "Is a certificate provided?", answer: "Yes, you receive a certificate of completion after finishing the 8-week program and meeting all requirements. Please note that certificates are paid and not included in free/standard access." },
    ]}
  />
);

export default DataEngineering;
