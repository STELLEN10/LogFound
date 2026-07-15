export type KnowledgeNode = { id: string; type: "Project" | "Feature" | "Decision" | "Meeting" | "Commit" | "Issue" | "Task" | "Conversation" | "Customer" | "Feedback" | "Launch" | "Lesson" | "Milestone" | "Repository"; label: string; detail: string; x: string; y: string };
export const collaborators = [{ name: "Stellan", initials: "S", role: "Founder", color: "bg-primary" }, { name: "Maya Chen", initials: "MC", role: "Product", color: "bg-violet-400" }, { name: "Arjun Rao", initials: "AR", role: "Engineering", color: "bg-emerald-400" }];
export const knowledgeNodes: KnowledgeNode[] = [
  { id: "project", type: "Project", label: "Logfound activation", detail: "The active project connecting the first founder session to durable context.", x: "15%", y: "48%" },
  { id: "feature", type: "Feature", label: "Onboarding", detail: "A guided first session designed around one meaningful action.", x: "34%", y: "21%" },
  { id: "decision", type: "Decision", label: "Launch 10-founder cohort", detail: "Decision: ship narrow after authentication validation is complete.", x: "50%", y: "48%" },
  { id: "commit", type: "Commit", label: "e1e13f4", detail: "GitHub commit: Build founder dashboard workspace.", x: "66%", y: "19%" },
  { id: "feedback", type: "Feedback", label: "First-session clarity", detail: "Customer interviews show confidence matters more than feature breadth.", x: "78%", y: "50%" },
  { id: "lesson", type: "Lesson", label: "Test before launch", detail: "Repeated learning: validation moves late when scope grows too quickly.", x: "57%", y: "77%" },
  { id: "task", type: "Task", label: "Validate auth flow", detail: "Agent-generated from Atlas review and launch decision.", x: "32%", y: "77%" },
];
export const searchRecords = [
  { kind: "Decision", title: "Launch onboarding cohort", detail: "Ship to ten founders after auth validation.", tags: ["onboarding", "decision", "launch"] },
  { kind: "Commit", title: "b5ac90d · Supabase auth boundary", detail: "Typed server and browser client setup.", tags: ["authentication", "supabase", "commit"] },
  { kind: "Conversation", title: "Nova recommendation: protect scope", detail: "Small cohorts create faster activation learning.", tags: ["nova", "onboarding", "recommendation"] },
  { kind: "Lesson", title: "Testing before launch", detail: "Authentication validation has been postponed three times.", tags: ["authentication", "lesson", "testing"] },
  { kind: "Timeline", title: "Customer interviews · last Tuesday", detail: "Three founders asked for a clearer first action.", tags: ["last tuesday", "customer", "onboarding"] },
  { kind: "Project", title: "Logfound activation", detail: "Current project with 7 connected decisions and 12 timeline events.", tags: ["project", "onboarding", "current"] },
];
