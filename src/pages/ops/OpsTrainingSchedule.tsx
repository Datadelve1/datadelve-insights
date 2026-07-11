import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flag } from "lucide-react";
import {
  addMonths,
  differenceInCalendarDays,
  eachMonthOfInterval,
  format,
  startOfMonth,
} from "date-fns";

type PhaseKind = "pre_onboarding" | "beginner" | "project" | "professional";
type Segment = { kind: PhaseKind; start: Date; end: Date };
type Cohort = {
  number: number;
  segments: Segment[];
  graduation: Date;
};

const d = (s: string) => new Date(s + "T00:00:00");

// Break: Jan 1–Jan 28, 2027 (inclusive pause window)
const BREAK_START = d("2027-01-01");
const BREAK_END = d("2027-01-28");

const COHORTS: Cohort[] = [
  {
    number: 3,
    segments: [
      { kind: "pre_onboarding", start: d("2026-07-26"), end: d("2026-07-31") },
      { kind: "beginner", start: d("2026-07-31"), end: d("2026-09-11") },
      { kind: "project", start: d("2026-09-11"), end: d("2026-09-25") },
      { kind: "professional", start: d("2026-09-25"), end: d("2026-10-23") },
    ],
    graduation: d("2026-10-23"),
  },
  {
    number: 4,
    segments: [
      { kind: "pre_onboarding", start: d("2026-09-06"), end: d("2026-09-11") },
      { kind: "beginner", start: d("2026-09-11"), end: d("2026-10-23") },
      { kind: "project", start: d("2026-10-23"), end: d("2026-11-06") },
      { kind: "professional", start: d("2026-11-06"), end: d("2026-12-04") },
    ],
    graduation: d("2026-12-04"),
  },
  {
    number: 5,
    segments: [
      { kind: "pre_onboarding", start: d("2026-10-18"), end: d("2026-10-23") },
      { kind: "beginner", start: d("2026-10-23"), end: d("2026-12-04") },
      { kind: "project", start: d("2026-12-04"), end: d("2026-12-18") },
      { kind: "professional", start: d("2026-12-18"), end: d("2027-01-01") },
      { kind: "professional", start: d("2027-01-28"), end: d("2027-02-11") },
    ],
    graduation: d("2027-02-11"),
  },
  {
    number: 6,
    segments: [
      { kind: "pre_onboarding", start: d("2026-11-29"), end: d("2026-12-04") },
      { kind: "beginner", start: d("2026-12-04"), end: d("2027-01-01") },
      { kind: "beginner", start: d("2027-01-28"), end: d("2027-02-11") },
      { kind: "project", start: d("2027-02-11"), end: d("2027-02-25") },
      { kind: "professional", start: d("2027-02-25"), end: d("2027-03-25") },
    ],
    graduation: d("2027-03-25"),
  },
  {
    number: 7,
    segments: [
      { kind: "pre_onboarding", start: d("2027-02-06"), end: d("2027-02-11") },
      { kind: "beginner", start: d("2027-02-11"), end: d("2027-03-25") },
      { kind: "project", start: d("2027-03-25"), end: d("2027-04-08") },
      { kind: "professional", start: d("2027-04-08"), end: d("2027-05-06") },
    ],
    graduation: d("2027-05-06"),
  },
  {
    number: 8,
    segments: [
      { kind: "pre_onboarding", start: d("2027-03-20"), end: d("2027-03-25") },
      { kind: "beginner", start: d("2027-03-25"), end: d("2027-05-06") },
      { kind: "project", start: d("2027-05-06"), end: d("2027-05-20") },
      { kind: "professional", start: d("2027-05-20"), end: d("2027-06-17") },
    ],
    graduation: d("2027-06-17"),
  },
  {
    number: 9,
    segments: [
      { kind: "pre_onboarding", start: d("2027-05-01"), end: d("2027-05-06") },
      { kind: "beginner", start: d("2027-05-06"), end: d("2027-06-17") },
      { kind: "project", start: d("2027-06-17"), end: d("2027-07-01") },
      { kind: "professional", start: d("2027-07-01"), end: d("2027-07-29") },
    ],
    graduation: d("2027-07-29"),
  },
  {
    number: 10,
    segments: [
      { kind: "pre_onboarding", start: d("2027-06-12"), end: d("2027-06-17") },
      { kind: "beginner", start: d("2027-06-17"), end: d("2027-07-29") },
      { kind: "project", start: d("2027-07-29"), end: d("2027-08-12") },
      { kind: "professional", start: d("2027-08-12"), end: d("2027-09-09") },
    ],
    graduation: d("2027-09-09"),
  },
  {
    number: 11,
    segments: [
      { kind: "pre_onboarding", start: d("2027-07-24"), end: d("2027-07-29") },
      { kind: "beginner", start: d("2027-07-29"), end: d("2027-09-09") },
    ],
    graduation: d("2027-09-09"), // ongoing placeholder, not shown
  },
];

const TIMELINE_START = d("2026-07-26");
const TIMELINE_END = d("2027-09-30");
const TOTAL_DAYS = differenceInCalendarDays(TIMELINE_END, TIMELINE_START);

const PHASE_META: Record<PhaseKind, { label: string; cls: string; badge: string }> = {
  pre_onboarding: {
    label: "Pre-Onboarding (5d)",
    cls: "bg-purple-500/85 hover:bg-purple-500 text-white border-purple-600",
    badge: "bg-purple-500 text-white",
  },
  beginner: {
    label: "Beginner Class",
    cls: "bg-blue-500/85 hover:bg-blue-500 text-white border-blue-600",
    badge: "bg-blue-500 text-white",
  },
  project: {
    label: "Project Phase",
    cls: "bg-orange-500/85 hover:bg-orange-500 text-white border-orange-600",
    badge: "bg-orange-500 text-white",
  },
  professional: {
    label: "Professional Class",
    cls: "bg-emerald-500/85 hover:bg-emerald-500 text-white border-emerald-600",
    badge: "bg-emerald-500 text-white",
  },
};

function pctFromStart(date: Date) {
  const days = differenceInCalendarDays(date, TIMELINE_START);
  return (days / TOTAL_DAYS) * 100;
}
function widthPct(start: Date, end: Date) {
  return (differenceInCalendarDays(end, start) / TOTAL_DAYS) * 100;
}

export default function OpsTrainingSchedule() {
  const [zoom, setZoom] = useState(1.6); // width multiplier

  const months = useMemo(
    () => eachMonthOfInterval({ start: startOfMonth(TIMELINE_START), end: TIMELINE_END }),
    []
  );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-display font-bold">Training Schedule</h1>
            <p className="text-sm text-muted-foreground">
              Cohort swimlanes — Jul 2026 → Sep 2027. Cohorts overlap; each row is one cohort.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Legend swatch="bg-blue-500" label="Beginner (6w)" />
            <Legend swatch="bg-orange-500" label="Project (2w)" />
            <Legend swatch="bg-emerald-500" label="Professional (4w)" />
            <Legend swatch="bg-yellow-400" label="Graduation" icon />
            <Legend swatch="bg-muted border border-dashed border-muted-foreground" label="Break" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Zoom</span>
          <button
            className="px-2 py-1 rounded border border-border hover:bg-secondary"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
          >
            −
          </button>
          <button
            className="px-2 py-1 rounded border border-border hover:bg-secondary"
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          >
            +
          </button>
        </div>

        <Card className="overflow-x-auto">
          <div style={{ width: `${100 * zoom}%`, minWidth: "1100px" }} className="relative">
            {/* Month header */}
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="w-28 shrink-0 px-3 py-2 text-xs font-medium text-muted-foreground border-r border-border">
                Cohort
              </div>
              <div className="relative flex-1 h-9">
                {months.map((m) => {
                  const left = pctFromStart(m);
                  const next = addMonths(m, 1);
                  const w = widthPct(m, next > TIMELINE_END ? TIMELINE_END : next);
                  return (
                    <div
                      key={m.toISOString()}
                      className="absolute top-0 h-full border-r border-border/60 text-[11px] text-muted-foreground px-1.5 py-2 whitespace-nowrap"
                      style={{ left: `${left}%`, width: `${w}%` }}
                    >
                      {format(m, "MMM yy")}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            <div className="relative">
              {/* Break overlay across all rows */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-[1]"
                style={{
                  left: `calc(7rem + ${pctFromStart(BREAK_START)}% * (100% - 7rem) / 100%)`,
                }}
              />
              {COHORTS.map((cohort) => (
                <CohortRow key={cohort.number} cohort={cohort} />
              ))}

              {/* Break band (absolute over the timeline area) */}
              <BreakBand />
            </div>
          </div>
        </Card>

        {/* Monthly grouped list */}
        <MonthlyGrouping />
      </div>
    </TooltipProvider>
  );
}

function Legend({ swatch, label, icon }: { swatch: string; label: string; icon?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`inline-block w-3 h-3 rounded-sm ${swatch} flex items-center justify-center`}>
        {icon && <Flag className="w-2 h-2 text-black" />}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function CohortRow({ cohort }: { cohort: Cohort }) {
  const showGrad = cohort.number !== 11;
  return (
    <div className="flex border-b border-border/60 hover:bg-secondary/20">
      <div className="w-28 shrink-0 px-3 py-3 text-sm font-medium border-r border-border flex items-center">
        Cohort {cohort.number}
      </div>
      <div className="relative flex-1 h-12">
        {cohort.segments.map((s, i) => {
          const meta = PHASE_META[s.kind];
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className={`absolute top-2 h-8 rounded-md border shadow-sm cursor-pointer transition-all ${meta.cls}`}
                  style={{
                    left: `${pctFromStart(s.start)}%`,
                    width: `${widthPct(s.start, s.end)}%`,
                  }}
                >
                  <span className="block truncate px-2 py-1 text-[11px] font-medium">
                    {meta.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-semibold">Cohort {cohort.number} — {meta.label}</div>
                  <div className="text-muted-foreground">
                    {format(s.start, "MMM d, yyyy")} → {format(s.end, "MMM d, yyyy")}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {showGrad && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-1 h-10 w-6 -ml-3 flex items-center justify-center z-[2]"
                style={{ left: `${pctFromStart(cohort.graduation)}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-md">
                  <Flag className="w-3 h-3 text-black" fill="black" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-semibold">🎓 Cohort {cohort.number} Graduation</div>
                <div className="text-muted-foreground">
                  {format(cohort.graduation, "EEEE, MMM d, yyyy")}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function BreakBand() {
  const left = pctFromStart(BREAK_START);
  const width = widthPct(BREAK_START, BREAK_END);
  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left: `calc(7rem + (100% - 7rem) * ${left} / 100)`, width: `calc((100% - 7rem) * ${width} / 100)` }}
    >
      <div className="w-full h-full bg-muted/40 border-x-2 border-dashed border-muted-foreground/60 flex items-start justify-center">
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
          Training Break · No Classes
        </span>
      </div>
    </div>
  );
}

function MonthlyGrouping() {
  const events = useMemo(() => {
    const list: { date: Date; label: string; kind: PhaseKind | "graduation" | "break"; cohort?: number }[] = [];
    COHORTS.forEach((c) => {
      c.segments.forEach((s) => {
        list.push({ date: s.start, label: `Cohort ${c.number} — ${PHASE_META[s.kind].label} starts`, kind: s.kind, cohort: c.number });
      });
      if (c.number !== 11) {
        list.push({ date: c.graduation, label: `Cohort ${c.number} Graduation 🎓`, kind: "graduation", cohort: c.number });
      }
    });
    list.push({ date: BREAK_START, label: "Training Break begins", kind: "break" });
    list.push({ date: BREAK_END, label: "Training resumes", kind: "break" });
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((e) => {
      const key = format(e.date, "MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold">Monthly Milestones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {grouped.map(([month, items]) => (
          <Card key={month} className="p-4">
            <h3 className="font-semibold text-sm mb-2">{month}</h3>
            <ul className="space-y-1.5">
              {items.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Badge
                    className={
                      e.kind === "graduation"
                        ? "bg-yellow-400 text-black hover:bg-yellow-400"
                        : e.kind === "break"
                        ? "bg-muted text-muted-foreground hover:bg-muted"
                        : PHASE_META[e.kind as PhaseKind].badge
                    }
                  >
                    {format(e.date, "MMM d")}
                  </Badge>
                  <span className="text-foreground/90 leading-snug">{e.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
