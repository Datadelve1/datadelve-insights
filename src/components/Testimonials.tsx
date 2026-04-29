import { useState, useEffect } from "react";
import { Quote, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentReview {
  full_name: string;
  written_reflection: string | null;
  video_url: string | null;
  session_day: string;
}

const staticTestimonials = [
  {
    name: "Chiamaka Nwosu",
    role: "Data Analyst, Lagos",
    content:
      "Delvetek transformed my career. I went from spreadsheet basics to building automated dashboards in just 3 months. The personalised approach made all the difference.",
    avatar: "CN",
  },
  {
    name: "Tunde Adebayo",
    role: "Business Intelligence Developer",
    content:
      "The Python for Data track was exactly what I needed. Real-world projects and patient guidance helped me land my dream BI role here in Lagos.",
    avatar: "TA",
  },
  {
    name: "Amara Okonkwo",
    role: "Junior Data Scientist",
    content:
      "From knowing nothing about SQL to confidently querying databases daily. The capstone project became the centrepiece of my portfolio.",
    avatar: "AO",
  },
  {
    name: "Ibrahim Suleiman",
    role: "Marketing Analyst, Abuja",
    content:
      "The Data Visualisation sessions opened my eyes to storytelling with data. Now I create reports that actually drive decisions at work.",
    avatar: "IS",
  },
  {
    name: "Ngozi Eze",
    role: "Financial Analyst",
    content:
      "Learning Git and GitHub for data work was a game-changer. I now collaborate seamlessly with my team and have a professional portfolio to show.",
    avatar: "NE",
  },
  {
    name: "Emeka Obi",
    role: "Operations Manager, Port Harcourt",
    content:
      "I never thought I could learn Python at my age, but the patient teaching style made it accessible. Now I automate hours of manual work weekly.",
    avatar: "EO",
  },
  {
    name: "Fatima Bello",
    role: "Data Analyst, Kano",
    content:
      "The mentors at Delvetek genuinely care. The community, live sessions and assignments kept me accountable until I landed my first data role.",
    avatar: "FB",
  },
  {
    name: "Oluwaseun Adekunle",
    role: "BI Developer, Ibadan",
    content:
      "Best decision I made this year. The curriculum is practical and tailored for the Nigerian job market. Highly recommend to anyone serious about data.",
    avatar: "OA",
  },
];

const Testimonials = () => {
  const [studentReviews, setStudentReviews] = useState<StudentReview[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      // Anon policy now filters: Friday written reviews auto-show, Saturday only if approved
      const { data } = await supabase
        .from("weekly_reviews")
        .select("full_name, written_reflection, video_url, session_day" as any)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setStudentReviews(
          (data as any[]).filter(
            (r) =>
              (r.written_reflection && r.written_reflection.trim().length > 20) ||
              r.video_url
          )
        );
      }
    };
    fetchReviews();
  }, []);

  // Build testimonials: static + written reviews + approved video reviews
  const allTestimonials = [
    ...staticTestimonials.map((t) => ({
      name: t.name,
      role: t.role,
      content: t.content,
      avatar: t.avatar,
      videoUrl: null as string | null,
    })),
    ...studentReviews.map((r) => ({
      name: r.full_name,
      role: "Delvetek Student",
      content: r.written_reflection || "Watch my video review!",
      avatar: r.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      videoUrl: r.video_url,
    })),
  ];

  return (
    <>
      <section id="testimonials" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium mb-4 block">Testimonials</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              What Our <span className="gradient-text">Students Say</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Real stories from professionals who transformed their data careers.
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-12">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {allTestimonials.map((testimonial, idx) => (
                  <CarouselItem
                    key={`${testimonial.name}-${idx}`}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="h-full p-8 rounded-2xl glass hover:bg-card/80 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 relative">
                      <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />

                      <p className="text-muted-foreground leading-relaxed mb-6 relative z-10 line-clamp-6">
                        "{testimonial.content}"
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-foreground">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                        {testimonial.videoUrl && (
                          <button
                            onClick={() => setPlayingVideo(testimonial.videoUrl)}
                            className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
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

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="bg-card border-border max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-display text-foreground">Student Video Review</DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-2">
            {playingVideo && (
              <video src={playingVideo} controls autoPlay className="w-full rounded-lg bg-black" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Testimonials;
