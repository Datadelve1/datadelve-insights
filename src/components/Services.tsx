import { Users, Wrench, FolderOpen, HeartHandshake } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Data Analytics One-on-One Training",
    description: "Get personalised, one-on-one data analytics training designed around your learning pace and goals. Our sessions are hands-on and interactive, giving you the space to ask questions, practise in real time, and truly understand how data analytics works in real-world scenarios — not just theory.",
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
            Learn the Skills That Make You a <span className="gradient-text">Data Analyst</span> — Practically
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
      </div>
    </section>
  );
};

export default Services;
