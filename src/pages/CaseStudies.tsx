import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SEO from "@/components/SEO";
import { ArrowRight, BarChart2, FolderKanban, Briefcase, Shield, Database, Code } from "lucide-react";

import { LucideIcon } from "lucide-react";

interface CaseStudy {
  icon: LucideIcon;
  category: string;
  title: string;
  challenge: string;
  solution: string;
  outcome: string;
}

const caseStudies: CaseStudy[] = [
  {
    icon: BarChart2,
    category: "Data Analysis",
    title: "Sales Performance Dashboard for Retail Chain",
    challenge: "A growing retail business needed to consolidate sales data from multiple outlets and understand revenue trends, product performance, and seasonal patterns.",
    solution: "Our data analysis trainees built an interactive Power BI dashboard integrating data from Excel spreadsheets and SQL databases, featuring real-time KPI tracking, drill-down analysis by region and product category, and automated weekly reporting.",
    outcome: "The dashboard helped the business identify underperforming products and optimise inventory, resulting in a 15% improvement in stock efficiency and faster decision-making.",
  },
  {
    icon: FolderKanban,
    category: "Project Management",
    title: "Agile Transformation for a Fintech Startup",
    challenge: "A fintech startup struggled with project delays, unclear priorities, and poor team coordination across their development sprints.",
    solution: "Project management trainees implemented a full Agile/Scrum framework using Jira, including sprint planning, daily standups, retrospectives, and a clear product backlog with prioritised user stories.",
    outcome: "The team reduced their average sprint overrun from 40% to under 10% and improved feature delivery speed by 35% within three months.",
  },
  {
    icon: Briefcase,
    category: "Business Analysis",
    title: "Requirements Analysis for an E-Learning Platform",
    challenge: "An edtech company wanted to launch a new learning management system but lacked clear documentation of business requirements and user needs.",
    solution: "Business analysis trainees conducted stakeholder interviews, created detailed process maps using UML, documented functional and non-functional requirements, and delivered a comprehensive Business Requirements Document (BRD).",
    outcome: "The development team had a clear roadmap, reducing scope creep by 60% and cutting the estimated development timeline by 4 weeks.",
  },
  {
    icon: Shield,
    category: "Cybersecurity",
    title: "Security Audit for a Healthcare Provider",
    challenge: "A healthcare organisation needed to assess their network security posture and ensure compliance with data protection regulations for patient records.",
    solution: "Cybersecurity trainees performed a comprehensive vulnerability assessment using Wireshark and Kali Linux, identified critical security gaps, and delivered a prioritised remediation plan with implementation guidelines.",
    outcome: "The organisation patched 23 critical vulnerabilities and achieved compliance with data protection standards, significantly reducing their risk of a data breach.",
  },
  {
    icon: Database,
    category: "Data Engineering",
    title: "Automated ETL Pipeline for Market Research Firm",
    challenge: "A market research firm manually processed survey data from multiple sources, leading to delays in report generation and frequent data quality issues.",
    solution: "Data engineering trainees designed and built an automated ETL pipeline using Python and Apache Airflow, integrating data from CSV files, APIs, and SQL databases into a cloud data warehouse.",
    outcome: "Data processing time was reduced from 3 days to 2 hours, and data quality issues dropped by 80%, enabling the firm to deliver reports to clients significantly faster.",
  },
  {
    icon: Code,
    category: "Software Engineering",
    title: "Inventory Management System for SME",
    challenge: "A small manufacturing company relied on spreadsheets to track inventory, leading to stockouts, over-ordering, and manual errors that cost the business time and money.",
    solution: "Software engineering trainees built a web-based inventory management application using Python and modern frameworks, featuring real-time stock tracking, automated reorder alerts, and supplier management.",
    outcome: "The company eliminated manual tracking errors, reduced stockout incidents by 70%, and saved an estimated 15 hours per week in administrative work.",
  },
];

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Case Studies | Real Trainee Projects | Delvetek"
        description="Explore real-world projects delivered by Delvetek trainees across data analysis, project management, business analysis, cybersecurity, data engineering, and software engineering."
        path="/case-studies"
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">Case Studies</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Real Projects, <span className="gradient-text">Real Results</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              See how our trainees apply their skills to solve real-world problems across different industries and tech tracks.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {caseStudies.map((study) => (
              <article
                key={study.title}
                className="glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <study.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {study.category}
                    </span>
                    <h2 className="font-display text-xl font-semibold text-foreground mt-2">
                      {study.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1 text-sm uppercase tracking-wider">Challenge</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1 text-sm uppercase tracking-wider">Solution</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{study.solution}</p>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-primary mb-1 text-sm uppercase tracking-wider">Outcome</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{study.outcome}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default CaseStudies;
