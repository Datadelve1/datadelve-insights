import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BarChart2, FolderKanban, Shield, Code, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    icon: BarChart2,
    title: "Data Analysis",
    description: "Master data analysis with SQL, Excel, Power BI, and visualization tools.",
    href: "/courses/data-analysis",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Learn PRINCE2, Agile, Scrum, and modern project management frameworks.",
    href: "/courses/project-management",
  },
  {
    icon: Briefcase,
    title: "Business Analysis",
    description: "Bridge business needs with technical solutions effectively.",
    href: "/courses/business-analysis",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Protect systems and data with security best practices.",
    href: "/courses/cybersecurity",
  },
  {
    icon: Code,
    title: "Software Engineering",
    description: "Build scalable applications with modern development practices.",
    href: "/courses/software-engineering",
  },
];

const DelveSchool = () => {
  const { toast } = useToast();

  const handleExploreCourses = () => {
    toast({
      title: "Coming Soon! 🚀",
      description: "Delve School courses are launching soon. Stay tuned!",
    });
  };

  return (
    <section id="delve-school" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">New Product</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Introducing <span className="gradient-text">Delve School</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            6 weeks of live training plus a 2-week hands-on project. 
            From data analysis to software engineering, build the skills you need for your tech career.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.title}
              className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <course.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {course.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Self-paced learning with lifetime access • Start anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default DelveSchool;
