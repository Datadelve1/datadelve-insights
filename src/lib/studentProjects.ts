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
    title: "Project 1 - Restaurant Health Inspection Analysis - NYC",
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
    datasets: [
      {
        label: "DOHMH NYC Restaurant Inspection Results (CSV)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/restaurant-health-inspection-analysis-nyc/DOHMH_NYC_Restaurant_Inspection_Results.csv",
        sizeLabel: "~123 MB",
      },
      {
        label: "Restaurant Inspection Data Dictionary (XLSX)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/restaurant-health-inspection-analysis-nyc/RestaurantInspectionDataDictionary.xlsx",
        sizeLabel: "~70 KB",
      },
    ],
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
  {
    slug: "e-commerce-profitability-analysis",
    title: "Project 2 - E-Commerce Profitability Analysis",
    scenario:
      "You are a financial analyst at a direct-to-consumer e-commerce brand that sells products across multiple categories and channels. While top-line revenue looks healthy, the CEO suspects that not all product categories and sales channels are actually profitable once you account for shipping, returns, platform fees, and marketing costs. In this project you will perform a true profitability analysis by connecting order-level transaction data with product costs and marketing spend to find out where the company is actually making (and losing) money.",
    image:
      "https://ik.imagekit.io/d3ejrh60s/prod/projects/OD2T2UIJ4J.jpeg",
    skills: [
      "Analyze Financial Data",
      "Analyze Profitability in the E-commerce Space",
      "SQL Joins & Aggregations",
      "Marketing ROI & ROAS",
    ],
    points: 150,
    durationHours: 3,
    publishedAt: "2026-02-19",
    tags: ["SQL", "Pandas", "Excel", "Finance"],
    datasets: [
      {
        label: "Orders (CSV)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/e-commerce-profitability-analysis/orders.csv",
        sizeLabel: "~254 KB",
      },
      {
        label: "Products Catalog (CSV)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/e-commerce-profitability-analysis/products.csv",
        sizeLabel: "~17 KB",
      },
      {
        label: "Marketing Spend (CSV)",
        url: "https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/project-datasets/e-commerce-profitability-analysis/marketing_spend.csv",
        sizeLabel: "~10 KB",
      },
    ],
    details: {
      intro:
        "BrightCart is an online retailer selling products across 8 categories through their website, mobile app, third-party marketplaces, and social commerce. The company did $1M+ in gross revenue over the past two years, but net margins have been shrinking. The CEO wants to know which product categories and sales channels are truly profitable after all costs, which marketing platforms are delivering the best return on ad spend, and whether the return rate is eating into margins. You have three datasets: order-level transactions, a product catalog with cost data, and monthly marketing spend by platform.",
      questions: [
        "What is the average profit margin by product category? Which categories are the most and least profitable, and what is driving the difference (product cost, shipping, returns, or discounts)?",
        "How does profitability differ across sales channels (Website, Mobile App, Marketplace, Social Commerce)? Which channel has the best and worst profit per order after accounting for platform fees?",
        "What is the return rate by category and channel? Estimate how much total revenue was lost to returns over the analysis period.",
        "Analyze the marketing spend data: Which advertising platform delivers the best ROAS (Return on Ad Spend)? Are there any platforms where the company is spending money but not getting a positive return?",
        "If the CEO asked you to cut 20% of the marketing budget, which platforms and months would you recommend reducing spend on? Support your recommendation with data.",
      ],
      techStack: ["SQL", "Pandas", "Excel"],
      notes: [
        "You will work with three datasets: order-level transactions, a product catalog with cost data, and monthly marketing spend by platform.",
        "Focus on true profitability — factor in product cost, shipping, returns, platform fees, and marketing spend, not just top-line revenue.",
      ],
      steps: [
        {
          title: "Import and Explore",
          items: [
            "Load all three CSVs.",
            "Verify that order-level costs add up correctly (product cost + shipping + fees = total costs).",
            "Check for any data quality issues.",
          ],
        },
        {
          title: "Category Profitability",
          items: [
            "Group orders by product category.",
            "Calculate total revenue, total costs, total profit, and profit margin for each.",
            "Identify the top and bottom performers.",
          ],
        },
        {
          title: "Channel Analysis",
          items: [
            "Group by sales channel.",
            "Compare average order value, average profit, and return rate across channels.",
            "Factor in platform fees for Marketplace and Social Commerce.",
          ],
        },
        {
          title: "Marketing ROI",
          items: [
            "Analyze the marketing spend dataset.",
            "Calculate ROAS, cost per acquisition, and cost per click by platform.",
            "Identify which platforms are underperforming.",
          ],
        },
        {
          title: "Recommendations",
          items: [
            "Create a one-page summary with your top 3 recommendations for improving profitability.",
            "Include specific numbers (e.g., cutting X platform saves $Y with minimal revenue impact).",
          ],
        },
      ],
    },
  },
];

export const getProjectBySlug = (slug: string) =>
  STUDENT_PROJECTS.find((p) => p.slug === slug);
