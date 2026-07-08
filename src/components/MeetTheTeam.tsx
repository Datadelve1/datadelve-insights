import teamCeo from "@/assets/team-ceo.jpeg";
import teamOperations from "@/assets/team-operations.jpeg";

const team = [
  {
    name: "Opeyemi Oloyede",
    role: "Co-Founder & CEO",
    image: teamCeo,
  },
  {
    name: "Oshinubi Pipeloluwa",
    role: "Co-Founder & Tutor",
    image: teamOperations,
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

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 text-center"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border-2 border-primary/20">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
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
