export type StudentProject = {
  slug: string;
  title: string;
  scenario: string;
  image: string;
  skills: string[];
  points: number;
  durationHours: number;
  publishedAt: string;
  tags: string[];
  details: {
    intro: string;
    questions: string[];
    techStack: string[];
    notes: string[];
    steps: { title: string; items: string[] }[];
  };
};

export const STUDENT_PROJECTS: StudentProject[] = [
  {
    slug: "restaurant-health-inspection-analysis-nyc",
    title: "Restaurant Health Inspection Analysis - NYC",
    scenario:
      "You are a Data Analyst for the NYC Department of Health. Your job is to analyze restaurant inspection results to identify patterns in violations, grades, and cuisine types across New York City. The dataset includes restaurant details, cuisine descriptions, inspection results, grades, and violation types. The city leadership wants to use data to improve public health policies, inspection scheduling, and food safety education.",
    image:
      "https://ik.imagekit.io/d3ejrh60s/prod/projects/Y7OBL6OTGW.jpg",
    skills: [
      "Text Categorization",
      "Data Cleaning (missing values, standardization)",
      "Time-Series & Trend Analysis",
      "Working with Real Raw Data",
    ],
    points: 150,
    durationHours: 3,
    publishedAt: "2025-10-03",
    tags: ["Data Cleaning", "SQL", "Excel", "Time Series"],
    details: {
      intro:
        "The Commissioner wants to understand which types of restaurants are struggling with food safety, which neighborhoods are at highest risk, and what violations are most common. Use this dataset to build a report with insights.",
      questions: [
        "Which violations are most common, and where do they occur most frequently?",
        "Which cuisines and neighborhoods have the lowest food safety performance?",
        "How do restaurant grades and violations vary across boroughs and over time?",
        "Where should the city focus inspections, policies, or education to improve food safety?",
      ],
      techStack: ["Excel", "SQL", "Power BI"],
      notes: [
        "This data contains the raw data as well as a Data Dictionary. The data is messy so reference the Data Dictionary when needed.",
        "For this amount of data it is recommended to put it into a database (SQL) for faster cleaning and analyzing.",
      ],
      steps: [
        {
          title: "Data Preparation",
          items: [
            "Handle missing values (e.g., missing cuisine description or grades).",
            "Standardize cuisine names (e.g., “Chinese” vs “Asian/Chinese”).",
            "Convert inspection and grade dates to proper datetime format.",
          ],
        },
        {
          title: "Overall Insights",
          items: [
            "Count the total number of inspections by borough.",
            "Calculate the distribution of grades (A, B, C, etc.) across NYC.",
            "Identify the most common inspection types (Initial, Re-inspection, Pre-permit).",
          ],
        },
        {
          title: "Violation Analysis",
          items: [
            "Find the top 10 most frequent violations (e.g., “Evidence of mice,” “Improper food temperature”).",
            "Compare critical vs. non-critical violations.",
            "See which boroughs or neighborhoods have the highest rate of critical violations.",
          ],
        },
        {
          title: "Cuisine Analysis",
          items: [
            "Compare grades by cuisine type (e.g., Chinese vs American vs Italian).",
            "Find the top 5 cuisines with the lowest average scores.",
            "Identify cuisines with the highest proportion of “Critical” violations.",
          ],
        },
        {
          title: "Geographic & Time Trends",
          items: [
            "Visualize restaurant grades across boroughs (map or bar chart).",
            "Check if violations or scores have improved or worsened over time.",
            "Highlight if certain neighborhoods consistently perform worse.",
          ],
        },
        {
          title: "Recommendations",
          items: [
            "Suggest where targeted inspections or public health campaigns should focus.",
            "Identify cuisines/areas where more food safety training could reduce risks.",
            "Highlight policy opportunities (e.g., stricter enforcement in high-violation zones).",
          ],
        },
      ],
    },
  },
];

export const getProjectBySlug = (slug: string) =>
  STUDENT_PROJECTS.find((p) => p.slug === slug);
