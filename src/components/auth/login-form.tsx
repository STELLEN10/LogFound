"use client";

import { ArrowRight, KeyRound, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { LogfoundLogo } from "@/components/brand/logfound-logo";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok)
        throw new Error(payload.error?.message || "Unable to sign in.");
      const callback = new URLSearchParams(window.location.search).get(
        "callbackUrl",
      );
      const destination =
        callback && callback.startsWith("/") && !callback.startsWith("//")
          ? callback
          : "/";
      window.location.assign(destination);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground sm:px-8">
      <section
        className="w-full max-w-md animate-rise"
        aria-labelledby="login-title"
      >
        <div className="mb-8 flex items-center gap-3">
          <LogfoundLogo />
          <span className="rounded-full border border-primary/20 bg-primary/[0.07] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
            Demo
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Founder workspace
          </p>
          <h1
            id="login-title"
            className="mt-3 text-3xl font-semibold tracking-tight"
          >
            Welcome back.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in with your workspace username to continue to your operating
            system.
          </p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background/55 px-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring"
                placeholder="founder"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative mt-2">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-border bg-background/55 pl-10 pr-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            {error && (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-5 text-destructive-foreground"
                role="alert"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Opening workspace
                </>
              ) : (
                <>
                  Enter workspace
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
          Demo authentication uses a username only—no email address is required.
        </p>
      </section>
    </main>
  );
}
