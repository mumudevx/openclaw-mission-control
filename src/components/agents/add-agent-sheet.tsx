"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAgentStore } from "@/stores/agentStore";
import { mockAgents } from "@/lib/mock/data";
import type { Agent } from "@/types";

const AVAILABLE_MODELS = [...new Set(mockAgents.map((a) => a.model))];

const BINDING_CHANNELS = [
  "whatsapp",
  "discord",
  "slack",
  "telegram",
  "imessage",
] as const;

const addAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  model: z.string().min(1, "Model is required"),
  description: z.string().optional(),
  avatar: z.string().optional(),
  vibe: z.string().optional(),
  soul: z.string().optional(),
  workspace: z
    .object({
      userMd: z.string().optional(),
      agentsMd: z.string().optional(),
      toolsMd: z.string().optional(),
    })
    .optional(),
  sandbox: z
    .object({
      mode: z.enum(["off", "non-main", "all"]),
      scope: z.enum(["session", "agent", "shared"]),
    })
    .optional(),
  fallbackModels: z.string().optional(),
  heartbeat: z
    .object({
      interval: z.string().optional(),
      target: z.string().optional(),
    })
    .optional(),
  bindings: z
    .array(
      z.object({
        channel: z.enum([
          "whatsapp",
          "discord",
          "slack",
          "telegram",
          "imessage",
        ]),
        accountId: z.string().optional(),
        peerId: z.string().optional(),
      })
    )
    .optional(),
});

type AddAgentFormValues = z.infer<typeof addAgentSchema>;

interface AddAgentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAgentSheet({ open, onOpenChange }: AddAgentSheetProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { agents, addAgent } = useAgentStore();

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      name: "",
      model: "",
      description: "",
      avatar: "",
      vibe: "",
      soul: "",
      workspace: { userMd: "", agentsMd: "", toolsMd: "" },
      sandbox: { mode: "non-main", scope: "agent" },
      fallbackModels: "",
      heartbeat: { interval: "", target: "" },
      bindings: [],
    },
  });

  const {
    fields: bindingFields,
    append: appendBinding,
    remove: removeBinding,
  } = useFieldArray({
    control: form.control,
    name: "bindings",
  });

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
      setShowAdvanced(false);
    }
    onOpenChange(isOpen);
  }

  function onSubmit(values: AddAgentFormValues) {
    const nameExists = agents.some(
      (a) => a.name.toLowerCase() === values.name.toLowerCase()
    );
    if (nameExists) {
      form.setError("name", {
        message: "An agent with this name already exists",
      });
      return;
    }

    const now = new Date().toISOString();
    const newAgent: Agent = {
      id: `agent-${crypto.randomUUID().slice(0, 8)}`,
      name: values.name,
      model: values.model,
      status: "idle",
      description: values.description || "",
      avatar: values.avatar || "",
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      costTotal: 0,
      activeSessions: 0,
      lastActive: now,
      tasks: [],
      createdAt: now,
      updatedAt: now,
      vibe: values.vibe || undefined,
      soul: values.soul || undefined,
      workspace: values.workspace,
      sandbox: values.sandbox || { mode: "non-main", scope: "agent" },
      fallbackModels: values.fallbackModels
        ? values.fallbackModels
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      heartbeat: values.heartbeat,
      bindings: values.bindings?.length ? values.bindings : undefined,
    };

    addAgent(newAgent);
    toast.success("Agent created successfully");
    handleClose(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[640px] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Add New Agent</SheetTitle>
        <SheetDescription className="sr-only">
          Create a new OpenClaw isolated agent
        </SheetDescription>

        {/* Header */}
        <div className="border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <h2 className="text-base font-semibold text-[var(--content-primary)]">
            Add New Agent
          </h2>
          <p className="text-xs text-[var(--content-muted)] mt-0.5">
            Create a new OpenClaw isolated agent with its own workspace
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* --- Basic Fields --- */}

            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., ResearchBot"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Model <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("model") || null}
                onValueChange={(val) =>
                  form.setValue("model", val as string, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.model && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Description
              </Label>
              <Input
                id="description"
                placeholder="e.g., Autonomous research assistant for web scraping and summarization"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("description")}
              />
            </div>

            {/* Avatar */}
            <div className="space-y-1.5">
              <Label
                htmlFor="avatar"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Avatar
              </Label>
              <Input
                id="avatar"
                placeholder="e.g., 🤖"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("avatar")}
              />
            </div>

            {/* Vibe */}
            <div className="space-y-1.5">
              <Label
                htmlFor="vibe"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Vibe
              </Label>
              <Input
                id="vibe"
                placeholder="e.g., Calm, precise, slightly formal"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("vibe")}
              />
              <p className="text-[11px] text-[var(--content-muted)]">
                Behavioral tone shorthand from IDENTITY.md
              </p>
            </div>

            {/* Soul Definition */}
            <div className="space-y-1.5">
              <Label
                htmlFor="soul"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Soul Definition
              </Label>
              <Textarea
                id="soul"
                rows={6}
                className="rounded-xl border-[var(--border-default)] bg-white font-mono text-sm"
                {...form.register("soul")}
              />
              <p className="text-[11px] text-[var(--content-muted)]">
                Defines the agent&apos;s personality, tone, and behavioral
                boundaries. Written to SOUL.md and loaded at the start of every
                session.
              </p>
            </div>

            {/* --- Advanced Toggle --- */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-divider)]">
              <Label
                htmlFor="advanced-toggle"
                className="text-sm font-medium text-[var(--content-primary)]"
              >
                Advanced Configuration
              </Label>
              <Switch
                id="advanced-toggle"
                checked={showAdvanced}
                onCheckedChange={(checked) => setShowAdvanced(checked)}
              />
            </div>

            {/* --- Advanced Fields (animated) --- */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: showAdvanced ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 pt-2">
                  {/* Workspace Files Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider">
                    Workspace Files
                  </h3>

                  {/* USER.md */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="userMd"
                      className="text-xs font-medium text-[var(--content-secondary)]"
                    >
                      USER.md
                    </Label>
                    <Textarea
                      id="userMd"
                      rows={4}
                      className="rounded-xl border-[var(--border-default)] bg-white font-mono text-sm"
                      {...form.register("workspace.userMd")}
                    />
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Context about the user this agent serves — role,
                      preferences, and background that guides interactions.
                    </p>
                  </div>

                  {/* AGENTS.md */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="agentsMd"
                      className="text-xs font-medium text-[var(--content-secondary)]"
                    >
                      AGENTS.md
                    </Label>
                    <Textarea
                      id="agentsMd"
                      rows={4}
                      className="rounded-xl border-[var(--border-default)] bg-white font-mono text-sm"
                      {...form.register("workspace.agentsMd")}
                    />
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Operating instructions and behavioral rules for the agent.
                      Loaded at every session start.
                    </p>
                  </div>

                  {/* TOOLS.md */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="toolsMd"
                      className="text-xs font-medium text-[var(--content-secondary)]"
                    >
                      TOOLS.md
                    </Label>
                    <Textarea
                      id="toolsMd"
                      rows={4}
                      className="rounded-xl border-[var(--border-default)] bg-white font-mono text-sm"
                      {...form.register("workspace.toolsMd")}
                    />
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Documents available tools and usage conventions. Guidance
                      only — doesn&apos;t control tool availability.
                    </p>
                  </div>

                  {/* Sandbox Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider pt-2">
                    Sandbox
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Sandbox Mode */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--content-secondary)]">
                        Sandbox Mode
                      </Label>
                      <Select
                        value={form.watch("sandbox.mode")}
                        onValueChange={(val) =>
                          form.setValue(
                            "sandbox.mode",
                            val as "off" | "non-main" | "all"
                          )
                        }
                      >
                        <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">off</SelectItem>
                          <SelectItem value="non-main">non-main</SelectItem>
                          <SelectItem value="all">all</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Controls file system isolation level. &apos;non-main&apos;
                        sandboxes all agents except the default.
                      </p>
                    </div>

                    {/* Sandbox Scope */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--content-secondary)]">
                        Sandbox Scope
                      </Label>
                      <Select
                        value={form.watch("sandbox.scope")}
                        onValueChange={(val) =>
                          form.setValue(
                            "sandbox.scope",
                            val as "session" | "agent" | "shared"
                          )
                        }
                      >
                        <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session">session</SelectItem>
                          <SelectItem value="agent">agent</SelectItem>
                          <SelectItem value="shared">shared</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Determines container boundary — per session, per agent,
                        or shared across agents.
                      </p>
                    </div>
                  </div>

                  {/* Model & Automation Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider pt-2">
                    Model & Automation
                  </h3>

                  {/* Fallback Models */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="fallbackModels"
                      className="text-xs font-medium text-[var(--content-secondary)]"
                    >
                      Fallback Models
                    </Label>
                    <Input
                      id="fallbackModels"
                      placeholder="e.g., gpt-4, claude-3-sonnet"
                      className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                      {...form.register("fallbackModels")}
                    />
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Backup models used when the primary model is unavailable
                      or rate-limited. Separate with commas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Heartbeat Interval */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="heartbeatInterval"
                        className="text-xs font-medium text-[var(--content-secondary)]"
                      >
                        Heartbeat Interval
                      </Label>
                      <Input
                        id="heartbeatInterval"
                        placeholder="e.g., 30m"
                        className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                        {...form.register("heartbeat.interval")}
                      />
                      <p className="text-[11px] text-[var(--content-muted)]">
                        How often the agent checks in with a status update.
                        Leave empty to disable.
                      </p>
                    </div>

                    {/* Heartbeat Target */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="heartbeatTarget"
                        className="text-xs font-medium text-[var(--content-secondary)]"
                      >
                        Heartbeat Target
                      </Label>
                      <Input
                        id="heartbeatTarget"
                        placeholder="e.g., #general"
                        className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                        {...form.register("heartbeat.target")}
                      />
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Channel or destination where heartbeat messages are
                        delivered.
                      </p>
                    </div>
                  </div>

                  {/* Routing Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider pt-2">
                    Routing
                  </h3>

                  <div className="space-y-2">
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Route incoming messages from specific channels or contacts
                      to this agent.
                    </p>

                    {bindingFields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Select
                            value={form.watch(`bindings.${index}.channel`)}
                            onValueChange={(val) =>
                              form.setValue(
                                `bindings.${index}.channel`,
                                val as (typeof BINDING_CHANNELS)[number]
                              )
                            }
                          >
                            <SelectTrigger className="w-full h-9 rounded-lg border-[var(--border-default)] bg-white text-xs">
                              <SelectValue placeholder="Channel" />
                            </SelectTrigger>
                            <SelectContent>
                              {BINDING_CHANNELS.map((ch) => (
                                <SelectItem key={ch} value={ch}>
                                  {ch}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Account ID"
                            className="h-9 rounded-lg border-[var(--border-default)] bg-white text-xs"
                            {...form.register(`bindings.${index}.accountId`)}
                          />
                          <Input
                            placeholder="Peer ID"
                            className="h-9 rounded-lg border-[var(--border-default)] bg-white text-xs"
                            {...form.register(`bindings.${index}.peerId`)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBinding(index)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--content-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        appendBinding({
                          channel: "whatsapp",
                          accountId: "",
                          peerId: "",
                        })
                      }
                      className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Add Binding
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border-divider)] px-5 py-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Create Agent
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
