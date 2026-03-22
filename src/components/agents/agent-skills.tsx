"use client";

import { Loader2, Sparkles, ExternalLink, AlertTriangle, Check, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useAgentSkills } from "@/hooks/useAgents";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Agent } from "@/types";
import type { SkillStatusEntry } from "@/lib/gateway";

export function AgentSkills({ agent }: { agent: Agent }) {
  const { data, isLoading } = useAgentSkills(agent.id);
  const skills = data?.skills ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-[var(--content-muted)]">No skills available</p>
      </div>
    );
  }

  const active = skills.filter((s) => !s.disabled && !s.blockedByAllowlist && s.eligible);
  const inactive = skills.filter((s) => s.disabled || s.blockedByAllowlist || !s.eligible);

  return (
    <div className="p-5 space-y-5">
      {active.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider mb-3">
            Active ({active.length})
          </h3>
          <div className="space-y-2">
            {active.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider mb-3">
            Inactive ({inactive.length})
          </h3>
          <div className="space-y-2">
            {inactive.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillCard({ skill }: { skill: SkillStatusEntry }) {
  const isActive = !skill.disabled && !skill.blockedByAllowlist && skill.eligible;
  const hasMissing =
    (skill.missing.bins?.length ?? 0) > 0 ||
    (skill.missing.envVars?.length ?? 0) > 0;

  let reason = "";
  if (skill.disabled) reason = "Disabled";
  else if (skill.blockedByAllowlist) reason = "Not in allowlist";
  else if (!skill.eligible) reason = "Missing requirements";

  return (
    <div className={`rounded-xl border p-4 transition-shadow ${
      isActive
        ? "border-[var(--border-default)] bg-[var(--surface-card)] shadow-card"
        : "border-[var(--border-default)] bg-[var(--surface-bg)] opacity-70"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)]">
            {skill.emoji ? (
              <span className="text-base">{skill.emoji}</span>
            ) : (
              <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--content-primary)] truncate">
                {skill.name}
              </p>
              {skill.bundled && (
                <span className="shrink-0 rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent-primary)]">
                  bundled
                </span>
              )}
              {skill.always && (
                <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                  always
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--content-secondary)] mt-0.5 line-clamp-2">
              {skill.description}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {isActive ? (
            <StatusBadge status="active" label="active" />
          ) : (
            <StatusBadge status="offline" label={reason} />
          )}
        </div>
      </div>

      {/* Details row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-[var(--surface-bg)] px-2 py-0.5 text-[11px] text-[var(--content-muted)]">
          {skill.source}
        </span>
        {skill.homepage && (
          <a
            href={skill.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            docs
          </a>
        )}
      </div>

      {/* Requirements */}
      {hasMissing && (
        <div className="mt-3 rounded-lg bg-amber-50 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
            Missing requirements
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {skill.missing.bins?.map((bin) => (
              <span key={bin} className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-mono text-amber-800">
                <X className="h-3 w-3" strokeWidth={2} />
                {bin}
              </span>
            ))}
            {skill.missing.envVars?.map((env) => (
              <span key={env} className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-mono text-amber-800">
                <X className="h-3 w-3" strokeWidth={2} />
                ${env}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Met requirements (only show if there are requirements and they're met) */}
      {!hasMissing && (skill.requirements.bins?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.requirements.bins?.map((bin) => (
            <span key={bin} className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-mono text-emerald-700">
              <Check className="h-3 w-3" strokeWidth={2} />
              {bin}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact skills badge for agent cards — shows count with styled tooltip */
export function SkillsBadge({ agentId }: { agentId: string }) {
  const { data } = useAgentSkills(agentId);
  const skills = data?.skills ?? [];
  const active = skills.filter((s) => !s.disabled && !s.blockedByAllowlist && s.eligible);
  const inactiveCount = skills.length - active.length;

  if (skills.length === 0) return null;

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-light)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent-primary)] cursor-default">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          {active.length} skills
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-3 shadow-lg max-w-xs"
        >
          <p className="text-[11px] font-semibold text-[var(--content-muted)] uppercase tracking-wider mb-2">
            Active Skills
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-[200px] overflow-y-auto">
            {active.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                {s.emoji ? (
                  <span className="text-sm w-5 text-center shrink-0">{s.emoji}</span>
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" strokeWidth={1.5} />
                )}
                <span className="text-xs text-[var(--content-primary)] truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
