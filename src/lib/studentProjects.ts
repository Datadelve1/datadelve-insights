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
  datasets?: { label: string; url: string; sizeLabel?: string }[];
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
    title: "Project 1 — Public Health Inspection Insights",
    scenario:
      "Imagine you've just joined a city public health unit as a junior data analyst. Your team has been handed years of restaurant inspection records — cuisine types, locations, inspection outcomes, scores, grades and the specific violations cited. Leadership wants to know where food safety risks are concentrated, which neighbourhoods and cuisines need extra attention, and how to spend a limited inspection budget wisely. Your job is to turn this messy real-world dataset into clear, decision-ready insights.",
    image:
      "https://ik.imagekit.io/d3ejrh60s/prod/projects/Y7OBL6OTGW.jpg",
    skills: [
      "Cleaning real, messy, real-world data",
      "Categorising free-text fields (cuisines, violation descriptions)",
      "Trend & time-series exploration",
      "Translating raw data into actionable recommendations",
    ],
    points: 150,
    durationHours: 3,
    publishedAt: "2025-10-03",
    tags: ["Data Cleaning", "SQL", "Excel", "Time Series"],
    datasets: [
      {
        label: "Restaurant Inspection Results (CSV)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/restaurant-health-inspection-analysis-nyc/DOHMH_NYC_Restaurant_Inspection_Results.csv",
        sizeLabel: "~123 MB",
      },
      {
        label: "Inspection Data Dictionary (XLSX)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/restaurant-health-inspection-analysis-nyc/RestaurantInspectionDataDictionary.xlsx",
        sizeLabel: "~70 KB",
      },
    ],
    details: {
      intro:
        "The leadership team isn't interested in raw tables — they want a story. Your deliverable should answer: which types of restaurants keep failing, which areas are highest-risk, and where targeted inspections or food-safety education would have the biggest impact. Treat this like a real consulting brief: clean the data, dig into the patterns, and back every recommendation with evidence from the dataset.",
      questions: [
        "What are the most frequently recurring violations, and where do they cluster geographically?",
        "Which cuisine categories and neighbourhoods consistently show the weakest food-safety performance?",
        "How have grades and violation rates shifted across boroughs and over time?",
        "Given the patterns you find, where should the city focus its next round of inspections, training, or policy intervention?",
      ],
      techStack: ["Excel", "SQL", "Power BI"],
      notes: [
        "The dataset ships with a separate data dictionary — keep it open while you clean. Many fields are coded and only make sense once you cross-reference it.",
        "Because of the file size, loading everything into Excel will be painful. Push the raw data into a SQL database (or Power BI dataflow) and do your heavy cleaning there before visualising.",
      ],
      steps: [
        {
          title: "Get the data ready",
          items: [
            "Inspect missing or blank fields, especially cuisine descriptions, grades and inspection dates — decide whether to drop, flag or impute them.",
            "Standardise inconsistent cuisine labels so similar entries (e.g. variations of the same cuisine) collapse into one clean category.",
            "Cast inspection and grade dates into proper date types so you can do time-based analysis later.",
          ],
        },
        {
          title: "Get a feel for the data",
          items: [
            "Count total inspections per borough to understand inspection volume.",
            "Look at how grades are distributed across the city and within each borough.",
            "Break down the mix of inspection types (initial, re-inspection, pre-permit, etc.) to see what kind of activity dominates.",
          ],
        },
        {
          title: "Dig into violations",
          items: [
            "Surface the top recurring violations and describe what each one actually means using the data dictionary.",
            "Separate critical from non-critical violations and compare their frequencies.",
            "Map critical violations to boroughs and neighbourhoods to highlight high-risk zones.",
          ],
        },
        {
          title: "Compare cuisines",
          items: [
            "Look at how grades vary across cuisine types — which cuisines tend to score better or worse on average?",
            "Identify the cuisine categories with the lowest performance and the highest share of critical violations.",
            "Sanity check: are these patterns driven by real risk, or by the sheer number of restaurants in that category?",
          ],
        },
        {
          title: "Look at place and time",
          items: [
            "Visualise grades and violation rates across boroughs (a map or clean bar chart works well).",
            "Track whether scores are trending up or down over time — is the city actually improving?",
            "Spot neighbourhoods that consistently underperform, even when overall numbers improve.",
          ],
        },
        {
          title: "Turn insights into recommendations",
          items: [
            "Recommend specific zones or cuisine groups where the next inspection cycle should focus.",
            "Suggest where targeted food-safety training or outreach would likely have the biggest impact.",
            "Call out any policy or enforcement opportunities your analysis surfaces — and back each one with a chart or number.",
          ],
        },
      ],
    },
  },
];

export const getProjectBySlug = (slug: string) =>
  STUDENT_PROJECTS.find((p) => p.slug === slug);
