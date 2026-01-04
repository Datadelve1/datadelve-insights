import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is DataDelve training for?",
    answer: "Our training is designed for anyone looking to build or advance their data skills—whether you're a complete beginner, a professional transitioning into data, or someone looking to level up specific skills like Python or SQL.",
  },
  {
    question: "Do I need any prior experience?",
    answer: "Not at all! We tailor each session to your current skill level. Whether you've never touched a spreadsheet or you're already working with data daily, we'll meet you where you are.",
  },
  {
    question: "How are the sessions delivered?",
    answer: "All sessions are conducted one-on-one via video call. This allows for personalized attention, real-time feedback, and the flexibility to focus on what matters most to you.",
  },
  {
    question: "How long is each session?",
    answer: "Standard sessions are 60 minutes, but we also offer 90-minute deep-dive sessions for more complex topics or hands-on project work.",
  },
  {
    question: "What tools and software will I learn?",
    answer: "Depending on your goals, you may work with Excel, SQL, Python (pandas, matplotlib), Tableau, Power BI, Git/GitHub, and more. We focus on industry-standard tools that employers value.",
  },
  {
    question: "Do you offer package deals or discounts?",
    answer: "Yes! We offer discounted packages for booking multiple sessions upfront. Contact us to learn about current offers and find the right package for your learning journey.",
  },
  {
    question: "What is the capstone project?",
    answer: "The capstone is a real-world data project you'll complete with guidance. It becomes a portfolio piece you can showcase to employers, demonstrating your practical skills.",
  },
  {
    question: "How do I get started?",
    answer: "Simply fill out the contact form or book a free consultation call. We'll discuss your goals, assess your current level, and create a personalized learning plan.",
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
