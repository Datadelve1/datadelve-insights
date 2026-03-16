import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const blogPosts = [
  {
    title: "Getting Started with Data Analysis: A Beginner's Guide",
    excerpt: "Data analysis is one of the most in-demand skills in tech today. Learn how to start your journey with SQL, Excel, and Power BI — the essential tools every data analyst needs.",
    category: "Data Analysis",
    date: "March 10, 2026",
    slug: "#",
  },
  {
    title: "Why Project Management is the Backbone of Every Tech Team",
    excerpt: "From Agile sprints to PRINCE2 frameworks, discover how project management skills can transform your career and make you invaluable in any organisation.",
    category: "Project Management",
    date: "March 8, 2026",
    slug: "#",
  },
  {
    title: "Business Analysis: Bridging the Gap Between Business and Technology",
    excerpt: "Business analysts are the translators between stakeholders and development teams. Learn what it takes to master requirements gathering, process mapping, and stakeholder management.",
    category: "Business Analysis",
    date: "March 5, 2026",
    slug: "#",
  },
  {
    title: "Cybersecurity Fundamentals: Protecting Digital Assets in 2026",
    excerpt: "With cyber threats on the rise, cybersecurity skills are more critical than ever. Explore the fundamentals of network security, ethical hacking, and risk assessment.",
    category: "Cybersecurity",
    date: "March 3, 2026",
    slug: "#",
  },
  {
    title: "Data Engineering: Building the Infrastructure Behind AI and Analytics",
    excerpt: "Data engineers are the unsung heroes of the data world. Learn about ETL processes, data pipelines, and cloud data warehousing — the foundation of modern data systems.",
    category: "Data Engineering",
    date: "February 28, 2026",
    slug: "#",
  },
  {
    title: "Software Engineering: From Code to Career in 2026",
    excerpt: "Software engineering remains one of the most rewarding tech careers. Discover the programming languages, frameworks, and development practices that employers are looking for.",
    category: "Software Engineering",
    date: "February 25, 2026",
    slug: "#",
  },
  {
    title: "How to Build a Portfolio That Gets You Hired",
    excerpt: "Your portfolio is your strongest asset when job hunting. Learn how to create compelling projects that showcase your skills across data analysis, software development, and more.",
    category: "Career Tips",
    date: "February 20, 2026",
    slug: "#",
  },
  {
    title: "The Power of Structured Learning: Why Self-Paced Isn't Always Better",
    excerpt: "While self-paced learning has its place, structured training with mentorship and accountability often produces better outcomes. Here's why Delvetek's approach works.",
    category: "Learning",
    date: "February 15, 2026",
    slug: "#",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">Our Blog</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Insights & <span className="gradient-text">Resources</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest trends, tips, and insights across all our tech learning tracks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <article
                key={post.title}
                className="group glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                  <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
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

export default Blog;
