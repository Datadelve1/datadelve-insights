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
import { useDatasets, type SqlDatasetRow } from "@/hooks/useDatasets";
import type initSqlJs from "sql.js";

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type SqlJsDatabase = InstanceType<SqlJsStatic["Database"]>;

interface QueryResult {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}

const SQLPlayground = () => {
  const { datasets, loading: datasetsLoading } = useDatasets();
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [sqlJs, setSqlJs] = useState<SqlJsStatic | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [query, setQuery] = useState("");
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
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
        setSqlJs(SQL);
      } catch (err: any) {
        setError("Failed to initialize SQL engine: " + err.message);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Load first dataset once both sqlJs and datasets are ready
  useEffect(() => {
    if (sqlJs && datasets.length > 0 && !selectedDataset) {
      const first = datasets[0];
      setSelectedDataset(first.id);
      loadDataset(sqlJs, first);
    }
  }, [sqlJs, datasets, selectedDataset]);

  const loadDataset = useCallback(
    (SQL: SqlJsStatic, dataset: SqlDatasetRow) => {
      try {
        if (db) db.close();
        const newDb = new SQL.Database();
        newDb.run(dataset.schema_sql);
        newDb.run(dataset.seed_sql);
        setDb(newDb);
        const firstQuery = dataset.sample_queries?.[0]?.query || `SELECT name FROM sqlite_master WHERE type='table';`;
        setQuery(firstQuery);
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
    const dataset = datasets.find((d) => d.id === datasetId);
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
    const dataset = datasets.find((d) => d.id === selectedDataset);
    if (dataset && sqlJs) loadDataset(sqlJs, dataset);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  };

  const currentDataset = datasets.find((d) => d.id === selectedDataset);

  if (isInitializing || datasetsLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground text-sm">Loading SQL engine...</span>
        </CardContent>
      </Card>
    );
  }

  if (datasets.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No datasets available yet</p>
            <p className="text-sm text-muted-foreground">Datasets will be added by the admin.</p>
          </div>
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
                {datasets.map((ds) => (
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
        {currentDataset?.description && (
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            {currentDataset.description}
          </p>
        )}

        {/* Schema viewer */}
        {showSchema && currentDataset && (
          <pre className="text-xs bg-secondary rounded-lg p-4 overflow-x-auto text-foreground border border-border font-mono max-h-60 overflow-y-auto">
            {currentDataset.schema_sql.trim()}
          </pre>
        )}

        {/* Sample queries */}
        {currentDataset && currentDataset.sample_queries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Try:</span>
            {currentDataset.sample_queries.map((sq, i) => (
              <button
                key={i}
                onClick={() => setQuery(sq.query)}
                className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
              >
                {sq.label}
              </button>
            ))}
          </div>
        )}

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
                    <tr key={ri} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 text-foreground whitespace-nowrap">
                          {cell === null ? (
                            <span className="text-muted-foreground italic">NULL</span>
                          ) : (
                            String(cell)
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
