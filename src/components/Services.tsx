import { Database, LineChart, GitBranch, Code2, Target, Lightbulb } from "lucide-react";

const services = [
  {
    icon: Database,
    title: "Data Fundamentals",
    description: "Master the basics of data management, Excel, SQL, and database design with hands-on exercises.",
  },
  {
    icon: LineChart,
    title: "Data Visualization",
    description: "Learn to create compelling visualizations using tools like Tableau, Power BI, and Python.",
  },
  {
    icon: Code2,
    title: "Python for Data",
    description: "Build powerful data pipelines and automate analysis with Python and pandas.",
  },
  {
    icon: GitBranch,
    title: "Git & GitHub for Data",
    description: "Learn version control, collaboration workflows, and portfolio building for data professionals.",
  },
  {
    icon: Target,
    title: "Business Intelligence",
    description: "Transform raw data into actionable insights that drive business decisions.",
  },
  {
    icon: Lightbulb,
    title: "Career Coaching",
    description: "Get guidance on building your data career, portfolio reviews, and interview prep.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">Our Services</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Personalized Training <span className="gradient-text">Programs</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every session is tailored to your goals, experience level, and learning style.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
