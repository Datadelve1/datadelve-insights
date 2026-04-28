import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Rocket } from "lucide-react";

const TIERS = [
  {
    slug: "beginner",
    title: "Beginner",
    description: "Start your tech journey with foundational skills and guided learning.",
    price: "₦10,000",
    icon: GraduationCap,
  },
  {
    slug: "professional",
    title: "Professional",
    description: "Level up with industry-relevant projects and mentorship.",
    price: "₦50,000",
    icon: Briefcase,
  },
  {
    slug: "advanced",
    title: "Advanced",
    description: "Master advanced concepts and prepare for senior roles.",
    price: "₦100,000",
    icon: Rocket,
  },
];

const EnrollHub = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
            Choose Your Track
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Select an enrollment tier to continue
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map(({ slug, title, description, price, icon: Icon }) => (
            <Card
              key={slug}
              className="flex flex-col border-border bg-card hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <div className="text-2xl font-display font-bold text-primary">{price}</div>
                <Button asChild variant="hero" size="lg" className="w-full">
                  <Link to={`/enroll/${slug}`}>Enroll Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnrollHub;
