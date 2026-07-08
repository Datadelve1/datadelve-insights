import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, GraduationCap, Sparkles, BookOpen, Wrench, Briefcase } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay, parseISO, differenceInCalendarDays, startOfWeek, endOfWeek, addDays } from "date-fns";

type EventKind = "onboarding" | "beginner" | "project" | "professional" | "graduation";

interface TEvent {
  id: string;
  cohort: number;
  kind: EventKind;
  start: string; // ISO date
  end?: string;  // ISO date (inclusive) for ranges
  title: string;
  description: string;
}

const KIND_META: Record<EventKind, { label: string; color: string; ring: string; text: string; icon: any }> = {
  onboarding:   { label: "Onboarding",   color: "bg-sky-500",     ring: "ring-sky-400/40",     text: "text-sky-50",     icon: Sparkles },
  beginner:     { label: "Beginner",     color: "bg-emerald-500", ring: "ring-emerald-400/40", text: "text-emerald-50", icon: BookOpen },
  project:      { label: "Project Phase",color: "bg-amber-500",   ring: "ring-amber-400/40",   text: "text-amber-950",  icon: Wrench },
  professional: { label: "Professional", color: "bg-indigo-500",  ring: "ring-indigo-400/40",  text: "text-indigo-50",  icon: Briefcase },
  graduation:   { label: "Graduation",   color: "bg-primary",     ring: "ring-primary/40",     text: "text-primary-foreground", icon: GraduationCap },
};

// Full schedule July 2026 – July 2027
const EVENTS: TEvent[] = [
  // July 2026
  { id: "c2-grad",   cohort: 2, kind: "graduation",   start: "2026-07-31", title: "Cohort 2 Graduation", description: "Cohort 2 completes the programme." },
  { id: "c3-onb",    cohort: 3, kind: "onboarding",   start: "2026-07-31", title: "Cohort 3 Onboarding", description: "Kick-off session for Cohort 3." },

  // Aug – Sep 2026
  { id: "c3-beg",    cohort: 3, kind: "beginner",     start: "2026-08-01", end: "2026-09-11", title: "Cohort 3 Beginner Class", description: "6 weeks of foundational training." },
  { id: "c2-pro",    cohort: 2, kind: "professional", start: "2026-08-08", end: "2026-08-29", title: "Cohort 2 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c3-proj",   cohort: 3, kind: "project",      start: "2026-09-12", end: "2026-09-25", title: "Cohort 3 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c3-pro",    cohort: 3, kind: "professional", start: "2026-09-26", end: "2026-10-23", title: "Cohort 3 Professional Class", description: "4 weeks of professional training." },

  // Oct – Nov 2026
  { id: "c3-grad",   cohort: 3, kind: "graduation",   start: "2026-10-09", title: "Cohort 3 Graduation", description: "Cohort 3 completes the programme." },
  { id: "c4-onb",    cohort: 4, kind: "onboarding",   start: "2026-10-09", title: "Cohort 4 Onboarding", description: "Kick-off session for Cohort 4." },
  { id: "c4-beg",    cohort: 4, kind: "beginner",     start: "2026-10-10", end: "2026-11-20", title: "Cohort 4 Beginner Class", description: "6 weeks of foundational training." },
  { id: "c4-grad",   cohort: 4, kind: "graduation",   start: "2026-11-20", title: "Cohort 4 Graduation", description: "Cohort 4 completes the programme." },
  { id: "c5-onb",    cohort: 5, kind: "onboarding",   start: "2026-11-20", title: "Cohort 5 Onboarding", description: "Kick-off session for Cohort 5." },
  { id: "c4-proj",   cohort: 4, kind: "project",      start: "2026-11-21", end: "2026-12-04", title: "Cohort 4 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c5-beg",    cohort: 5, kind: "beginner",     start: "2026-11-21", end: "2027-01-01", title: "Cohort 5 Beginner Class", description: "6 weeks of foundational training." },

  // Dec 2026 – Jan 2027
  { id: "c4-pro",    cohort: 4, kind: "professional", start: "2026-12-05", end: "2027-01-01", title: "Cohort 4 Professional Class", description: "4 weeks of professional training." },
  { id: "c5-grad",   cohort: 5, kind: "graduation",   start: "2027-01-01", title: "Cohort 5 Graduation", description: "Cohort 5 completes the programme." },
  { id: "c6-onb",    cohort: 6, kind: "onboarding",   start: "2027-01-01", title: "Cohort 6 Onboarding", description: "Kick-off session for Cohort 6." },
  { id: "c5-proj",   cohort: 5, kind: "project",      start: "2027-01-02", end: "2027-01-15", title: "Cohort 5 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c5-pro",    cohort: 5, kind: "professional", start: "2027-01-08", end: "2027-01-29", title: "Cohort 5 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c6-beg",    cohort: 6, kind: "beginner",     start: "2027-01-02", end: "2027-02-12", title: "Cohort 6 Beginner Class", description: "6 weeks of foundational training." },

  // Feb – Mar 2027
  { id: "c6-proj",   cohort: 6, kind: "project",      start: "2027-02-13", end: "2027-02-26", title: "Cohort 6 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c6-grad",   cohort: 6, kind: "graduation",   start: "2027-02-12", title: "Cohort 6 Graduation", description: "Cohort 6 completes the programme." },
  { id: "c7-onb",    cohort: 7, kind: "onboarding",   start: "2027-02-12", title: "Cohort 7 Onboarding", description: "Kick-off session for Cohort 7." },
  { id: "c6-pro",    cohort: 6, kind: "professional", start: "2027-02-19", end: "2027-03-12", title: "Cohort 6 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c7-beg",    cohort: 7, kind: "beginner",     start: "2027-02-13", end: "2027-03-26", title: "Cohort 7 Beginner Class", description: "6 weeks of foundational training." },

  // Mar – Apr 2027
  { id: "c7-proj",   cohort: 7, kind: "project",      start: "2027-03-27", end: "2027-04-09", title: "Cohort 7 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c7-grad",   cohort: 7, kind: "graduation",   start: "2027-03-26", title: "Cohort 7 Graduation", description: "Cohort 7 completes the programme." },
  { id: "c8-onb",    cohort: 8, kind: "onboarding",   start: "2027-03-26", title: "Cohort 8 Onboarding", description: "Kick-off session for Cohort 8." },
  { id: "c7-pro",    cohort: 7, kind: "professional", start: "2027-04-02", end: "2027-04-23", title: "Cohort 7 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c8-beg",    cohort: 8, kind: "beginner",     start: "2027-03-27", end: "2027-05-07", title: "Cohort 8 Beginner Class", description: "6 weeks of foundational training." },

  // May – Jun 2027
  { id: "c8-proj",   cohort: 8, kind: "project",      start: "2027-05-08", end: "2027-05-21", title: "Cohort 8 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c8-grad",   cohort: 8, kind: "graduation",   start: "2027-05-07", title: "Cohort 8 Graduation", description: "Cohort 8 completes the programme." },
  { id: "c9-onb",    cohort: 9, kind: "onboarding",   start: "2027-05-07", title: "Cohort 9 Onboarding", description: "Kick-off session for Cohort 9." },
  { id: "c8-pro",    cohort: 8, kind: "professional", start: "2027-05-14", end: "2027-06-04", title: "Cohort 8 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c9-beg",    cohort: 9, kind: "beginner",     start: "2027-05-08", end: "2027-06-18", title: "Cohort 9 Beginner Class", description: "6 weeks of foundational training." },

  // Jun – Jul 2027
  { id: "c9-proj",   cohort: 9, kind: "project",      start: "2027-06-19", end: "2027-07-02", title: "Cohort 9 Project Phase", description: "2 weeks of projects & assessments." },
  { id: "c9-grad",   cohort: 9, kind: "graduation",   start: "2027-06-18", title: "Cohort 9 Graduation", description: "Cohort 9 completes the programme." },
  { id: "c10-onb",   cohort: 10, kind: "onboarding",  start: "2027-06-18", title: "Cohort 10 Onboarding", description: "Kick-off session for Cohort 10." },
  { id: "c9-pro",    cohort: 9, kind: "professional", start: "2027-06-25", end: "2027-07-16", title: "Cohort 9 Professional Class", description: "Advanced concepts & career readiness." },
  { id: "c10-beg",   cohort: 10, kind: "beginner",    start: "2027-06-19", end: "2027-07-30", title: "Cohort 10 Beginner Class", description: "6 weeks of foundational training." },

  { id: "c10-grad",  cohort: 10, kind: "graduation",  start: "2027-07-30", title: "Cohort 10 Graduation", description: "Cohort 10 completes the programme." },
  { id: "c11-onb",   cohort: 11, kind: "onboarding",  start: "2027-07-30", title: "Cohort 11 Onboarding", description: "Kick-off session for Cohort 11." },
];

function eventInterval(e: TEvent) {
  const s = parseISO(e.start);
  const en = e.end ? parseISO(e.end) : s;
  return { start: s, end: en };
}

function eventsForMonth(month: Date) {
  const mStart = startOfMonth(month);
  const mEnd = endOfMonth(month);
  return EVENTS.filter((e) => {
    const { start, end } = eventInterval(e);
    return start <= mEnd && end >= mStart;
  }).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime() || a.cohort - b.cohort);
}

function eventsForDay(day: Date) {
  return EVENTS.filter((e) => {
    const { start, end } = eventInterval(e);
    return isWithinInterval(day, { start, end });
  });
}

const RANGE_START = new Date(2026, 6, 1);  // Jul 2026
const RANGE_END = new Date(2027, 6, 31);   // Jul 2027

export default function OpsTrainingSchedule() {
  const [cursor, setCursor] = useState<Date>(RANGE_START);
  const [filter, setFilter] = useState<EventKind | "all">("all");

  const months = useMemo(() => {
    const arr: Date[] = [];
    let d = RANGE_START;
    while (d <= RANGE_END) { arr.push(d); d = addMonths(d, 1); }
    return arr;
  }, []);

  const monthEvents = useMemo(
    () => eventsForMonth(cursor).filter(e => filter === "all" || e.kind === filter),
    [cursor, filter]
  );

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const days: Date[] = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    return days;
  }, [cursor]);

  const canPrev = cursor > RANGE_START;
  const canNext = cursor < startOfMonth(RANGE_END);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Training Schedule</h1>
            <p className="text-sm text-muted-foreground">Full training cycle · July 2026 – July 2027</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={!canPrev} onClick={() => setCursor(subMonths(cursor, 1))}><ChevronLeft className="w-4 h-4"/></Button>
            <div className="min-w-40 text-center font-medium">{format(cursor, "MMMM yyyy")}</div>
            <Button variant="outline" size="icon" disabled={!canNext} onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="w-4 h-4"/></Button>
          </div>
        </div>

        {/* Legend / filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
          {(Object.keys(KIND_META) as EventKind[]).map(k => {
            const m = KIND_META[k];
            const Icon = m.icon;
            return (
              <Button key={k} variant={filter === k ? "default" : "outline"} size="sm" onClick={() => setFilter(k)} className="gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${m.color}`} />
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </Button>
            );
          })}
        </div>

        {/* Month quick jump */}
        <div className="flex flex-wrap gap-1.5">
          {months.map(m => (
            <button
              key={m.toISOString()}
              onClick={() => setCursor(m)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                isSameDay(startOfMonth(m), startOfMonth(cursor))
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {format(m, "MMM yy")}
            </button>
          ))}
        </div>

        {/* Grid + timeline */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Mini month grid */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-3">{format(cursor, "MMMM yyyy")}</div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="text-[10px] uppercase text-muted-foreground py-1">{d}</div>
                ))}
                {gridDays.map(d => {
                  const evs = eventsForDay(d).filter(e => filter === "all" || e.kind === filter);
                  const inMonth = d.getMonth() === cursor.getMonth();
                  const primary = evs[0];
                  const cell = (
                    <div className={`aspect-square rounded-md border text-xs flex flex-col items-center justify-start p-1 gap-0.5 ${
                      inMonth ? "border-border" : "border-transparent opacity-40"
                    } ${isSameDay(d, new Date()) ? "ring-1 ring-primary" : ""}`}>
                      <span className={inMonth ? "" : "text-muted-foreground"}>{format(d, "d")}</span>
                      {evs.length > 0 && (
                        <div className="flex gap-0.5 flex-wrap justify-center">
                          {evs.slice(0, 3).map(e => (
                            <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${KIND_META[e.kind].color}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  return primary ? (
                    <Tooltip key={d.toISOString()}>
                      <TooltipTrigger asChild><div className="cursor-help">{cell}</div></TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="font-medium mb-1">{format(d, "EEE, MMM d")}</div>
                        <div className="space-y-1">
                          {evs.map(e => (
                            <div key={e.id} className="flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${KIND_META[e.kind].color}`} />
                              <span>{e.title}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={d.toISOString()}>{cell}</div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Timeline for the month */}
          <div className="lg:col-span-2 space-y-3">
            {monthEvents.length === 0 && (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">No events for this month with the current filter.</CardContent></Card>
            )}
            {monthEvents.map(e => {
              const m = KIND_META[e.kind];
              const Icon = m.icon;
              const { start, end } = eventInterval(e);
              const isRange = !!e.end && !isSameDay(start, end);
              const days = differenceInCalendarDays(end, start) + 1;
              return (
                <Tooltip key={e.id}>
                  <TooltipTrigger asChild>
                    <div className={`group rounded-lg border border-border bg-card hover:bg-secondary/40 transition-colors overflow-hidden cursor-help`}>
                      <div className="flex">
                        <div className={`w-1.5 ${m.color}`} />
                        <div className="flex-1 p-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-md ${m.color} ${m.text} flex items-center justify-center shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{e.title}</span>
                              <Badge variant="outline" className="text-[10px]">Cohort {e.cohort}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{m.label}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {isRange
                                ? `${format(start, "EEE, MMM d")} → ${format(end, "EEE, MMM d, yyyy")} · ${days} days`
                                : format(start, "EEEE, MMMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="font-medium mb-1">{e.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {isRange
                        ? `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
                        : format(start, "MMMM d, yyyy")}
                    </div>
                    <div className="text-xs">{e.description}</div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Full chronological overview grouped by month */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-display font-semibold">Full cycle overview</h2>
          {months.map(m => {
            const evs = eventsForMonth(m).filter(e => filter === "all" || e.kind === filter);
            if (evs.length === 0) return null;
            return (
              <div key={m.toISOString()}>
                <div className="text-sm font-medium text-muted-foreground mb-2">{format(m, "MMMM yyyy")}</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {evs.map(e => {
                    const meta = KIND_META[e.kind];
                    const { start, end } = eventInterval(e);
                    const isRange = !!e.end && !isSameDay(start, end);
                    return (
                      <div key={`${m.toISOString()}-${e.id}`} className="flex items-center gap-3 p-2.5 rounded-md border border-border bg-card">
                        <span className={`w-2 h-2 rounded-full ${meta.color} shrink-0`} />
                        <div className="text-xs flex-1 min-w-0 truncate">
                          <span className="font-medium">{e.title}</span>
                          <span className="text-muted-foreground"> · {isRange ? `${format(start, "MMM d")} – ${format(end, "MMM d")}` : format(start, "MMM d")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
