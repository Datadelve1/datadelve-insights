import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
  Table2,
} from "lucide-react";
import type initSqlJs from "sql.js";

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;

interface SampleQuery {
  label: string;
  query: string;
}

interface SqlDataset {
  id: string;
  name: string;
  description: string;
  schema_sql: string;
  seed_sql: string;
  sample_queries: SampleQuery[];
  created_at: string;
}

const DatasetManagement = () => {
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<SqlDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Test SQL
  const [sqlJs, setSqlJs] = useState<SqlJsStatic | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schemaSql, setSchemaSql] = useState("");
  const [seedSql, setSeedSql] = useState("");
  const [sampleQueries, setSampleQueries] = useState<SampleQuery[]>([
    { label: "", query: "" },
  ]);

  useEffect(() => {
    fetchDatasets();
    initSql();
  }, []);

  const initSql = async () => {
    try {
      const initSqlJsFn = (await import("sql.js")).default;
      const SQL = await initSqlJsFn({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
      setSqlJs(SQL);
    } catch {}
  };

  const fetchDatasets = async () => {
    const { data } = await supabase
      .from("sql_datasets")
      .select("*")
      .order("created_at");
    setDatasets(
      (data || []).map((d: any) => ({
        ...d,
        sample_queries:
          typeof d.sample_queries === "string"
            ? JSON.parse(d.sample_queries)
            : d.sample_queries || [],
      }))
    );
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSchemaSql("");
    setSeedSql("");
    setSampleQueries([{ label: "", query: "" }]);
    setEditingId(null);
    setTestResult(null);
    setTestError(null);
  };

  const openEdit = (d: SqlDataset) => {
    setEditingId(d.id);
    setName(d.name);
    setDescription(d.description || "");
    setSchemaSql(d.schema_sql);
    setSeedSql(d.seed_sql);
    setSampleQueries(
      d.sample_queries.length > 0 ? d.sample_queries : [{ label: "", query: "" }]
    );
    setTestResult(null);
    setTestError(null);
    setDialogOpen(true);
  };

  const handleTestDataset = () => {
    if (!sqlJs || !schemaSql.trim() || !seedSql.trim()) {
      setTestError("Provide schema and seed SQL first");
      return;
    }
    setTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const db = new sqlJs.Database();
      db.run(schemaSql);
      db.run(seedSql);
      // Try a simple SELECT to verify
      const tables = db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
      );
      const tableNames =
        tables.length > 0 ? tables[0].values.map((r) => r[0]).join(", ") : "none";
      let rowCount = 0;
      if (tables.length > 0) {
        for (const t of tables[0].values) {
          const r = db.exec(`SELECT COUNT(*) FROM "${t[0]}"`);
          if (r.length > 0) rowCount += Number(r[0].values[0][0]);
        }
      }
      db.close();
      setTestResult(`✅ Tables: ${tableNames} — Total rows: ${rowCount}`);
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !schemaSql.trim() || !seedSql.trim()) {
      toast({ title: "Name, Schema SQL, and Seed SQL are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const validQueries = sampleQueries.filter(
        (q) => q.label.trim() && q.query.trim()
      );
      const payload = {
        name: name.trim(),
        description: description.trim(),
        schema_sql: schemaSql.trim(),
        seed_sql: seedSql.trim(),
        sample_queries: validQueries as any,
      };

      if (editingId) {
        const { error } = await supabase
          .from("sql_datasets")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Dataset updated" });
      } else {
        const { error } = await supabase.from("sql_datasets").insert(payload as any);
        if (error) throw error;
        toast({ title: "Dataset created" });
      }

      setDialogOpen(false);
      resetForm();
      fetchDatasets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sql_datasets").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dataset deleted" });
      fetchDatasets();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Dataset Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create SQL datasets for assignments and the playground
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? "Edit Dataset" : "Create Dataset"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Employees & Departments"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div>
                <Label>Schema SQL (CREATE TABLE statements)</Label>
                <Textarea
                  value={schemaSql}
                  onChange={(e) => setSchemaSql(e.target.value)}
                  placeholder={`CREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  first_name TEXT NOT NULL,\n  salary REAL\n);`}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Seed SQL (INSERT statements)</Label>
                <Textarea
                  value={seedSql}
                  onChange={(e) => setSeedSql(e.target.value)}
                  placeholder={`INSERT INTO employees VALUES (1, 'Adaeze', 85000);\nINSERT INTO employees VALUES (2, 'Chidi', 72000);`}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {/* Test button */}
              <Button
                variant="outline"
                onClick={handleTestDataset}
                disabled={testing}
                className="gap-2"
              >
                {testing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
                ) : (
                  <><Play className="w-4 h-4" /> Test Dataset</>
                )}
              </Button>
              {testResult && (
                <p className="text-sm text-primary bg-primary/10 rounded-lg p-3">
                  {testResult}
                </p>
              )}
              {testError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 font-mono">
                  {testError}
                </p>
              )}

              {/* Sample queries */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-display">
                    Sample Queries (optional, for SQL Playground)
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSampleQueries([...sampleQueries, { label: "", query: "" }])
                    }
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {sampleQueries.map((sq, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                      <Input
                        value={sq.label}
                        onChange={(e) => {
                          const u = [...sampleQueries];
                          u[i] = { ...u[i], label: e.target.value };
                          setSampleQueries(u);
                        }}
                        placeholder="Label"
                      />
                      <Textarea
                        value={sq.query}
                        onChange={(e) => {
                          const u = [...sampleQueries];
                          u[i] = { ...u[i], query: e.target.value };
                          setSampleQueries(u);
                        }}
                        placeholder="SELECT * FROM ..."
                        rows={2}
                        className="font-mono text-sm"
                      />
                      {sampleQueries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSampleQueries(sampleQueries.filter((_, j) => j !== i))
                          }
                          className="text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : editingId ? (
                  "Update Dataset"
                ) : (
                  "Create Dataset"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {datasets.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No datasets created yet</p>
            <p className="text-sm text-muted-foreground">
              Upload your first dataset so students can practice SQL queries.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {datasets.map((d) => {
            const expanded = expandedId === d.id;
            return (
              <Card key={d.id} className="border-border">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : d.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {d.name}
                      </p>
                      {d.description && (
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(d);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete dataset?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this dataset.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(d.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {expanded && (
                  <CardContent className="border-t border-border pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Schema</p>
                      <pre className="text-xs font-mono bg-secondary p-3 rounded border border-border text-foreground overflow-x-auto max-h-40 overflow-y-auto">
                        {d.schema_sql}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Seed Data</p>
                      <pre className="text-xs font-mono bg-secondary p-3 rounded border border-border text-foreground overflow-x-auto max-h-40 overflow-y-auto">
                        {d.seed_sql}
                      </pre>
                    </div>
                    {d.sample_queries.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Sample Queries
                        </p>
                        <div className="space-y-2">
                          {d.sample_queries.map((sq, i) => (
                            <div key={i} className="rounded bg-secondary/50 p-2">
                              <p className="text-xs font-medium text-foreground">{sq.label}</p>
                              <pre className="text-xs font-mono text-muted-foreground mt-1">
                                {sq.query}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DatasetManagement;
