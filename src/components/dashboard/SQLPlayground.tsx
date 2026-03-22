import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Play,
  Loader2,
  Table2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type initSqlJs from "sql.js";

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type SqlJsDatabase = InstanceType<SqlJsStatic["Database"]>;

interface QueryResult {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}

interface SampleDataset {
  id: string;
  name: string;
  description: string;
  schema: string;
  seedData: string;
  sampleQueries: { label: string; query: string }[];
}

const DATASETS: SampleDataset[] = [
  {
    id: "employees",
    name: "Employees & Departments",
    description: "Company employee data with departments, salaries, and hire dates.",
    schema: `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  location TEXT
);

CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  hire_date TEXT,
  salary REAL,
  dept_id INTEGER,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);`,
    seedData: `
INSERT INTO departments VALUES (1, 'Engineering', 'Lagos');
INSERT INTO departments VALUES (2, 'Marketing', 'London');
INSERT INTO departments VALUES (3, 'Sales', 'Abuja');
INSERT INTO departments VALUES (4, 'HR', 'Lagos');
INSERT INTO departments VALUES (5, 'Finance', 'London');

INSERT INTO employees VALUES (1, 'Adaeze', 'Okafor', 'adaeze@company.com', '2023-01-15', 85000, 1);
INSERT INTO employees VALUES (2, 'Chidi', 'Nwosu', 'chidi@company.com', '2022-06-01', 72000, 2);
INSERT INTO employees VALUES (3, 'Fatima', 'Bello', 'fatima@company.com', '2023-03-20', 95000, 1);
INSERT INTO employees VALUES (4, 'Emeka', 'Eze', 'emeka@company.com', '2021-11-10', 68000, 3);
INSERT INTO employees VALUES (5, 'Ngozi', 'Adeyemi', 'ngozi@company.com', '2024-01-05', 55000, 4);
INSERT INTO employees VALUES (6, 'Tunde', 'Bakare', 'tunde@company.com', '2022-08-15', 91000, 1);
INSERT INTO employees VALUES (7, 'Amara', 'Igwe', 'amara@company.com', '2023-07-22', 78000, 5);
INSERT INTO employees VALUES (8, 'Yusuf', 'Mohammed', 'yusuf@company.com', '2021-04-30', 62000, 3);
INSERT INTO employees VALUES (9, 'Blessing', 'Obi', 'blessing@company.com', '2024-02-14', 70000, 2);
INSERT INTO employees VALUES (10, 'Kunle', 'Ajayi', 'kunle@company.com', '2022-12-01', 88000, 1);
INSERT INTO employees VALUES (11, 'Chioma', 'Uche', 'chioma@company.com', '2023-09-10', 65000, 5);
INSERT INTO employees VALUES (12, 'Ibrahim', 'Sani', 'ibrahim@company.com', '2021-07-19', 73000, 3);`,
    sampleQueries: [
      { label: "All employees", query: "SELECT * FROM employees;" },
      { label: "Employees by department", query: "SELECT e.first_name, e.last_name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nORDER BY d.dept_name;" },
      { label: "Average salary per dept", query: "SELECT d.dept_name, \n       COUNT(*) AS employee_count, \n       ROUND(AVG(e.salary), 2) AS avg_salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY avg_salary DESC;" },
      { label: "High earners (>80k)", query: "SELECT first_name, last_name, salary\nFROM employees\nWHERE salary > 80000\nORDER BY salary DESC;" },
    ],
  },
  {
    id: "sales",
    name: "Sales & Products",
    description: "E-commerce data with products, customers, and orders.",
    schema: `
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT,
  price REAL,
  stock INTEGER
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  city TEXT,
  country TEXT
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  order_date TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);`,
    seedData: `
INSERT INTO products VALUES (1, 'Laptop', 'Electronics', 1200.00, 50);
INSERT INTO products VALUES (2, 'Headphones', 'Electronics', 89.99, 200);
INSERT INTO products VALUES (3, 'Desk Chair', 'Furniture', 350.00, 75);
INSERT INTO products VALUES (4, 'Notebook', 'Stationery', 12.50, 500);
INSERT INTO products VALUES (5, 'Monitor', 'Electronics', 450.00, 30);
INSERT INTO products VALUES (6, 'Keyboard', 'Electronics', 65.00, 150);
INSERT INTO products VALUES (7, 'Standing Desk', 'Furniture', 800.00, 20);
INSERT INTO products VALUES (8, 'Pen Set', 'Stationery', 25.00, 300);

INSERT INTO customers VALUES (1, 'Adeola Johnson', 'adeola@email.com', 'Lagos', 'Nigeria');
INSERT INTO customers VALUES (2, 'James Smith', 'james@email.com', 'London', 'UK');
INSERT INTO customers VALUES (3, 'Aisha Bello', 'aisha@email.com', 'Abuja', 'Nigeria');
INSERT INTO customers VALUES (4, 'Sarah Williams', 'sarah@email.com', 'New York', 'USA');
INSERT INTO customers VALUES (5, 'Olumide Adebayo', 'olumide@email.com', 'Ibadan', 'Nigeria');

INSERT INTO orders VALUES (1, 1, 1, 1, '2025-01-10');
INSERT INTO orders VALUES (2, 1, 2, 2, '2025-01-10');
INSERT INTO orders VALUES (3, 2, 3, 1, '2025-01-15');
INSERT INTO orders VALUES (4, 3, 4, 10, '2025-01-20');
INSERT INTO orders VALUES (5, 4, 5, 2, '2025-02-01');
INSERT INTO orders VALUES (6, 5, 1, 1, '2025-02-05');
INSERT INTO orders VALUES (7, 2, 6, 3, '2025-02-10');
INSERT INTO orders VALUES (8, 3, 7, 1, '2025-02-14');
INSERT INTO orders VALUES (9, 1, 8, 5, '2025-02-20');
INSERT INTO orders VALUES (10, 4, 2, 1, '2025-03-01');
INSERT INTO orders VALUES (11, 5, 3, 2, '2025-03-05');
INSERT INTO orders VALUES (12, 1, 6, 1, '2025-03-10');`,
    sampleQueries: [
      { label: "All products", query: "SELECT * FROM products;" },
      { label: "Total revenue per product", query: "SELECT p.product_name, \n       SUM(o.quantity) AS total_sold,\n       ROUND(SUM(o.quantity * p.price), 2) AS revenue\nFROM orders o\nJOIN products p ON o.product_id = p.product_id\nGROUP BY p.product_name\nORDER BY revenue DESC;" },
      { label: "Top customers by orders", query: "SELECT c.name, c.city, COUNT(*) AS order_count\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nGROUP BY c.customer_id\nORDER BY order_count DESC;" },
      { label: "Monthly sales trend", query: "SELECT SUBSTR(order_date, 1, 7) AS month,\n       COUNT(*) AS orders,\n       SUM(quantity) AS items_sold\nFROM orders\nGROUP BY month\nORDER BY month;" },
    ],
  },
  {
    id: "students",
    name: "School & Grades",
    description: "Student enrollment, courses, and grades for practice.",
    schema: `
CREATE TABLE courses (
  course_id INTEGER PRIMARY KEY,
  course_name TEXT NOT NULL,
  credits INTEGER,
  instructor TEXT
);

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  enrollment_date TEXT,
  major TEXT
);

CREATE TABLE grades (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  course_id INTEGER,
  grade TEXT,
  score REAL,
  semester TEXT,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);`,
    seedData: `
INSERT INTO courses VALUES (1, 'Intro to SQL', 3, 'Dr. Nneka');
INSERT INTO courses VALUES (2, 'Data Visualization', 3, 'Prof. Balogun');
INSERT INTO courses VALUES (3, 'Statistics 101', 4, 'Dr. Okonkwo');
INSERT INTO courses VALUES (4, 'Python Programming', 3, 'Prof. Adamu');
INSERT INTO courses VALUES (5, 'Business Analytics', 3, 'Dr. Eze');

INSERT INTO students VALUES (1, 'Tobi Adekunle', '2024-09-01', 'Data Science');
INSERT INTO students VALUES (2, 'Grace Okafor', '2024-09-01', 'Computer Science');
INSERT INTO students VALUES (3, 'Musa Abdullahi', '2024-09-01', 'Business');
INSERT INTO students VALUES (4, 'Folake Adeyemo', '2024-09-01', 'Data Science');
INSERT INTO students VALUES (5, 'David Eze', '2025-01-15', 'Statistics');
INSERT INTO students VALUES (6, 'Halima Yusuf', '2025-01-15', 'Data Science');

INSERT INTO grades VALUES (1, 1, 1, 'A', 92, '2024-Fall');
INSERT INTO grades VALUES (2, 1, 3, 'B+', 87, '2024-Fall');
INSERT INTO grades VALUES (3, 2, 1, 'A-', 90, '2024-Fall');
INSERT INTO grades VALUES (4, 2, 4, 'A', 95, '2024-Fall');
INSERT INTO grades VALUES (5, 3, 5, 'B', 83, '2024-Fall');
INSERT INTO grades VALUES (6, 3, 2, 'B+', 88, '2024-Fall');
INSERT INTO grades VALUES (7, 4, 1, 'A', 94, '2024-Fall');
INSERT INTO grades VALUES (8, 4, 3, 'A-', 91, '2024-Fall');
INSERT INTO grades VALUES (9, 5, 1, 'B', 82, '2025-Spring');
INSERT INTO grades VALUES (10, 5, 2, 'A-', 89, '2025-Spring');
INSERT INTO grades VALUES (11, 6, 1, 'A+', 98, '2025-Spring');
INSERT INTO grades VALUES (12, 6, 4, 'A', 93, '2025-Spring');`,
    sampleQueries: [
      { label: "All students", query: "SELECT * FROM students;" },
      { label: "GPA by student", query: "SELECT s.full_name, s.major,\n       ROUND(AVG(g.score), 1) AS avg_score,\n       COUNT(*) AS courses_taken\nFROM students s\nJOIN grades g ON s.student_id = g.student_id\nGROUP BY s.student_id\nORDER BY avg_score DESC;" },
      { label: "Course averages", query: "SELECT c.course_name, c.instructor,\n       COUNT(*) AS students,\n       ROUND(AVG(g.score), 1) AS avg_score\nFROM courses c\nJOIN grades g ON c.course_id = g.course_id\nGROUP BY c.course_id\nORDER BY avg_score DESC;" },
      { label: "Top performers (90+)", query: "SELECT s.full_name, c.course_name, g.grade, g.score\nFROM grades g\nJOIN students s ON g.student_id = s.student_id\nJOIN courses c ON g.course_id = c.course_id\nWHERE g.score >= 90\nORDER BY g.score DESC;" },
    ],
  },
];

const SQLPlayground = () => {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [sqlJs, setSqlJs] = useState<SqlJsStatic | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0].id);
  const [query, setQuery] = useState("SELECT * FROM employees;");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize sql.js
  useEffect(() => {
    const init = async () => {
      try {
        const initSqlJsFn = (await import("sql.js")).default;
        const SQL = await initSqlJsFn({
          locateFile: (file: string) =>
            `https://sql.js.org/dist/${file}`,
        });
        setSqlJs(SQL);
        loadDataset(SQL, DATASETS[0]);
      } catch (err: any) {
        setError("Failed to initialize SQL engine: " + err.message);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const loadDataset = useCallback(
    (SQL: SqlJsStatic, dataset: SampleDataset) => {
      try {
        if (db) db.close();
        const newDb = new SQL.Database();
        newDb.run(dataset.schema);
        newDb.run(dataset.seedData);
        setDb(newDb);
        setQuery(dataset.sampleQueries[0].query);
        setResults(null);
        setError(null);
      } catch (err: any) {
        setError("Failed to load dataset: " + err.message);
      }
    },
    [db]
  );

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = DATASETS.find((d) => d.id === datasetId);
    if (dataset && sqlJs) loadDataset(sqlJs, dataset);
  };

  const runQuery = () => {
    if (!db || !query.trim()) return;
    setIsRunning(true);
    setError(null);
    try {
      const res = db.exec(query);
      if (res.length > 0) {
        setResults({ columns: res[0].columns, values: res[0].values });
      } else {
        setResults({ columns: ["Result"], values: [["Query executed successfully. No rows returned."]] });
      }
    } catch (err: any) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  };

  const resetDatabase = () => {
    const dataset = DATASETS.find((d) => d.id === selectedDataset);
    if (dataset && sqlJs) {
      loadDataset(sqlJs, dataset);
      setQuery(dataset.sampleQueries[0].query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  };

  const currentDataset = DATASETS.find((d) => d.id === selectedDataset)!;

  if (isInitializing) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground text-sm">Loading SQL engine...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-foreground">
          <Database className="w-5 h-5 text-primary" /> SQL Playground
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Practice SQL queries on real datasets — everything runs in your browser.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dataset selector & controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedDataset} onValueChange={handleDatasetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {DATASETS.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSchema(!showSchema)}>
            <Info className="w-4 h-4 mr-1" />
            Schema {showSchema ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
          <Button variant="outline" size="sm" onClick={resetDatabase}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>

        {/* Dataset description */}
        <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
          {currentDataset.description}
        </p>

        {/* Schema viewer */}
        {showSchema && (
          <pre className="text-xs bg-secondary rounded-lg p-4 overflow-x-auto text-foreground border border-border font-mono max-h-60 overflow-y-auto">
            {currentDataset.schema.trim()}
          </pre>
        )}

        {/* Sample queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Try:</span>
          {currentDataset.sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => setQuery(sq.query)}
              className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
            >
              {sq.label}
            </button>
          ))}
        </div>

        {/* SQL Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            spellCheck={false}
            className="w-full bg-secondary border border-border rounded-lg p-4 font-mono text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            placeholder="Write your SQL query here..."
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
            Ctrl+Enter to run
          </span>
        </div>

        {/* Run button */}
        <Button onClick={runQuery} disabled={isRunning || !query.trim()} variant="hero" className="w-full h-11">
          {isRunning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4" /> Run Query</>
          )}
        </Button>

        {/* Error display */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}

        {/* Results table */}
        {results && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary px-4 py-2 flex items-center gap-2 border-b border-border">
              <Table2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {results.values.length} row{results.values.length !== 1 ? "s" : ""} returned
              </span>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    {results.columns.map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left text-xs font-semibold text-foreground border-b border-border whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.values.map((row, ri) => (
                    <tr key={ri} className="hover:bg-secondary/30 transition-colors">
                      {row.map((val, ci) => (
                        <td
                          key={ci}
                          className="px-4 py-2 text-xs text-muted-foreground border-b border-border whitespace-nowrap"
                        >
                          {val === null ? (
                            <span className="italic opacity-50">NULL</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SQLPlayground;
