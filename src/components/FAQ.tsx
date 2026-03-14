import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is Delvetek training for?",
    answer: "Students, undergraduates, graduates, NYSC members, career switchers, and working professionals looking to build or advance their tech skills.",
  },
  {
    question: "Do I need prior experience?",
    answer: "No, all our programs cover fundamentals to advanced levels. We meet you where you are, regardless of your current skill level.",
  },
  {
    question: "How are the sessions delivered?",
    answer: "All sessions are delivered live online via the student dashboard. You get real-time interaction with instructors and fellow students.",
  },
  {
    question: "How long is each session?",
    answer: "Each session is 3 hours, held on Fridays and Saturdays.",
  },
  {
    question: "What happens if I miss a session?",
    answer: "You can access the recorded class video through your dashboard after submitting your weekly review for that week.",
  },
  {
    question: "How are assignments submitted and tracked?",
    answer: "Assignments are submitted through the student dashboard. They feature automated grading with additional admin review for detailed feedback.",
  },
  {
    question: "Do I get a certificate?",
    answer: "Yes, certificates are issued upon completion of the full program and meeting all participation requirements including weekly reviews and assignments.",
  },
  {
    question: "What is the Optional Advanced Package?",
    answer: "It includes CV optimization, LinkedIn profile setup, and personalized guidance for applying to jobs. Contact us for more details.",
  },
  {
    question: "What are the hands-on projects?",
    answer: "A 2-week project at the end of the 6-week training where you work on real-world scenario simulations relevant to your course track.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">FAQ</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about our training programs.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
