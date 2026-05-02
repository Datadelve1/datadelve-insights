import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// 👉 Replace this with your Trustpilot business URL once your profile is live.
// Example: https://www.trustpilot.com/review/delvetek.io
const TRUSTPILOT_URL = "https://www.trustpilot.com/evaluate/delvetek.io";
const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/delvetek.io";

const TrustpilotCTA = () => {
  return (
    <section id="trustpilot" className="py-20 bg-card/30 border-y border-border/50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-7 h-7 fill-primary text-primary"
                strokeWidth={1.5}
              />
            ))}
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved Delvetek? <span className="text-primary">Tell the world.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your feedback helps other learners take the leap into tech. Drop a quick review on
            Trustpilot — it takes less than a minute and means the world to us.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="hero" size="lg">
              <a
                href={TRUSTPILOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Leave a review for Delvetek on Trustpilot"
              >
                <Star className="w-5 h-5 fill-current" />
                Review us on Trustpilot
              </a>
            </Button>

            <Button asChild variant="hero-outline" size="lg">
              <a
                href={TRUSTPILOT_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Read Delvetek reviews on Trustpilot"
              >
                Read reviews
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Powered by Trustpilot — independent, verified reviews.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustpilotCTA;
