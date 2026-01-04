import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  {
    name: "Michael Torres",
    role: "Marketing Analyst",
    content: "The Data Visualization course opened my eyes to storytelling with data. Now I create reports that actually drive decisions.",
    avatar: "MT",
  },
  {
    name: "Emily Watson",
    role: "Financial Analyst",
    content: "Learning Git and GitHub for data work was a game-changer. I now collaborate seamlessly with my team and have a professional portfolio to show.",
    avatar: "EW",
  },
  {
    name: "David Park",
    role: "Operations Manager",
    content: "I never thought I could learn Python at my age, but the patient teaching style made it accessible. Now I automate hours of manual work.",
    avatar: "DP",
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

        {/* Testimonials Carousel */}
        <div className="max-w-6xl mx-auto px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.name} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full p-8 rounded-2xl glass hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 relative">
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
