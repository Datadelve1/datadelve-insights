import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format,
  isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks,
} from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type View = "month" | "week" | "day";

interface CalItem {
  id: string;
  date: Date;
  title: string;
  kind: string;
  color: string;
}

export default function OpsCalendar() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [items, setItems] = useState<CalItem[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      const start = startOfMonth(cursor).toISOString();
      const end = endOfMonth(addMonths(cursor, 1)).toISOString();
      const [events, tasks, emails, cohorts] = await Promise.all([
        supabase.from("ops_events").select("id,title,starts_at,kind"),
        supabase.from("ops_tasks").select("id,title,due_date").not("due_date", "is", null),
        supabase.from("ops_emails").select("id,subject,scheduled_at,status").not("scheduled_at", "is", null),
        supabase.from("ops_cohorts").select("id,number,onboarding_date,graduation_date,beginner_dates,professional_dates"),
      ]);

      const all: CalItem[] = [];
      (events.data || []).forEach((e: any) =>
        all.push({ id: `e-${e.id}`, date: new Date(e.starts_at), title: e.title, kind: e.kind, color: "bg-blue-500/70" })
      );
      (tasks.data || []).forEach((t: any) =>
        all.push({ id: `t-${t.id}`, date: new Date(t.due_date), title: `Task: ${t.title}`, kind: "task", color: "bg-amber-500/70" })
      );
      (emails.data || []).forEach((e: any) =>
        all.push({ id: `m-${e.id}`, date: new Date(e.scheduled_at), title: `Email: ${e.subject || "(no subject)"}`, kind: `email-${e.status}`, color: "bg-purple-500/70" })
      );
      (cohorts.data || []).forEach((c: any) => {
        if (c.onboarding_date) all.push({ id: `c-onb-${c.id}`, date: new Date(c.onboarding_date), title: `Cohort ${c.number} onboarding`, kind: "onboarding", color: "bg-primary" });
        if (c.graduation_date) all.push({ id: `c-grd-${c.id}`, date: new Date(c.graduation_date), title: `Cohort ${c.number} graduation`, kind: "graduation", color: "bg-emerald-500/70" });
        (c.beginner_dates || []).forEach((d: string, i: number) => all.push({ id: `c-b-${c.id}-${i}`, date: new Date(d), title: `Cohort ${c.number} beginner class`, kind: "class", color: "bg-cyan-500/70" }));
        (c.professional_dates || []).forEach((d: string, i: number) => all.push({ id: `c-p-${c.id}-${i}`, date: new Date(d), title: `Cohort ${c.number} professional class`, kind: "class", color: "bg-indigo-500/70" }));
      });
      setItems(all);
    })();
  }, [cursor]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const days: Date[] = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    return days;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cursor]);

  const itemsForDay = (d: Date) => items.filter((i) => isSameDay(i.date, d));

  const nav = (dir: -1 | 1) => {
    if (view === "month") setCursor(dir < 0 ? subMonths(cursor, 1) : addMonths(cursor, 1));
    else if (view === "week") setCursor(dir < 0 ? subWeeks(cursor, 1) : addWeeks(cursor, 1));
    else setCursor(addDays(cursor, dir));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Operations Calendar</h1>
          <p className="text-sm text-muted-foreground">Cohorts, classes, tasks, events and scheduled emails.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["month", "week", "day"] as View[]).map(v => (
            <Button key={v} variant={view === v ? "default" : "outline"} size="sm" onClick={() => setView(v)}>{v}</Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => nav(-1)}><ChevronLeft className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => nav(1)}><ChevronRight className="w-4 h-4"/></Button>
        </div>
        <div className="text-lg font-medium">
          {view === "day" ? format(cursor, "EEEE, MMMM d, yyyy") : format(cursor, "MMMM yyyy")}
        </div>
      </div>

      {view === "month" && (
        <Card><CardContent className="p-3">
          <div className="grid grid-cols-7 gap-px bg-border rounded overflow-hidden">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-card p-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
            ))}
            {monthDays.map(d => {
              const its = itemsForDay(d);
              return (
                <button key={d.toISOString()} onClick={() => setSelected(d)} className={`bg-card min-h-24 p-2 text-left hover:bg-secondary/40 ${!isSameMonth(d, cursor) ? "opacity-40" : ""}`}>
                  <div className={`text-xs ${isSameDay(d, new Date()) ? "text-primary font-bold" : ""}`}>{format(d, "d")}</div>
                  <div className="mt-1 space-y-1">
                    {its.slice(0,3).map(i => (
                      <div key={i.id} className={`text-[10px] text-white ${i.color} rounded px-1 py-0.5 truncate`}>{i.title}</div>
                    ))}
                    {its.length > 3 && <div className="text-[10px] text-muted-foreground">+{its.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent></Card>
      )}

      {view === "week" && (
        <Card><CardContent className="p-3 grid grid-cols-7 gap-2">
          {weekDays.map(d => (
            <div key={d.toISOString()} className="min-h-64 border border-border rounded p-2">
              <div className={`text-sm font-medium ${isSameDay(d, new Date()) ? "text-primary" : ""}`}>{format(d, "EEE d")}</div>
              <div className="mt-2 space-y-1">
                {itemsForDay(d).map(i => (
                  <div key={i.id} className={`text-xs text-white ${i.color} rounded px-2 py-1`}>{i.title}</div>
                ))}
              </div>
            </div>
          ))}
        </CardContent></Card>
      )}

      {view === "day" && (
        <Card><CardContent className="p-4 space-y-2">
          {itemsForDay(cursor).length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
          {itemsForDay(cursor).map(i => (
            <div key={i.id} className="flex items-center gap-3 p-3 border border-border rounded">
              <div className={`w-2 h-2 rounded-full ${i.color}`} />
              <div className="flex-1">{i.title}</div>
              <Badge variant="outline">{i.kind}</Badge>
            </div>
          ))}
        </CardContent></Card>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected && format(selected, "EEEE, MMM d, yyyy")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {selected && itemsForDay(selected).length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            {selected && itemsForDay(selected).map(i => (
              <div key={i.id} className="flex items-center gap-3 p-2 border border-border rounded">
                <div className={`w-2 h-2 rounded-full ${i.color}`} />
                <div className="flex-1 text-sm">{i.title}</div>
                <Badge variant="outline">{i.kind}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
