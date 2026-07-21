"use client";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Command,
  FileText,
  GitCommitHorizontal,
  Lightbulb,
  ListChecks,
  Milestone,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { LiveClock } from "@/components/time/live-clock";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { agentList } from "@/lib/agents/registry";
import { cn } from "@/lib/utils";

const snapshots = [
  {
    title: "Projects",
    icon: Target,
    rows: [
      ["Active project", "Logfound"],
      ["Total projects", "04"],
    ],
  },
  {
    title: "Timeline",
    icon: ListChecks,
    rows: [
      ["Decisions logged", "24"],
      ["Lessons learned", "18"],
    ],
  },
  {
    title: "Agents",
    icon: Bot,
    rows: [
      ["Nova · Atlas · Echo", "Ready"],
      ["Status", "In sync"],
    ],
  },
  {
    title: "Insights",
    icon: Sparkles,
    rows: [
      ["Weekly progress", "+18%"],
      ["Productivity score", "92"],
      ["AI recommendations", "03"],
    ],
  },
];
const activity = [
  [
    Lightbulb,
    "Decision created",
    "Prioritised the onboarding narrative",
    45 * 60,
    "text-primary",
  ],
  [
    GitCommitHorizontal,
    "GitHub commit",
    "feat: establish dashboard information architecture",
    2 * 60 * 60,
    "text-emerald-300",
  ],
  [
    FileText,
    "Note added",
    "Captured three signals from customer interviews",
    24 * 60 * 60,
    "text-violet-300",
  ],
  [
    Milestone,
    "Milestone reached",
    "Foundation shipped and ready to extend",
    2 * 24 * 60 * 60,
    "text-amber-300",
  ],
  [
    Sparkles,
    "AI recommendation",
    "Validate the activation loop before adding more surface area",
    2 * 24 * 60 * 60,
    "text-primary",
  ],
] as const;
const conversations = [
  "Ship the onboarding flow this week.",
  "Authentication tests should be completed first.",
  "You postponed testing twice last week.",
];

export function Dashboard({ username = "there" }: { username?: string }) {
  const { now, relative } = useCurrentTime();
  const [notice, setNotice] = useState(
    "Your workspace is clear. One focused move will create momentum today.",
  );
  const [complete, setComplete] = useState(false);
  const act = useCallback((name: string) => setNotice(name), []);
  useKeyboardShortcuts([
    {
      key: "n",
      meta: true,
      shift: true,
      handler: () =>
        act("Nova is framing the clearest path to ship onboarding this week."),
    },
    {
      key: "a",
      meta: true,
      shift: true,
      handler: () =>
        act("Atlas is mapping your dependencies and open questions."),
    },
    {
      key: "e",
      meta: true,
      shift: true,
      handler: () => act("Echo is reviewing patterns in your recent work."),
    },
  ]);
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
      <section className="animate-rise" aria-labelledby="welcome-title">
        <div className="flex flex-col gap-7 border-b border-border/70 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Live workspace clock
              </p>
              <LiveClock compact />
            </div>
            <h1
              id="welcome-title"
              className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              Good morning, {username}.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {notice}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card/70 text-left backdrop-blur-sm">
            <Metric label="Build streak" value="12" suffix="days" />
            <Metric label="Active project" value="01" suffix="Logfound" />
            <Metric label="Today’s focus" value="01" suffix="priority" />
          </div>
        </div>
      </section>
      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.82fr)]">
        <div className="space-y-8">
          <section
            className="animate-rise animation-delay-1"
            aria-labelledby="snapshot-title"
          >
            <Heading
              id="snapshot-title"
              eyebrow="Workspace snapshot"
              title="A clear view of the work that matters."
              action="View workspace"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {snapshots.map((item) => (
                <Snapshot key={item.title} {...item} />
              ))}
            </div>
          </section>
          <section
            className="animate-rise animation-delay-2"
            aria-labelledby="timeline-title"
          >
            <Heading
              id="timeline-title"
              eyebrow="Recent timeline"
              title="Signal, captured as it happens."
              action="Open timeline"
              onAction={() =>
                act("Your timeline is open to the latest signal.")
              }
            />
            <div className="mt-5 rounded-xl border border-border bg-card/55 px-5 py-2 sm:px-7">
              {activity.map(([Icon, title, detail, secondsAgo, tone], index) => (
                <Activity
                  key={title}
                  Icon={Icon}
                  title={title}
                  detail={detail}
                  time={now ? relative(new Date(now.getTime() - secondsAgo * 1000)) : "Loading time"}
                  tone={tone}
                  last={index === activity.length - 1}
                />
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-8">
          <section
            className="animate-rise animation-delay-2"
            aria-labelledby="focus-title"
          >
            <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card p-6">
              <div className="absolute right-0 top-0 size-36 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Today’s focus
                </p>
                <h2
                  id="focus-title"
                  className="mt-3 text-xl font-semibold tracking-tight"
                >
                  Ship the onboarding flow
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Turn the first ten minutes into a confident, guided start.
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-y-5 text-sm">
                  <Detail
                    label="Estimated time"
                    value="2 h 30 min"
                    Icon={Clock3}
                  />
                  <Detail label="Priority" value="High" Icon={Zap} />
                </dl>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-foreground">
                      {complete ? "100" : "65"}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: complete ? "100%" : "65%" }}
                    />
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => setComplete(true)}
                  disabled={complete}
                >
                  {complete ? (
                    <>
                      <CheckCircle2 className="mr-2 size-4" />
                      Focus complete
                    </>
                  ) : (
                    <>
                      Mark progress <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
          <section
            className="animate-rise animation-delay-3"
            aria-labelledby="discussion-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              AI collaboration
            </p>
            <h2
              id="discussion-title"
              className="mt-2 text-xl font-semibold tracking-tight"
            >
              Team discussion
            </h2>
            <div className="mt-5 space-y-3">
              {agentList.map((agent, index) => (
                <div
                  key={agent.id}
                  className={cn(
                    "rounded-lg border p-4",
                    [
                      "border-primary/20 bg-primary/[0.05]",
                      "border-violet-400/20 bg-violet-400/[0.04]",
                      "border-emerald-400/20 bg-emerald-400/[0.04]",
                    ][index],
                  )}
                >
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    “{conversations[index]}”
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.08] p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Final recommendation
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete the authentication test path today, then protect two
                uninterrupted blocks to ship onboarding by Friday.
              </p>
            </div>
          </section>
        </aside>
      </div>
      <section
        className="mt-10 animate-rise animation-delay-3"
        aria-labelledby="actions-title"
      >
        <Heading
          id="actions-title"
          eyebrow="Quick actions"
          title="Keep momentum within reach."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Quick
            icon={Plus}
            name="Log Decision"
            hint="Ctrl D"
            onClick={() =>
              act(
                "Decision capture is ready. Start with the context, then name the trade-off.",
              )
            }
          />
          <Quick
            icon={Sparkles}
            name="Ask Nova"
            hint="Ctrl ⇧ N"
            onClick={() =>
              act(
                "Nova is framing the clearest path to ship onboarding this week.",
              )
            }
          />
          <Quick
            icon={ListChecks}
            name="Open Timeline"
            hint="Ctrl T"
            onClick={() => act("Your timeline is open to the latest signal.")}
          />
          <Quick
            icon={Target}
            name="Create Project"
            hint="Ctrl P"
            onClick={() =>
              act(
                "A new project is ready to be named when the work has a clear boundary.",
              )
            }
          />
          <Quick
            icon={Command}
            name="Command Palette"
            hint="Ctrl K"
            onClick={() => window.dispatchEvent(new Event("logfound:command"))}
          />
        </div>
      </section>
      <section
        className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 lg:flex-row lg:items-center lg:justify-between"
        aria-label="Keyboard shortcuts"
      >
        <p className="text-sm text-muted-foreground">
          Keyboard-first by design.{" "}
          <span className="text-foreground">
            Your hands never need to leave the work.
          </span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {[
            ["Ctrl K", "Command palette"],
            ["Ctrl ⇧ N", "Ask Nova"],
            ["Ctrl ⇧ A", "Open Atlas"],
            ["Ctrl ⇧ E", "Review with Echo"],
          ].map(([key, label]) => (
            <div key={label} className="text-xs text-muted-foreground">
              <kbd className="mr-2 rounded border border-border bg-card px-1.5 py-1 font-sans text-[10px] text-foreground">
                {key}
              </kbd>
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="min-w-[105px] px-4 py-3 sm:px-5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">
        <span className="text-lg">{value}</span>{" "}
        <span className="text-muted-foreground">{suffix}</span>
      </p>
    </div>
  );
}
function Heading({
  id,
  eyebrow,
  title,
  action,
  onAction,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="group hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary sm:flex"
        >
          {action}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
function Snapshot({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Bot;
  rows: string[][];
}) {
  return (
    <article className="group rounded-xl border border-border bg-card/55 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card">
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-7 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
function Activity({
  Icon,
  title,
  detail,
  time,
  tone,
  last,
}: {
  Icon: typeof Bot;
  title: string;
  detail: string;
  time: string;
  tone: string;
  last: boolean;
}) {
  return (
    <article className="relative grid grid-cols-[30px_1fr] gap-3 py-5">
      <div className="relative flex justify-center">
        <span
          className={cn(
            "z-10 flex size-7 items-center justify-center rounded-full border border-border bg-card",
            tone,
          )}
        >
          <Icon className="size-3.5" />
        </span>
        {!last && (
          <span className="absolute top-7 h-[calc(100%+12px)] w-px bg-border" />
        )}
      </div>
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <time className="text-xs text-muted-foreground">{time}</time>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </article>
  );
}
function Detail({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Clock3;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
function Quick({
  icon: Icon,
  name,
  hint,
  onClick,
}: {
  icon: typeof Bot;
  name: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-border bg-card/55 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4 text-primary" />
      <p className="mt-7 text-sm font-medium">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </button>
  );
}
