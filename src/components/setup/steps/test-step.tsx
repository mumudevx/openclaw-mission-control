"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { gateway } from "@/lib/gateway";
import type { ConnectionState, ServerInfo } from "@/lib/gateway";

interface TestStepProps {
  url: string;
  token: string;
  onBack: () => void;
  onNext: (serverInfo: ServerInfo) => void;
}

type TestState = "connecting" | "authenticating" | "success" | "failed";

export function TestStep({ url, token, onBack, onNext }: TestStepProps) {
  const [testState, setTestState] = useState<TestState>("connecting");
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const runTest = () => {
    setTestState("connecting");
    setError("");
    setServerInfo(null);

    gateway.disconnect();
    gateway.configure({ url, token });

    unsubRef.current?.();
    unsubRef.current = gateway.onStateChange((state: ConnectionState) => {
      if (state === "authenticating") {
        setTestState("authenticating");
      } else if (state === "connected") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTestState("success");
        setServerInfo(gateway.serverInfo);
      } else if (state === "reconnecting" || state === "disconnected") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTestState("failed");
        setError("Could not connect to gateway. Please check your URL and token.");
      }
    });

    gateway.connect();

    timeoutRef.current = setTimeout(() => {
      if (testState !== "success") {
        gateway.disconnect();
        setTestState("failed");
        setError("Connection timed out after 15 seconds.");
      }
    }, 15000);
  };

  useEffect(() => {
    runTest();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      unsubRef.current?.();
      gateway.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--content-primary)]">
          Testing Connection
        </h2>

        <div className="mt-8 flex flex-col items-center gap-4">
          {(testState === "connecting" || testState === "authenticating") && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)]" strokeWidth={1.5} />
              <p className="text-sm text-[var(--content-secondary)]">
                {testState === "connecting" ? "Connecting..." : "Authenticating..."}
              </p>
            </>
          )}

          {testState === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
              <p className="text-sm font-medium text-emerald-600">Connected!</p>
              {serverInfo && (
                <div className="w-full rounded-xl bg-[var(--surface-bg)] p-4 text-center">
                  <p className="text-xs text-[var(--content-muted)]">Server</p>
                  <p className="text-sm font-medium text-[var(--content-primary)]">
                    {serverInfo.name} v{serverInfo.version}
                  </p>
                </div>
              )}
            </>
          )}

          {testState === "failed" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" strokeWidth={1.5} />
              <p className="text-sm text-red-600">{error}</p>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="rounded-btn border border-[var(--border-default)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
          >
            Back
          </button>
          {testState === "failed" && (
            <button
              onClick={runTest}
              className="rounded-btn bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Retry
            </button>
          )}
          {testState === "success" && (
            <button
              onClick={() => serverInfo && onNext(serverInfo)}
              className="rounded-btn bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
