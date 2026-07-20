import { LogfoundLogo } from "@/components/brand/logfound-logo";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 text-muted-foreground">
        <LogfoundLogo />
        <span className="loading-orbit" aria-label="Loading workspace" />
      </div>
    </main>
  );
}
