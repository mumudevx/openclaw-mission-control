"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateAgent, useAgentFileSave } from "@/hooks/useAgents";
import { useQueryClient } from "@tanstack/react-query";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const addAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  workspace: z.string().min(1, "Workspace path is required"),
  emoji: z.string().optional(),
  avatar: z.string().optional(),
  soulMd: z.string().optional(),
  agentsMd: z.string().optional(),
  userMd: z.string().optional(),
});

type AddAgentFormValues = z.infer<typeof addAgentSchema>;

interface AddAgentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAgentSheet({ open, onOpenChange }: AddAgentSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceManuallyEdited, setWorkspaceManuallyEdited] = useState(false);
  const createMutation = useCreateAgent();
  const fileSaveMutation = useAgentFileSave();
  const queryClient = useQueryClient();

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      name: "",
      workspace: "",
      emoji: "",
      avatar: "",
      soulMd: "",
      agentsMd: "",
      userMd: "",
    },
  });

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
      setWorkspaceManuallyEdited(false);
      setIsSubmitting(false);
    }
    onOpenChange(isOpen);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    form.setValue("name", name);
    if (!workspaceManuallyEdited) {
      const slug = slugify(name);
      form.setValue("workspace", slug ? `~/openclaw-agents/${slug}` : "");
    }
  }

  async function onSubmit(values: AddAgentFormValues) {
    setIsSubmitting(true);
    try {
      // Phase 1: Create the agent
      const result = await createMutation.mutateAsync({
        name: values.name,
        workspace: values.workspace,
        emoji: values.emoji || undefined,
        avatar: values.avatar || undefined,
      });

      const agentId = result.agentId;

      // Phase 2: Write workspace files if provided
      const fileWrites: Promise<unknown>[] = [];
      if (values.soulMd?.trim()) {
        fileWrites.push(
          fileSaveMutation.mutateAsync({ agentId, name: "SOUL.md", content: values.soulMd }),
        );
      }
      if (values.agentsMd?.trim()) {
        fileWrites.push(
          fileSaveMutation.mutateAsync({ agentId, name: "AGENTS.md", content: values.agentsMd }),
        );
      }
      if (values.userMd?.trim()) {
        fileWrites.push(
          fileSaveMutation.mutateAsync({ agentId, name: "USER.md", content: values.userMd }),
        );
      }

      if (fileWrites.length > 0) {
        const results = await Promise.allSettled(fileWrites);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          toast.warning("Agent created but some workspace files failed to save");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["gateway", "agents.list"] });
      toast.success("Agent created");
      useNotificationStore.getState().addNotification({
        type: "success",
        title: "Agent created",
        message: values.name,
      });
      handleClose(false);
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[var(--sheet-width-wide)] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Add New Agent</SheetTitle>
        <SheetDescription className="sr-only">
          Create a new OpenClaw agent with its own workspace
        </SheetDescription>

        {/* Header */}
        <div className="border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <h2 className="text-base font-semibold text-[var(--content-primary)]">
            Add New Agent
          </h2>
          <p className="text-xs text-[var(--content-muted)] mt-0.5">
            Create a new agent with its own isolated workspace
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-[var(--content-secondary)]">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., research-bot"
                className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                {...form.register("name")}
                onChange={handleNameChange}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Workspace */}
            <div className="space-y-1.5">
              <Label htmlFor="workspace" className="text-xs font-medium text-[var(--content-secondary)]">
                Workspace Path <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workspace"
                placeholder="~/openclaw-agents/my-agent"
                className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-sm"
                {...form.register("workspace")}
                onChange={(e) => {
                  form.setValue("workspace", e.target.value);
                  setWorkspaceManuallyEdited(true);
                }}
              />
              <p className="text-[11px] text-[var(--content-muted)]">
                Absolute path on the server. ~ is expanded to home directory.
              </p>
              {form.formState.errors.workspace && (
                <p className="text-xs text-red-500">{form.formState.errors.workspace.message}</p>
              )}
            </div>

            {/* Identity row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Emoji */}
              <div className="space-y-1.5">
                <Label htmlFor="emoji" className="text-xs font-medium text-[var(--content-secondary)]">
                  Emoji
                </Label>
                <Input
                  id="emoji"
                  placeholder="🤖"
                  className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                  {...form.register("emoji")}
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5">
                <Label htmlFor="avatar" className="text-xs font-medium text-[var(--content-secondary)]">
                  Avatar URL
                </Label>
                <Input
                  id="avatar"
                  placeholder="https://..."
                  className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                  {...form.register("avatar")}
                />
              </div>
            </div>

            {/* Workspace Files Section */}
            <div className="pt-2 border-t border-[var(--border-divider)]">
              <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider mb-3">
                Workspace Files (optional)
              </h3>

              {/* SOUL.md */}
              <div className="space-y-1.5 mb-4">
                <Label htmlFor="soulMd" className="text-xs font-medium text-[var(--content-secondary)]">
                  SOUL.md
                </Label>
                <Textarea
                  id="soulMd"
                  rows={4}
                  placeholder="Defines the agent's personality, tone, and behavioral boundaries..."
                  className="rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-sm min-h-[100px]"
                  {...form.register("soulMd")}
                />
              </div>

              {/* AGENTS.md */}
              <div className="space-y-1.5 mb-4">
                <Label htmlFor="agentsMd" className="text-xs font-medium text-[var(--content-secondary)]">
                  AGENTS.md
                </Label>
                <Textarea
                  id="agentsMd"
                  rows={4}
                  placeholder="Operating instructions and behavioral rules for the agent..."
                  className="rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-sm min-h-[100px]"
                  {...form.register("agentsMd")}
                />
              </div>

              {/* USER.md */}
              <div className="space-y-1.5">
                <Label htmlFor="userMd" className="text-xs font-medium text-[var(--content-secondary)]">
                  USER.md
                </Label>
                <Textarea
                  id="userMd"
                  rows={4}
                  placeholder="Context about the user this agent serves — role, preferences, background..."
                  className="rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-sm min-h-[100px]"
                  {...form.register("userMd")}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border-divider)] px-5 py-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
