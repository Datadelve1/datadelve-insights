/** Ready-made wording for class emails prepared in the Ops Centre. Always editable before approval. */
export type ClassEmailKind = "class_reminder" | "after_class";

export interface ClassEmailInput {
  cohort: string;
  when: string; // e.g. "Friday 6 PM WAT"
  classLink?: string;
  topic?: string;
}

export const CLASS_EMAIL_LABELS: Record<ClassEmailKind, string> = {
  class_reminder: "Class reminder (with class link)",
  after_class: "After-class follow-up",
};

export function buildClassEmail(kind: ClassEmailKind, i: ClassEmailInput): { subject: string; body: string } {
  const when = i.when.trim() || "today, 6 PM WAT";
  const topicLine = i.topic?.trim() ? ` on ${i.topic.trim()}` : "";
  if (kind === "class_reminder") {
    return {
      subject: `Reminder: your ${i.cohort} class is ${when}`,
      body: [
        "Hi {first_name},",
        `This is a quick reminder that your Delvetek class${topicLine} is ${when}.`,
        `Join the class here:\n${i.classLink?.trim() || "[add class link]"}`,
        "Please join on time with your laptop and tools ready.",
        "See you in class,\nThe Delvetek Team",
      ].join("\n\n"),
    };
  }
  return {
    subject: `Thanks for joining today's class — what's next`,
    body: [
      "Hi {first_name},",
      `Thank you for joining today's class${topicLine}.`,
      "What's next:\n• The class recording will be on your student dashboard from 10 PM WAT.\n• Check your dashboard for this week's assignment.",
      "Log in here:\nhttps://www.datadelve.io/dashboard",
      "Any questions? Reply to this email or message us on WhatsApp: +44 7775 739225.",
      "The Delvetek Team",
    ].join("\n\n"),
  };
}
