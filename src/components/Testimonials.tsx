import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Data Analyst at TechCorp",
    content: "DataDelve transformed my career. I went from spreadsheet basics to building automated dashboards in just 3 months. The personalized approach made all the difference.",
    avatar: "SM",
  },
  {
    name: "James Chen",
    role: "Business Intelligence Developer",
    content: "The Python for Data course was exactly what I needed. Real-world projects and patient guidance helped me land my dream job in BI.",
    avatar: "JC",
  },
  {
    name: "Amara Okonkwo",
    role: "Junior Data Scientist",
    content: "From knowing nothing about SQL to confidently querying databases daily. The capstone project became the centerpiece of my portfolio.",
    avatar: "AO",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">Testimonials</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            What Our <span className="gradient-text">Students Say</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from professionals who transformed their data careers.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group p-8 rounded-2xl glass hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
              
              <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
