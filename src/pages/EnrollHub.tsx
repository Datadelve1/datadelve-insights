import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Check,
  X,
  AlertTriangle,
  Briefcase,
  Rocket,
  GraduationCap,
  FileText,
  Linkedin,
  Users,
  Quote,
  TrendingUp,
  Award,
  Building2,
  CreditCard,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EnrollHub = () => {
  const scrollToTracks = () => {
    document.getElementById("tracks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-background">
      {/* Sticky Top CTA Bar */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg border-b border-primary/30">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm font-semibold text-center sm:text-left">
            🔥 Cohort 2 enrolling now • Limited seats • Starts June 5
          </p>
          <Button
            onClick={scrollToTracks}
            size="sm"
            variant="secondary"
            className="font-bold whitespace-nowrap shadow-md hover:scale-105 transition-transform"
          >
            Enroll Now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10 py-12 md:py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Cohort 2 Enrollment</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Choose Your <span className="gradient-text">Delvetek</span> Track
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Pick the path that matches your goals. All tracks start June 5 • Live online • Virtual Graduation 🎓
          </p>

          {/* Hero Enroll CTA */}
          <Button
            onClick={scrollToTracks}
            variant="hero"
            size="lg"
            className="text-base md:text-lg px-8 py-6 font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-transform animate-pulse"
          >
            Enroll Now <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Quick & easy · Pay → WhatsApp proof → You're in
          </p>
        </div>

        {/* Anchor for tracks */}
        <div id="tracks" className="scroll-mt-24" />

        {/* Track Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* BEGINNER */}
          <div className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Start Your Data Career from Scratch
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Beginner Track</p>

            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦150,000</span>
              <div className="text-xl font-bold text-primary">
                FREE <span className="text-xs font-normal text-muted-foreground">(This Cohort Only)</span>
              </div>
              <p className="text-sm text-foreground mt-1">
                Commitment Fee: <span className="font-semibold">₦10,000</span>
              </p>
            </div>

            <ul className="space-y-2 mb-4 flex-1">
              {[
                "SQL (Fundamentals)",
                "Excel (Fundamentals)",
                "Power BI (Fundamentals)",
                "Weekly assignments",
                "Collaborative projects",
                "Breakout sessions with tutors",
                "Live Q&A support",
                "Personal dashboard to track progress",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Build a strong foundation in data analysis</p>
            <p className="text-xs text-muted-foreground mb-1">Perfect for absolute beginners</p>
            <p className="text-xs text-muted-foreground mb-3">🎓 8-week program • Virtual Graduation</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button asChild variant="hero" size="lg" className="w-full group/btn">
              <Link to="/enroll/beginner">
                Enroll in Beginner Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* PROFESSIONAL */}
          <div className="group p-6 rounded-2xl glass border-2 border-primary/50 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Most Popular
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Become a Data Analyst in 12 Weeks — From Beginner to Advanced
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Professional Track</p>

            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦275,000</span>
              <div className="text-xl font-bold text-primary">Discount Applied</div>
              <p className="text-sm text-foreground mt-1">
                Commitment Fee: <span className="font-semibold">₦50,000</span>
              </p>
            </div>

            <ul className="space-y-2 mb-4 flex-1">
              {[
                "SQL (Beginner to Advanced)",
                "Excel (Beginner to Advanced)",
                "Power BI (Beginner to Advanced)",
                "Real-world projects",
                "Portfolio development",
                "Case studies",
                "Hands-on training",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-2 text-sm font-medium text-foreground">
                <Rocket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Bonus: UK Work Experience Exposure
              </li>
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Become job-ready with a strong portfolio</p>
            <p className="text-xs text-muted-foreground mb-1">
              No prior experience needed — includes beginner to advanced training
            </p>
            <p className="text-xs text-muted-foreground mb-3">🎓 12-week program • Virtual Graduation</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button asChild variant="hero" size="lg" className="w-full group/btn">
              <Link to="/enroll/professional">
                Enroll in Professional Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* ADVANCED */}
          <div className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              The Fastest Path to Becoming Job-Ready in Tech
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Advanced Track</p>

            <div className="mb-4">
              <span className="text-muted-foreground line-through text-sm">₦350,000</span>
              <div className="text-xl font-bold text-primary">Discount Applied</div>
              <p className="text-sm text-foreground mt-1">
                Commitment Fee: <span className="font-semibold">₦100,000</span>
              </p>
            </div>

            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Full Learning Path</p>
            <ul className="space-y-2 mb-4">
              {["SQL (Beginner to Advanced)", "Excel (Beginner to Advanced)", "Power BI (Beginner to Advanced)"].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ),
              )}
            </ul>

            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Internship</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                3-Month Internship with DelveTek (Non-paid)
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Work with real company data
              </li>
            </ul>

            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Career Acceleration</p>
            <ul className="space-y-2 mb-4 flex-1">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-foreground">DelveTek Smart CV Engine</span>
                  <span className="block text-xs mt-0.5">
                    Upload CV → Paste job description → Auto-optimized CV → Admin review → Delivered via Email/WhatsApp
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Linkedin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                LinkedIn Optimization
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Interview Preparation
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                Job Referrals to partner companies
              </li>
            </ul>

            <p className="text-sm font-medium text-foreground mb-1">Go from beginner to fully job-positioned</p>
            <p className="text-xs text-muted-foreground italic mb-1">
              We don't guarantee jobs — but we position you strongly to get one
            </p>
            <p className="text-xs text-muted-foreground mb-3">🎓 12-week program • Virtual Graduation</p>

            <div className="flex items-center gap-1.5 text-xs text-yellow-500 mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Limited to 250 students
            </div>

            <Button asChild variant="hero" size="lg" className="w-full group/btn">
              <Link to="/enroll/advanced">
                Enroll in Advanced Track
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            All tracks start June 5 • Live online sessions • Virtual Graduation 🎓 • Certificate upon completion (paid)
          </p>
        </div>

        {/* ===== TIER COMPARISON TABLE ===== */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium mb-3 block text-sm">Compare Tracks</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              Find the <span className="gradient-text">Right Fit</span>
            </h2>
          </div>
          <div className="rounded-2xl glass border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card/50">
                  <TableHead className="text-foreground font-semibold">Feature</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Beginner</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Professional</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Advanced</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Commitment Fee", "₦10,000", "₦50,000", "₦100,000"],
                  ["Program Duration", "8 weeks", "12 weeks", "12 weeks + 3mo internship"],
                  ["SQL Training", "Fundamentals", "Beginner → Advanced", "Beginner → Advanced"],
                  ["Excel Training", "Fundamentals", "Beginner → Advanced", "Beginner → Advanced"],
                  ["Power BI Training", "Fundamentals", "Beginner → Advanced", "Beginner → Advanced"],
                  ["Real-world Projects", false, true, true],
                  ["Portfolio Development", false, true, true],
                  ["UK Work Experience Exposure", false, true, true],
                  ["3-Month DelveTek Internship", false, false, true],
                  ["Smart CV Engine", false, false, true],
                  ["LinkedIn Optimization", false, false, true],
                  ["Interview Preparation", false, false, true],
                  ["Job Referrals", false, false, true],
                  ["Virtual Graduation", true, true, true],
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-foreground">{row[0]}</TableCell>
                    {row.slice(1).map((cell, j) => (
                      <TableCell key={j} className="text-center">
                        {typeof cell === "boolean" ? (
                          cell ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{cell}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ===== STUDENT OUTCOMES ===== */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium mb-3 block text-sm">Real Results</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              Student <span className="gradient-text">Outcomes</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: "500+", label: "Students Trained" },
              { icon: TrendingUp, value: "87%", label: "Completion Rate" },
              { icon: Briefcase, value: "120+", label: "Job-Ready Graduates" },
              { icon: Award, value: "4.9/5", label: "Student Rating" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl glass border border-border/50 text-center hover:border-primary/30 transition-all"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TESTIMONIALS ===== */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium mb-3 block text-sm">Testimonials</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              What Our <span className="gradient-text">Students Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Chiamaka Nwosu",
                role: "Data Analyst, Lagos",
                content:
                  "Delvetek transformed my career. I went from spreadsheet basics to building automated dashboards in just 3 months.",
                avatar: "CN",
              },
              {
                name: "Tunde Adebayo",
                role: "BI Developer, Ibadan",
                content:
                  "The hands-on projects and patient guidance helped me land my dream BI role. Best investment I've made.",
                avatar: "TA",
              },
              {
                name: "Amara Okonkwo",
                role: "Junior Data Scientist, Enugu",
                content:
                  "From zero SQL knowledge to confidently querying production databases. The capstone became my portfolio centerpiece.",
                avatar: "AO",
              },
              {
                name: "Ibrahim Suleiman",
                role: "Marketing Analyst, Abuja",
                content:
                  "The Data Visualisation track helped me tell stories with data. My reports now drive real decisions at work.",
                avatar: "IS",
              },
              {
                name: "Ngozi Eze",
                role: "Financial Analyst, Onitsha",
                content:
                  "Learning Python and Git changed how I work. I automate hours of reporting weekly and collaborate like a pro.",
                avatar: "NE",
              },
              {
                name: "Fatima Bello",
                role: "Data Analyst, Kano",
                content:
                  "The mentors genuinely care. Live sessions and assignments kept me accountable till I landed my first data role.",
                avatar: "FB",
              },
              {
                name: "Emeka Obi",
                role: "Operations Lead, Port Harcourt",
                content:
                  "I never thought I could learn Python at my age. The patient teaching made it accessible and practical.",
                avatar: "EO",
              },
              {
                name: "Halima Yakubu",
                role: "Business Analyst, Kaduna",
                content:
                  "Practical, hands-on and tailored for the Nigerian job market. I recommend Delvetek to anyone serious about tech.",
                avatar: "HY",
              },
              {
                name: "Oluwaseun Adekunle",
                role: "BI Developer, Lagos",
                content:
                  "Best decision I made this year. The curriculum is structured, the community is supportive, and the outcomes are real.",
                avatar: "OA",
              },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl glass border border-border/50 relative">
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== PARTNER LOGOS ===== */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-primary font-medium mb-3 block text-sm">Trusted By</span>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-muted-foreground">
              Our graduates work at leading companies
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Microsoft", "Andela", "Flutterwave", "Interswitch", "PwC"].map((partner) => (
              <div
                key={partner}
                className="p-6 rounded-xl glass border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all"
              >
                <Building2 className="w-5 h-5 text-primary mr-2" />
                <span className="font-display font-semibold text-foreground text-sm md:text-base">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== HOW TO PAY ===== */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl glass border border-primary/30">
            <div className="text-center mb-6">
              <CreditCard className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">How to Pay</h2>
              <p className="text-muted-foreground text-sm">
                Click <span className="text-foreground font-medium">Enroll</span> on your chosen track. You'll see our bank details on the final step. Make a transfer, then send your proof of payment to us on WhatsApp for confirmation.
              </p>
            </div>
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 space-y-2 text-sm max-w-sm mx-auto">
              <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="text-foreground font-medium">Wema Bank</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span><span className="text-foreground font-mono font-bold">0127561293</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="text-foreground font-medium">Delvetek Limited</span></div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              After payment, send proof to WhatsApp <span className="text-foreground font-medium">+44 7775 739225</span>. Your dashboard login is emailed once we confirm.
            </p>
          </div>
        </div>

        {/* ===== ENROLLMENT FAQ ===== */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary font-medium mb-3 block text-sm">Enrollment FAQ</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold">
              Got <span className="gradient-text">Questions?</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "What is the commitment fee for?",
                a: "The commitment fee secures your seat in the cohort and demonstrates your dedication. It's non-refundable and counts toward unlocking your full learning experience.",
              },
              {
                q: "When does Cohort 2 start?",
                a: "All tracks officially begin on June 5. Live sessions are held on Fridays and Saturdays (3 hours each), delivered online through your student dashboard.",
              },
              {
                q: "What's the difference between the tracks?",
                a: "Beginner covers fundamentals only. Professional takes you from beginner to advanced with real projects. Advanced adds a 3-month internship, Smart CV Engine, LinkedIn optimization, interview prep, and job referrals.",
              },
              {
                q: "Do I need any prior experience?",
                a: "No prior experience is required for any track. We meet you where you are and build from the ground up.",
              },
              {
                q: "How do I pay?",
                a: "Click Enroll on your chosen track. On the final step, you'll see our bank details (Wema Bank · 0127561293 · Delvetek Limited). Transfer the commitment fee, then send your proof of payment to WhatsApp +44 7775 739225 for confirmation.",
              },
              {
                q: "Is the certificate included?",
                a: "The certificate of completion costs ₦10,000 and is paid separately at the end of the program.",
              },
              {
                q: "What happens if I miss a class?",
                a: "All sessions are recorded and accessible through your dashboard after you submit your weekly review.",
              },
              {
                q: "Do you guarantee jobs?",
                a: "We don't guarantee jobs, but our Advanced track positions you strongly with portfolio projects, interview prep, LinkedIn optimization, and direct job referrals to partner companies.",
              },
            ].map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl glass border border-border/50 px-5"
              >
                <AccordionTrigger className="text-left text-foreground font-medium hover:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* ===== FINAL CTA ===== */}
        <div className="mt-24 max-w-3xl mx-auto text-center p-10 rounded-2xl glass border border-primary/30">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Ready to <span className="gradient-text">Transform</span> Your Career?
          </h2>
          <p className="text-muted-foreground mb-6">
            Seats fill fast. Lock in your spot today and start your data journey June 5.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/enroll/professional">
              Enroll Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EnrollHub;
