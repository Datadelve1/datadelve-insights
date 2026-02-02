import { Users, Wrench, FolderOpen, HeartHandshake, Youtube, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const services = [
  {
    icon: Users,
    title: "Data Analytics One-on-One Training",
    description: "Get personalised, one-on-one data analytics training designed around your learning pace and goals. Our sessions are hands-on and interactive, giving you the space to ask questions, practise in real time, and truly understand how data analytics works in real-world scenarios, not just theory.",
  },
  {
    icon: Wrench,
    title: "Technical Skills",
    description: "Build strong foundations in the core tools every data analyst needs. You'll learn Excel, SQL, Power BI, and Python basics, while also understanding how these tools work together in real analytics workflows. Each concept is taught practically, with guided exercises you can apply immediately.",
  },
  {
    icon: FolderOpen,
    title: "Portfolio Building",
    description: "Work on real-life data projects that mirror actual workplace tasks. You'll analyse datasets, create dashboards, and present insights you can confidently showcase as work experience. By the end, you'll have projects ready to add to your CV, GitHub, and portfolio.",
  },
  {
    icon: HeartHandshake,
    title: "Flexible Learning & Support",
    description: "Learn at a pace that works for you. With personalised guidance and ongoing support, you're never left stuck or confused. We focus on building confidence, clarity, and practical problem-solving skills you can carry into interviews and real roles.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">Our Services</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Learn the Skills That Make You a <span className="gradient-text">Practical Data Analyst</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            At DataDelve, we focus on practical data skills that matter. You'll master the foundational tools — Excel for analysis, SQL for querying, Python for automation, and Power BI for reporting — through guided exercises and meaningful projects that build a polished analytics portfolio.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-8 rounded-2xl glass hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Free YouTube Courses */}
        <div className="mt-16 p-8 md:p-12 rounded-2xl glass border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/30 flex items-center justify-center flex-shrink-0">
              <Youtube className="w-10 h-10 text-destructive" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 text-foreground">
                Free YouTube Courses
              </h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
                Start learning for free! Explore our growing library of data analytics tutorials, walkthroughs, and tips on our YouTube channel. Perfect for getting a taste of what we teach.
              </p>
              <Button 
                variant="hero" 
                size="lg"
                asChild
              >
                <a 
                  href="https://www.youtube.com/@datadelveio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Watch Free Tutorials
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
