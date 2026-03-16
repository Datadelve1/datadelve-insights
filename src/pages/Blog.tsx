import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { ArrowRight, ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  body: string;
}

const blogPosts: BlogPost[] = [
  {
    title: "Getting Started with Data Analysis: A Beginner's Roadmap",
    excerpt: "Data analysis is one of the most in-demand skills in tech today. Learn how to start your journey with SQL, Excel, and Power BI — the essential tools every data analyst needs.",
    category: "Data Analysis",
    date: "March 10, 2026",
    author: "Delvetek Team",
    readTime: "8 min read",
    image: "📊",
    body: `Data analysis is the process of inspecting, cleansing, transforming, and modelling data to discover useful information, draw conclusions, and support decision-making. In 2026, it remains one of the most sought-after skills across every industry.

**Why Data Analysis Matters**

Every company, from startups to Fortune 500 corporations, relies on data to make informed decisions. Whether it's understanding customer behaviour, optimising supply chains, or predicting market trends, data analysts are at the centre of it all.

**Essential Tools You Need to Master**

1. **Microsoft Excel** — Still the most widely used tool for data manipulation. Master pivot tables, VLOOKUP, conditional formatting, and data validation.

2. **SQL (Structured Query Language)** — The language of databases. Learn to write queries that extract, filter, and aggregate data from relational databases.

3. **Power BI** — Microsoft's powerful business intelligence tool. Create interactive dashboards and visualisations that tell compelling data stories.

4. **Python (Optional but Recommended)** — Libraries like Pandas, NumPy, and Matplotlib take your analysis to the next level with automation and advanced statistical methods.

**The Delvetek Data Analysis Track**

Our 8-week Data Analysis Fundamentals programme covers all these tools in a structured, hands-on format. You'll work on real-world datasets, complete weekly assignments, and build a portfolio project that demonstrates your skills to potential employers.

**Getting Started**

The best way to begin is to pick a dataset that interests you — whether it's sports statistics, financial data, or social media metrics — and start asking questions. Data analysis is fundamentally about curiosity: what patterns exist? What story does the data tell?

Start your journey with Delvetek today and join a community of learners building their careers in data.`,
  },
  {
    title: "Why Project Management is the Backbone of Every Tech Team",
    excerpt: "From Agile sprints to PRINCE2 frameworks, discover how project management skills can transform your career and make you invaluable in any organisation.",
    category: "Project Management",
    date: "March 8, 2026",
    author: "Delvetek Team",
    readTime: "7 min read",
    image: "📋",
    body: `Project management is the discipline of planning, organising, and managing resources to bring about the successful completion of specific goals and objectives. In the tech industry, it's the glue that holds teams and products together.

**The Role of a Project Manager**

A project manager (PM) is responsible for ensuring that projects are delivered on time, within scope, and on budget. They coordinate between stakeholders, developers, designers, and business teams to keep everyone aligned.

**Key Frameworks You Should Know**

1. **Agile & Scrum** — The dominant methodology in tech. Agile emphasises iterative development, collaboration, and flexibility. Scrum provides a structured framework within Agile with sprints, stand-ups, and retrospectives.

2. **PRINCE2** — A structured project management method widely used in the UK and internationally. It provides a clear framework with defined roles, stages, and processes.

3. **Waterfall** — The traditional sequential approach where each phase must be completed before the next begins. Still used in construction, manufacturing, and regulated industries.

4. **Kanban** — A visual workflow management method that helps teams visualise work, limit work-in-progress, and maximise efficiency.

**Essential Skills for Project Managers**

- **Communication** — PMs spend 90% of their time communicating. Clear, concise communication with diverse stakeholders is essential.
- **Risk Management** — Identifying, assessing, and mitigating risks before they derail a project.
- **Stakeholder Management** — Balancing competing priorities and keeping everyone informed and aligned.
- **Time Management** — Creating realistic schedules and ensuring milestones are met.

**Certifications That Matter**

- PMP (Project Management Professional)
- PRINCE2 Practitioner
- Certified Scrum Master (CSM)
- PMI-ACP (Agile Certified Practitioner)

**Why Choose Delvetek's Project Management Track?**

Our programme goes beyond theory. You'll manage simulated projects, use industry-standard tools like Jira and Microsoft Project, and learn from practitioners who've delivered real-world projects across multiple industries.`,
  },
  {
    title: "Business Analysis: Bridging the Gap Between Business and Technology",
    excerpt: "Business analysts are the translators between stakeholders and development teams. Learn what it takes to master requirements gathering, process mapping, and stakeholder management.",
    category: "Business Analysis",
    date: "March 5, 2026",
    author: "Delvetek Team",
    readTime: "7 min read",
    image: "💼",
    body: `Business analysis is the practice of identifying business needs and determining solutions to business problems. Business analysts (BAs) serve as a bridge between business stakeholders and IT teams, ensuring that technology solutions meet real business requirements.

**What Does a Business Analyst Do?**

A BA's primary responsibility is to understand what the business needs, document those requirements clearly, and work with technical teams to deliver solutions. This involves:

- **Requirements Gathering** — Conducting interviews, workshops, and surveys to understand what stakeholders need.
- **Process Mapping** — Documenting current ("as-is") and future ("to-be") business processes using tools like BPMN diagrams.
- **User Stories & Use Cases** — Translating business needs into actionable items that developers can implement.
- **Data Modelling** — Understanding how data flows through an organisation and designing efficient data structures.

**Key Tools and Techniques**

1. **SWOT Analysis** — Evaluating Strengths, Weaknesses, Opportunities, and Threats to understand the business landscape.
2. **MoSCoW Prioritisation** — Categorising requirements as Must have, Should have, Could have, and Won't have.
3. **Wireframing** — Creating visual prototypes of software interfaces to validate requirements with stakeholders.
4. **Stakeholder Mapping** — Identifying and categorising stakeholders based on their influence and interest.

**Career Prospects**

Business analysis is a versatile career path. BAs work in every industry — finance, healthcare, retail, government, and technology. The role often serves as a stepping stone to product management, consulting, or C-suite positions.

**The Delvetek Business Analysis Track**

Our 8-week programme covers the full BA toolkit: requirements engineering, process modelling, stakeholder management, and Agile BA practices. You'll work on real case studies and build a portfolio that demonstrates your analytical thinking and communication skills.`,
  },
  {
    title: "Cybersecurity Fundamentals: Protecting Digital Assets in 2026",
    excerpt: "With cyber threats on the rise, cybersecurity skills are more critical than ever. Explore the fundamentals of network security, ethical hacking, and risk assessment.",
    category: "Cybersecurity",
    date: "March 3, 2026",
    author: "Delvetek Team",
    readTime: "9 min read",
    image: "🔒",
    body: `Cybersecurity is the practice of protecting systems, networks, and programmes from digital attacks. As our world becomes increasingly digital, the demand for cybersecurity professionals continues to skyrocket.

**The Cyber Threat Landscape in 2026**

Cyber attacks are more sophisticated and frequent than ever. Ransomware attacks cost businesses billions annually, phishing schemes target individuals and corporations alike, and nation-state actors pose threats to critical infrastructure. This makes cybersecurity professionals essential in every organisation.

**Core Domains of Cybersecurity**

1. **Network Security** — Protecting the integrity and usability of network infrastructure. This includes firewalls, intrusion detection systems (IDS), VPNs, and network segmentation.

2. **Application Security** — Ensuring that software applications are free from vulnerabilities. This involves secure coding practices, penetration testing, and code reviews.

3. **Information Security** — Protecting data confidentiality, integrity, and availability (the CIA triad). This covers encryption, access controls, and data classification.

4. **Identity and Access Management (IAM)** — Controlling who has access to what resources. Multi-factor authentication, single sign-on, and role-based access control are key concepts.

5. **Incident Response** — Detecting, analysing, and responding to security incidents. Having a well-rehearsed incident response plan can mean the difference between a minor breach and a catastrophic data loss.

**Essential Skills**

- Understanding of TCP/IP networking and protocols
- Familiarity with Linux and Windows operating systems
- Knowledge of common attack vectors (SQL injection, XSS, MITM)
- Experience with security tools (Wireshark, Nmap, Burp Suite, Metasploit)
- Risk assessment and compliance frameworks (ISO 27001, NIST, GDPR)

**Industry Certifications**

- CompTIA Security+
- Certified Ethical Hacker (CEH)
- CISSP (Certified Information Systems Security Professional)
- CompTIA CySA+ (Cybersecurity Analyst)

**Delvetek's Cybersecurity Track**

Our programme takes you from fundamentals to hands-on practice. You'll set up firewalls, conduct vulnerability assessments, simulate attacks in controlled environments, and learn to think like both an attacker and a defender.`,
  },
  {
    title: "Data Engineering: Building the Infrastructure Behind AI and Analytics",
    excerpt: "Data engineers are the unsung heroes of the data world. Learn about ETL processes, data pipelines, and cloud data warehousing — the foundation of modern data systems.",
    category: "Data Engineering",
    date: "February 28, 2026",
    author: "Delvetek Team",
    readTime: "8 min read",
    image: "⚙️",
    body: `Data engineering is the discipline of designing, building, and maintaining the systems and infrastructure that enable data collection, storage, and analysis at scale. While data analysts and scientists get the spotlight, data engineers build the foundation they work on.

**What Data Engineers Do**

Data engineers create and manage the architecture that allows data to flow from source systems to analytical tools. This includes:

- **ETL/ELT Pipelines** — Extract, Transform, Load (or Extract, Load, Transform) processes that move data from operational systems to data warehouses.
- **Data Warehousing** — Designing and managing centralised repositories optimised for analytical queries.
- **Data Lakes** — Building storage systems that hold vast amounts of raw data in its native format until needed.
- **Real-time Streaming** — Processing data as it's generated using tools like Apache Kafka and Apache Flink.

**Essential Tools and Technologies**

1. **SQL** — The foundation of data engineering. Deep knowledge of complex queries, optimisation, and database design is essential.
2. **Python** — The go-to programming language for data pipelines, automation, and scripting.
3. **Apache Spark** — A unified analytics engine for large-scale data processing.
4. **Apache Airflow** — A platform to programmatically author, schedule, and monitor data workflows.
5. **Cloud Platforms** — AWS (Redshift, S3, Glue), Google Cloud (BigQuery, Dataflow), and Azure (Synapse, Data Factory) are the big three.
6. **dbt (Data Build Tool)** — A modern tool for transforming data in warehouses using SQL.

**Data Engineering vs Data Science**

While data scientists focus on analysing data and building models, data engineers ensure the data is available, clean, and reliable. Think of it this way: data engineers build the roads, and data scientists drive on them.

**Career Outlook**

Data engineering roles consistently rank among the highest-paying in tech. As organisations invest more in AI and machine learning, the demand for engineers who can build robust data infrastructure continues to grow.

**Delvetek's Data Engineering Track**

Our programme covers SQL mastery, Python for data engineering, ETL pipeline design, cloud data warehousing, and Apache Spark. You'll build production-grade pipelines and work with real datasets throughout the 8-week programme.`,
  },
  {
    title: "Software Engineering: From Code to Career in 2026",
    excerpt: "Software engineering remains one of the most rewarding tech careers. Discover the programming languages, frameworks, and development practices that employers want.",
    category: "Software Engineering",
    date: "February 25, 2026",
    author: "Delvetek Team",
    readTime: "8 min read",
    image: "💻",
    body: `Software engineering is the systematic application of engineering principles to the development, operation, and maintenance of software systems. It's one of the most versatile and rewarding career paths in technology.

**The Modern Software Engineering Landscape**

Software engineering in 2026 is vastly different from even a few years ago. AI-assisted coding, cloud-native architectures, and DevOps practices have transformed how software is built and deployed. However, the fundamentals remain the same: writing clean, maintainable code that solves real problems.

**Programming Languages to Learn**

1. **JavaScript/TypeScript** — The language of the web. With frameworks like React, Next.js, and Node.js, JavaScript powers both frontend and backend development.
2. **Python** — Versatile and beginner-friendly. Used in web development (Django, Flask), data science, automation, and AI.
3. **Java** — The enterprise standard. Powers Android development, enterprise systems, and large-scale applications.
4. **Go** — Growing rapidly for backend services, cloud infrastructure, and DevOps tooling.

**Key Concepts Every Software Engineer Needs**

- **Data Structures & Algorithms** — The foundation of efficient problem-solving. Arrays, trees, graphs, sorting, and searching algorithms.
- **Version Control (Git)** — Essential for collaboration. Branching, merging, pull requests, and code reviews.
- **APIs & System Design** — Understanding how systems communicate via RESTful APIs, GraphQL, and microservices.
- **Testing** — Unit testing, integration testing, and end-to-end testing ensure code quality.
- **CI/CD** — Continuous Integration and Continuous Deployment automate the build, test, and deployment process.

**Frontend vs Backend vs Full-Stack**

- **Frontend** — Building user interfaces with HTML, CSS, JavaScript, React, or Vue.js.
- **Backend** — Server-side logic, databases, authentication, and API development.
- **Full-Stack** — Combining both frontend and backend skills for end-to-end development.

**Building Your Portfolio**

Employers want to see what you've built. Focus on:
- 2-3 polished projects on GitHub
- A personal website showcasing your work
- Contributions to open-source projects
- Technical blog posts demonstrating your knowledge

**Delvetek's Software Engineering Track**

Our programme covers full-stack development with modern technologies. You'll build real applications, learn industry best practices, and complete a capstone project that you can showcase to potential employers.`,
  },
  {
    title: "How to Build a Portfolio That Gets You Hired in Tech",
    excerpt: "Your portfolio is your strongest asset when job hunting. Learn how to create compelling projects that showcase your skills across any tech discipline.",
    category: "Career Tips",
    date: "February 20, 2026",
    author: "Delvetek Team",
    readTime: "6 min read",
    image: "🚀",
    body: `In the competitive tech job market, your portfolio often speaks louder than your CV. Whether you're a data analyst, software engineer, or cybersecurity specialist, a well-crafted portfolio can be the difference between landing an interview and being overlooked.

**Why Portfolios Matter**

Hiring managers want proof that you can do the work, not just talk about it. A portfolio provides tangible evidence of your skills, problem-solving ability, and attention to detail.

**What Makes a Great Portfolio**

1. **Quality Over Quantity** — Three excellent projects are better than ten mediocre ones. Each project should demonstrate different skills and solve a real problem.

2. **Clear Documentation** — Every project should have a README that explains the problem, your approach, the tools used, and the results achieved.

3. **Clean Code** — If you're sharing code, ensure it's well-organised, commented, and follows best practices.

4. **Visual Presentation** — Screenshots, demo videos, and live links make your work more engaging and accessible.

**Portfolio Ideas by Track**

- **Data Analysis**: Interactive dashboards showing insights from public datasets (COVID trends, economic indicators, sports analytics)
- **Project Management**: Case studies of projects you've managed, including timelines, challenges, and outcomes
- **Business Analysis**: Requirements documents, process maps, and stakeholder analysis for real or simulated scenarios
- **Cybersecurity**: Write-ups of CTF challenges, vulnerability assessments, or security audit reports
- **Data Engineering**: Documented data pipelines with architecture diagrams and performance benchmarks
- **Software Engineering**: Full-stack web applications with clean code and deployed to production

**Where to Host Your Portfolio**

- **GitHub** — Essential for code-based projects
- **Personal Website** — A custom site shows extra initiative
- **Medium/Dev.to** — For technical writing and thought leadership
- **LinkedIn** — Showcase projects and certifications

**The Delvetek Advantage**

Every Delvetek track includes a 2-week capstone project designed to be portfolio-worthy. Our mentors review your work and help you present it in the most impactful way possible.`,
  },
  {
    title: "The Power of Structured Learning: Why Mentorship Beats Self-Study",
    excerpt: "While self-paced learning has its place, structured training with mentorship and accountability produces better outcomes. Here's the science behind it.",
    category: "Learning",
    date: "February 15, 2026",
    author: "Delvetek Team",
    readTime: "6 min read",
    image: "🎓",
    body: `The internet is flooded with free resources for learning tech skills — YouTube tutorials, MOOCs, documentation, and blog posts. So why do structured programmes like Delvetek consistently produce better outcomes?

**The Completion Problem**

Studies show that only 3-6% of people who start online courses actually complete them. The flexibility that makes self-paced learning attractive is often the same thing that leads to procrastination and abandonment.

**Why Structure Works**

1. **Accountability** — When you have deadlines, weekly reviews, and instructors who track your progress, you're far more likely to stay on track.

2. **Curriculum Design** — Self-learners often waste time learning things in the wrong order or spending too long on topics that don't matter. A well-designed curriculum ensures you learn the right things at the right time.

3. **Mentorship** — Having access to experienced professionals who can answer your questions, review your work, and provide career guidance is invaluable. A mentor can save you months of going down the wrong path.

4. **Community** — Learning with peers creates a support system. You can collaborate, share resources, motivate each other, and build professional networks that last beyond the programme.

5. **Real-World Projects** — Structured programmes typically include hands-on projects that mirror actual workplace scenarios, giving you practical experience that tutorials can't provide.

**The Delvetek Model**

Our 8-week programmes combine:
- **Live sessions** every Friday and Saturday with expert instructors
- **Weekly assignments** with auto-grading and personalised feedback
- **Written and video reflections** to deepen your understanding
- **A 2-week capstone project** that becomes a portfolio piece
- **An Ambassador Programme** for top performers who want to give back

**The Bottom Line**

Self-study has its place for supplementary learning, but when it comes to building job-ready skills in a specific domain, structured programmes with mentorship, accountability, and community support consistently produce better results.

Invest in your learning. Join Delvetek and experience the difference that structured training makes.`,
  },
  {
    title: "Top 10 SQL Queries Every Data Professional Should Know",
    excerpt: "SQL is the universal language of data. Master these 10 essential query patterns and you'll be ready to tackle any data challenge thrown your way.",
    category: "Data Analysis",
    date: "February 10, 2026",
    author: "Delvetek Team",
    readTime: "10 min read",
    image: "🗃️",
    body: `SQL (Structured Query Language) is the backbone of data work. Whether you're a data analyst, data engineer, or backend developer, SQL proficiency is non-negotiable. Here are 10 query patterns every data professional should master.

**1. Aggregation with GROUP BY**

Understanding how to summarise data using COUNT, SUM, AVG, MIN, and MAX with GROUP BY is fundamental. Add HAVING clauses to filter aggregated results.

**2. JOINs (INNER, LEFT, RIGHT, FULL)**

Combining data from multiple tables is a daily task. Know when to use each type of JOIN and understand how NULL values behave in outer joins.

**3. Subqueries and CTEs**

Common Table Expressions (WITH clauses) make complex queries readable. Subqueries in SELECT, FROM, and WHERE clauses handle advanced data retrieval.

**4. Window Functions**

ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), and running totals with SUM() OVER() are essential for analytical queries without collapsing rows.

**5. CASE Statements**

Conditional logic in SQL allows you to categorise, bucket, and transform data inline. Essential for creating calculated columns and business logic.

**6. Date Functions**

Extracting parts of dates, calculating differences, and formatting timestamps varies by database but is universally important.

**7. String Functions**

CONCAT, SUBSTRING, TRIM, REPLACE, and LIKE patterns for text manipulation and pattern matching.

**8. UNION and UNION ALL**

Combining result sets from multiple queries. Know the difference: UNION removes duplicates, UNION ALL keeps them.

**9. EXISTS and IN**

Filtering based on the existence of related data. EXISTS is often more performant than IN for large subqueries.

**10. INSERT, UPDATE, DELETE with Conditions**

Data manipulation isn't just about reading. Know how to safely modify data with proper WHERE clauses and transaction management.

**Practice Makes Perfect**

The best way to learn SQL is by writing queries against real datasets. Platforms like LeetCode, HackerRank, and SQLZoo offer practice problems, but nothing beats working with data that matters to you.

At Delvetek, SQL is woven throughout our Data Analysis and Data Engineering tracks, ensuring you build muscle memory through repetition and real-world application.`,
  },
  {
    title: "Agile vs Waterfall: Choosing the Right Methodology for Your Project",
    excerpt: "The Agile vs Waterfall debate continues, but the truth is both have their place. Learn when to use each approach and how to adapt to hybrid models.",
    category: "Project Management",
    date: "February 5, 2026",
    author: "Delvetek Team",
    readTime: "7 min read",
    image: "🔄",
    body: `One of the most common questions in project management is: should we use Agile or Waterfall? The answer, as with most things in tech, is "it depends."

**Understanding Waterfall**

Waterfall is a linear, sequential approach where each phase (requirements, design, implementation, testing, deployment) must be completed before the next begins. It works best when:
- Requirements are well-defined and unlikely to change
- The project has regulatory or compliance requirements
- Stakeholders need detailed upfront documentation
- The technology is well-understood

**Understanding Agile**

Agile is an iterative approach that delivers work in small increments (sprints), allowing for continuous feedback and adaptation. It excels when:
- Requirements are likely to evolve
- Speed to market is critical
- The team needs to experiment and learn
- Stakeholder involvement is high

**The Rise of Hybrid Approaches**

Many organisations now use hybrid models that combine elements of both. For example:
- **Wagile** — Waterfall for overall project phases, Agile within each phase
- **SAFe (Scaled Agile Framework)** — Agile principles applied at enterprise scale
- **Disciplined Agile** — A toolkit approach that lets teams choose the right practices

**Key Differences at a Glance**

| Aspect | Waterfall | Agile |
|--------|-----------|-------|
| Planning | Upfront, detailed | Continuous, adaptive |
| Delivery | End of project | Iterative increments |
| Change | Difficult, expensive | Expected, welcomed |
| Documentation | Comprehensive | Just enough |
| Testing | After development | Continuous |

**Making the Right Choice**

Consider these factors:
1. How well-defined are the requirements?
2. How likely are changes during the project?
3. What does the client/stakeholder expect?
4. What's the team's experience and preference?
5. Are there regulatory constraints?

**At Delvetek**, our Project Management track covers both methodologies in depth, giving you the knowledge to choose and adapt the right approach for any project situation.`,
  },
  {
    title: "The Rise of AI in Cybersecurity: Threat or Opportunity?",
    excerpt: "AI is transforming cybersecurity — both for defenders and attackers. Understand how AI-powered tools are reshaping the security landscape.",
    category: "Cybersecurity",
    date: "January 30, 2026",
    author: "Delvetek Team",
    readTime: "8 min read",
    image: "🤖",
    body: `Artificial intelligence is fundamentally changing the cybersecurity landscape. While AI offers powerful tools for defending against threats, it also gives attackers new capabilities. Understanding this dual nature is essential for any cybersecurity professional.

**AI as a Defender**

1. **Threat Detection** — AI systems can analyse millions of events per second, identifying patterns that human analysts would miss. Machine learning models detect anomalies in network traffic, user behaviour, and system logs.

2. **Automated Response** — When a threat is detected, AI can automatically isolate affected systems, block malicious IPs, and initiate incident response procedures in milliseconds.

3. **Phishing Detection** — AI models analyse email content, sender reputation, and link destinations to identify phishing attempts with high accuracy.

4. **Vulnerability Management** — AI prioritises vulnerabilities based on exploitability, business impact, and threat intelligence, helping security teams focus on what matters most.

**AI as an Attacker's Tool**

1. **Deepfakes** — AI-generated audio and video can impersonate executives for social engineering attacks.
2. **Automated Exploitation** — AI can scan for and exploit vulnerabilities faster than human attackers.
3. **Evasive Malware** — AI-powered malware can adapt its behaviour to avoid detection by traditional security tools.
4. **Advanced Phishing** — AI generates highly convincing phishing emails that are harder to distinguish from legitimate communications.

**Skills Cybersecurity Professionals Need**

- Understanding of machine learning concepts and how they apply to security
- Experience with SIEM (Security Information and Event Management) platforms
- Knowledge of threat intelligence feeds and how AI processes them
- Ability to evaluate and configure AI-powered security tools
- Critical thinking to identify AI-generated threats

**The Future**

The cybersecurity industry will increasingly rely on professionals who understand both security fundamentals and AI capabilities. Those who can bridge these two domains will be in extraordinary demand.

**Delvetek's Cybersecurity Track** prepares you for this AI-augmented future while ensuring you master the fundamentals that will never go out of style.`,
  },
  {
    title: "From Excel to Power BI: Levelling Up Your Data Visualisation Skills",
    excerpt: "Excel is where most analysts start, but Power BI takes your reporting to the next level. Here's how to make the transition smoothly.",
    category: "Data Analysis",
    date: "January 25, 2026",
    author: "Delvetek Team",
    readTime: "7 min read",
    image: "📈",
    body: `If you're comfortable with Excel, you're already halfway to Power BI mastery. Microsoft Power BI builds on many concepts you already know while adding powerful visualisation, data modelling, and sharing capabilities.

**Why Move Beyond Excel?**

Excel is fantastic for ad-hoc analysis and small datasets, but it has limitations:
- Performance degrades with large datasets (100K+ rows)
- Sharing and collaboration are cumbersome
- Creating interactive, professional dashboards is difficult
- Data refresh requires manual effort

**Power BI Advantages**

1. **Handle Millions of Rows** — Power BI's in-memory engine processes massive datasets effortlessly.
2. **Interactive Dashboards** — Create click-through reports with filters, drill-downs, and cross-highlighting.
3. **Automatic Data Refresh** — Connect to data sources and schedule automatic updates.
4. **Sharing & Collaboration** — Publish reports to the Power BI Service and share with stakeholders securely.
5. **DAX (Data Analysis Expressions)** — A powerful formula language for creating custom calculations and measures.

**Making the Transition**

- **Pivot Tables → Matrix Visuals**: The concept is similar, but Power BI's matrix visual is more flexible and interactive.
- **Charts → Visualisations**: Power BI offers dozens of built-in visuals plus hundreds of custom visuals from the marketplace.
- **VLOOKUP → Relationships**: Instead of VLOOKUP, Power BI uses table relationships for combining data.
- **Formulas → DAX**: DAX is more powerful than Excel formulas for aggregation and time intelligence.

**Your First Power BI Dashboard**

1. Import a dataset (CSV, Excel, or database connection)
2. Clean and transform data in Power Query
3. Create relationships between tables
4. Build visualisations (bar charts, line charts, KPI cards)
5. Add slicers for interactivity
6. Publish and share

**At Delvetek**, our Data Analysis track takes you from Excel foundations through to advanced Power BI dashboards, ensuring you can deliver insights that drive business decisions.`,
  },
];

const categories = ["All", ...new Set(blogPosts.map((p) => p.category))];

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" 
    ? blogPosts 
    : blogPosts.filter((p) => p.category === activeCategory);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Button
              variant="ghost"
              onClick={() => setSelectedPost(null)}
              className="mb-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>

            <article>
              <div className="mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {selectedPost.category}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {selectedPost.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                {selectedPost.body.split("\n\n").map((paragraph, i) => {
                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                    return (
                      <h2 key={i} className="font-display text-xl font-bold text-foreground mt-8 mb-4">
                        {paragraph.replace(/\*\*/g, "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("| ")) {
                    return (
                      <div key={i} className="my-4 p-4 rounded-lg bg-secondary text-sm text-muted-foreground overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{paragraph}</pre>
                      </div>
                    );
                  }
                  // Handle headers within paragraphs
                  const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                      {parts.map((part, j) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={j} className="text-foreground font-semibold">{part.replace(/\*\*/g, "")}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            </article>
          </div>
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-medium mb-4 block">Our Blog</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Insights & <span className="gradient-text">Resources</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest trends, tips, and insights across all our tech learning tracks.
            </p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredPosts.map((post) => (
              <article
                key={post.title}
                onClick={() => setSelectedPost(post)}
                className="group glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
              >
                <div className="text-4xl mb-4">{post.image}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                  <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Blog;
