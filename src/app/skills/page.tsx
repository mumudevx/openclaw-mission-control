"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Download,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Key,
  Power,
  Variable,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSkillsStatus, useSkillInstall, useSkillUpdate } from "@/hooks/useSkills";
import { useAgentStore } from "@/stores/agentStore";
import type { SkillStatusEntry } from "@/lib/gateway";

function SkillCard({ skill }: { skill: SkillStatusEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [envInputs, setEnvInputs] = useState<Record<string, string>>({});
  const updateMutation = useSkillUpdate();

  const isActive = !skill.disabled && !skill.blockedByAllowlist && skill.eligible;
  const hasMissing =
    (skill.missing.bins?.length ?? 0) > 0 ||
    (skill.missing.envVars?.length ?? 0) > 0;

  let statusLabel = "active";
  let statusVariant: "active" | "idle" | "offline" | "error" = "active";
  if (skill.disabled) {
    statusLabel = "disabled";
    statusVariant = "offline";
  } else if (skill.blockedByAllowlist) {
    statusLabel = "blocked";
    statusVariant = "idle";
  } else if (!skill.eligible) {
    statusLabel = "ineligible";
    statusVariant = "error";
  }

  function handleToggle() {
    updateMutation.mutate(
      { skillKey: skill.name, enabled: skill.disabled },
      {
        onSuccess: () => toast.success(`${skill.name} ${skill.disabled ? "enabled" : "disabled"}`),
        onError: () => toast.error(`Failed to update ${skill.name}`),
      },
    );
  }

  function handleSaveApiKey() {
    if (!apiKeyInput.trim()) return;
    updateMutation.mutate(
      { skillKey: skill.name, apiKey: apiKeyInput.trim() },
      {
        onSuccess: () => {
          toast.success("API key saved");
          setApiKeyInput("");
        },
        onError: () => toast.error("Failed to save API key"),
      },
    );
  }

  function handleSaveEnv(key: string) {
    const value = envInputs[key];
    if (value === undefined) return;
    updateMutation.mutate(
      { skillKey: skill.name, env: { [key]: value } },
      {
        onSuccess: () => {
          toast.success(`${key} updated`);
          setEnvInputs((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        },
        onError: () => toast.error(`Failed to update ${key}`),
      },
    );
  }

  return (
    <div className={`rounded-card border transition-shadow ${
      isActive
        ? "border-[var(--border-default)] bg-[var(--surface-card)] shadow-card"
        : "border-[var(--border-default)] bg-[var(--surface-bg)]"
    }`}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
          {skill.emoji ? (
            <span className="text-lg">{skill.emoji}</span>
          ) : (
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
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
          <p className="text-xs text-[var(--content-secondary)] mt-0.5 line-clamp-1">
            {skill.description}
          </p>
        </div>
        <StatusBadge status={statusVariant} label={statusLabel} />
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[var(--content-muted)]" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--content-muted)]" strokeWidth={1.5} />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[var(--border-divider)] px-5 pb-5 pt-4 space-y-4">
          {/* Description */}
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            {skill.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2">
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
                Homepage
              </a>
            )}
          </div>

          {/* Requirements */}
          {hasMissing && (
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
                Missing requirements
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skill.missing.bins?.map((bin) => (
                  <span key={bin} className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-mono text-amber-800">
                    <X className="h-3 w-3" strokeWidth={2} />
                    {bin}
                  </span>
                ))}
                {skill.missing.envVars?.map((env) => (
                  <span key={env} className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-mono text-amber-800">
                    <Variable className="h-3 w-3" strokeWidth={2} />
                    {env}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Met requirements */}
          {!hasMissing && (skill.requirements.bins?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skill.requirements.bins?.map((bin) => (
                <span key={bin} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-mono text-emerald-700">
                  <Check className="h-3 w-3" strokeWidth={2} />
                  {bin}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-divider)]">
            {/* Enable/Disable toggle */}
            <button
              onClick={handleToggle}
              disabled={updateMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-medium transition-colors ${
                skill.disabled
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              } disabled:opacity-50`}
            >
              <Power className="h-3.5 w-3.5" strokeWidth={1.5} />
              {skill.disabled ? "Enable" : "Disable"}
            </button>
          </div>

          {/* API Key */}
          {skill.missing.envVars && skill.missing.envVars.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[var(--border-divider)]">
              <h4 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" strokeWidth={1.5} />
                Environment Variables
              </h4>
              {skill.missing.envVars.map((envVar) => (
                <div key={envVar} className="flex items-center gap-2">
                  <Label className="text-xs font-mono text-[var(--content-secondary)] shrink-0 w-40 truncate">
                    {envVar}
                  </Label>
                  <Input
                    type="password"
                    placeholder="Enter value..."
                    value={envInputs[envVar] ?? ""}
                    onChange={(e) => setEnvInputs((prev) => ({ ...prev, [envVar]: e.target.value }))}
                    className="h-8 flex-1 rounded-lg border-[var(--border-default)] bg-[var(--surface-bg)] text-xs font-mono"
                  />
                  <button
                    onClick={() => handleSaveEnv(envVar)}
                    disabled={!envInputs[envVar]?.trim() || updateMutation.isPending}
                    className="rounded-btn bg-[var(--accent-primary)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generic API Key input (for skills that use primaryEnv) */}
          {skill.primaryEnv && !skill.missing.envVars?.includes(skill.primaryEnv) && (
            <div className="space-y-2 pt-2 border-t border-[var(--border-divider)]">
              <h4 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" strokeWidth={1.5} />
                API Key
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="Update API key..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="h-8 flex-1 rounded-lg border-[var(--border-default)] bg-[var(--surface-bg)] text-xs font-mono"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim() || updateMutation.isPending}
                  className="rounded-btn bg-[var(--accent-primary)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InstallSkillForm() {
  const [name, setName] = useState("");
  const [installId, setInstallId] = useState("");
  const installMutation = useSkillInstall();

  function handleInstall() {
    if (!name.trim() || !installId.trim()) return;
    installMutation.mutate(
      { name: name.trim(), installId: installId.trim(), timeoutMs: 60000 },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success(`${name} installed`);
            setName("");
            setInstallId("");
          } else {
            toast.error(res.message || "Install failed");
          }
        },
        onError: () => toast.error("Failed to install skill"),
      },
    );
  }

  return (
    <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-card">
      <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3 flex items-center gap-2">
        <Download className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
        Install Skill from npm
      </h3>
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-[var(--content-secondary)]">Skill Name</Label>
          <Input
            placeholder="e.g., weather"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 rounded-lg border-[var(--border-default)] bg-[var(--surface-bg)]"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-[var(--content-secondary)]">Package / Install ID</Label>
          <Input
            placeholder="e.g., @anthropic/skill-weather"
            value={installId}
            onChange={(e) => setInstallId(e.target.value)}
            className="h-9 rounded-lg border-[var(--border-default)] bg-[var(--surface-bg)]"
          />
        </div>
        <button
          onClick={handleInstall}
          disabled={!name.trim() || !installId.trim() || installMutation.isPending}
          className="flex items-center gap-1.5 rounded-btn bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 shrink-0"
        >
          {installMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" strokeWidth={1.5} />
          )}
          Install
        </button>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const agents = useAgentStore((s) => s.agents);

  // Use default agent skills (global view)
  const { data, isLoading } = useSkillsStatus();
  const skills = data?.skills ?? [];

  const active = skills.filter((s) => !s.disabled && !s.blockedByAllowlist && s.eligible);
  const inactive = skills.filter((s) => s.disabled || s.blockedByAllowlist || !s.eligible);

  const filtered = skills
    .filter((s) => {
      if (filter === "active") return !s.disabled && !s.blockedByAllowlist && s.eligible;
      if (filter === "inactive") return s.disabled || s.blockedByAllowlist || !s.eligible;
      return true;
    })
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Skills" description="Manage skills across your agents" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Total Skills" value={skills.length} />
        <StatCard icon={Sparkles} label="Active" value={active.length} />
        <StatCard icon={Sparkles} label="Inactive" value={inactive.length} />
        <StatCard icon={Sparkles} label="Bundled" value={skills.filter((s) => s.bundled).length} />
      </div>

      {/* Install form */}
      <InstallSkillForm />

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" strokeWidth={1.5} />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
          />
        </div>
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium capitalize transition-colors first:rounded-l-xl last:rounded-r-xl ${
                filter === f
                  ? "bg-[var(--accent-light)] text-[var(--accent-primary)]"
                  : "text-[var(--content-muted)] hover:text-[var(--content-secondary)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-[var(--content-muted)] py-8">
            No skills found
          </p>
        ) : (
          filtered.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))
        )}
      </div>
    </div>
  );
}
