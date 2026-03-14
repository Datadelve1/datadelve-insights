import { Users } from "lucide-react";

const team = [
  {
    name: "Co-Founder",
    role: "Co-Founder & Lead Instructor",
    placeholder: true,
  },
  {
    name: "Co-Founder",
    role: "Co-Founder & Operations Lead",
    placeholder: true,
  },
  {
    name: "Team Member",
    role: "Coming Soon",
    placeholder: true,
  },
  {
    name: "Team Member",
    role: "Coming Soon",
    placeholder: true,
  },
];

const MeetTheTeam = () => {
  return (
    <section id="team" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium mb-4 block">Our People</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            The passionate professionals behind Delvetek, dedicated to helping you succeed in tech.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
