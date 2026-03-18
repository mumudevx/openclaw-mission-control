"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <span className="text-lg font-bold text-white">OC</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-[var(--content-primary)]">
            Mission Control
          </h1>
          <p className="mt-1 text-sm text-[var(--content-secondary)]">
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--content-primary)]">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                className="mt-1.5 rounded-xl border-[var(--border-default)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--content-primary)]">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="mt-1.5 rounded-xl border-[var(--border-default)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="flex w-full items-center justify-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
