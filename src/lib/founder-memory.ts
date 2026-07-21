export type MemoryEvent = { id: string; kind: "idea" | "feedback" | "prototype" | "commit" | "launch" | "metric" | "lesson" | "decision"; title: string; detail: string; date: string; source: string };
export type Replay = { id: string; title: string; problem: string; decision: string; outcome: string; lesson: string; events: MemoryEvent[] };

export const currentContext = { project: "Logfound activation", repository: "logfound-web", branch: "main", focus: "Ship a focused onboarding cohort", recentCommit: "e1e13f4 · Build founder dashboard workspace" };

export const onboardingReplay: Replay = {
  id: "onboarding", title: "Launch the onboarding flow", problem: "New founders reached the workspace without a clear first meaningful action.", decision: "Ship a constrained onboarding flow to ten founders after authentication coverage is complete.", outcome: "First-session clarity improved in early interviews and the release scope stayed protected.", lesson: "The strongest feature decisions started with a customer conversation, then a deliberately narrow first release.",
  events: [
    { id: "idea", kind: "idea", title: "Activation gap noticed", detail: "Three founders asked what to do first after entering the workspace.", date: "2026-06-24T09:15:00+02:00", source: "Founder note" },
    { id: "feedback", kind: "feedback", title: "Customer feedback collected", detail: "Interviews pointed to confidence—not feature breadth—as the missing first-session signal.", date: "2026-06-26T14:40:00+02:00", source: "Customer interviews" },
    { id: "prototype", kind: "prototype", title: "Guided start prototyped", detail: "A lightweight first-session narrative was designed around a single focused action.", date: "2026-07-02T11:20:00+02:00", source: "Product" },
    { id: "commit", kind: "commit", title: "Dashboard workspace committed", detail: "e1e13f4 established the daily surface that onboarding now enters through.", date: "2026-07-12T16:05:00+02:00", source: "GitHub" },
    { id: "launch", kind: "launch", title: "Cohort launch selected", detail: "Ten-founder rollout chosen to protect learning quality before broadening reach.", date: "2026-07-15T10:30:00+02:00", source: "Decision" },
    { id: "metric", kind: "metric", title: "First-session signal improved", detail: "Interview participants identified the next action without prompting.", date: "2026-07-18T15:10:00+02:00", source: "Research" },
    { id: "lesson", kind: "lesson", title: "Learning recorded", detail: "Activation quality improves when scope stays narrow and testing happens before launch week.", date: "2026-07-19T17:45:00+02:00", source: "Echo" },
  ],
};

export const intelligentNotifications = [
  { title: "Testing is becoming a launch risk", detail: "You have delayed authentication validation three times. Protect a test block before adding payments.", agent: "Atlas", tone: "amber" },
  { title: "Your shipping rhythm is improving", detail: "You have completed meaningful product work for three consecutive weeks.", agent: "Nova", tone: "cyan" },
  { title: "A familiar onboarding pattern surfaced", detail: "Echo found the same first-session concern in customer notes from two months ago.", agent: "Echo", tone: "violet" },
];

export const weeklyIntelligence = [
  ["Biggest win", "Founder Intelligence turned scattered context into one decision-first workflow."],
  ["Biggest mistake", "Authentication testing remained late despite being named as a release constraint."],
  ["Pattern", "Your most successful features start with customer evidence, not a backlog item."],
  ["Momentum", "Shipping consistency has risen for three weeks while scope has become more disciplined."],
  ["Engineering", "42 commits · 6 features complete · dashboard is the most active surface."],
  ["Product", "Onboarding moved from a hypothesis to a ten-founder launch plan."],
  ["Founder", "You are deciding more slowly up front and reversing fewer decisions later."],
] as const;
