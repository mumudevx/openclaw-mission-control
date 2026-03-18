"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AuthStepProps {
  adminExists?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
}

export function AuthStep({ adminExists, onBack, onNext, onSkip }: AuthStepProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError("");

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      onNext();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--content-primary)]">
          Create Admin Account
        </h2>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">
          Set up credentials to protect your Mission Control panel
        </p>

        {adminExists && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-green-800">
                Admin account already configured
              </p>
              <p className="mt-0.5 text-sm text-green-700">
                You can skip this step or create a new admin account to replace the existing one.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
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
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            disabled={loading}
            className="rounded-btn border border-[var(--border-default)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)] disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-2">
            {adminExists && onSkip && (
              <button
                onClick={onSkip}
                disabled={loading}
                className="rounded-btn border border-[var(--border-default)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)] disabled:opacity-50"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading || !username || !password || !confirmPassword}
              className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
