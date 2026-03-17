"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CronExpressionBuilder } from "@/components/cron/cron-expression-builder";
import { useCronStore } from "@/stores/cronStore";
import { useAgentStore } from "@/stores/agentStore";
import { TIMEZONES } from "@/lib/data/timezones";
import type { CronJob, ScheduleType, DeliveryMode } from "@/types";

const AVAILABLE_MODELS = [
  "gpt-4",
  "gpt-4-turbo",
  "claude-3-opus",
  "claude-3-sonnet",
  "claude-3-haiku",
  "gemini-1.5-pro",
];

const DELIVERY_CHANNELS = [
  "whatsapp",
  "discord",
  "slack",
  "telegram",
  "imessage",
  "last",
] as const;

const INTERVAL_UNITS = [
  { value: "minutes", label: "minutes", ms: 60_000 },
  { value: "hours", label: "hours", ms: 3_600_000 },
  { value: "days", label: "days", ms: 86_400_000 },
] as const;

const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_OF_HOUR = Array.from({ length: 60 }, (_, i) => i);

const addCronJobSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    scheduleType: z.enum(["cron", "interval", "once"]),
    expression: z.string().optional(),
    intervalValue: z.string().optional(),
    intervalUnit: z.enum(["minutes", "hours", "days"]).optional(),
    runAt: z.string().optional(),
    agentId: z.string().optional(),
    sessionType: z.enum(["isolated", "main"]),
    prompt: z.string().optional(),
    model: z.string().optional(),
    deliveryMode: z.enum(["announce", "webhook", "none"]),
    deliveryChannel: z.string().optional(),
    webhookUrl: z.string().optional(),
    timeout: z.string().optional(),
    maxRetries: z.string().optional(),
    timezone: z.string().optional(),
    deleteAfterRun: z.boolean(),
    lightContext: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduleType === "cron" && !data.expression?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cron expression is required",
        path: ["expression"],
      });
    }
    if (data.scheduleType === "interval" && !data.intervalValue?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interval value is required",
        path: ["intervalValue"],
      });
    }
    if (data.scheduleType === "once" && !data.runAt?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Run date/time is required",
        path: ["runAt"],
      });
    }
  });

type AddCronJobFormValues = z.infer<typeof addCronJobSchema>;

interface AddCronJobSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCronJobSheet({ open, onOpenChange }: AddCronJobSheetProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { jobs, addJob } = useCronStore();
  const { agents } = useAgentStore();

  const form = useForm<AddCronJobFormValues>({
    resolver: zodResolver(addCronJobSchema),
    defaultValues: {
      name: "",
      description: "",
      scheduleType: "cron",
      expression: "",
      intervalValue: "",
      intervalUnit: "minutes",
      runAt: "",
      agentId: "",
      sessionType: "isolated",
      prompt: "",
      model: "",
      deliveryMode: "announce",
      deliveryChannel: "",
      webhookUrl: "",
      timeout: "",
      maxRetries: "",
      timezone: "",
      deleteAfterRun: false,
      lightContext: false,
    },
  });

  const [runAtDate, setRunAtDate] = useState<Date | undefined>(undefined);
  const [runAtHour, setRunAtHour] = useState("12");
  const [runAtMinute, setRunAtMinute] = useState("00");

  const scheduleType = form.watch("scheduleType");
  const deliveryMode = form.watch("deliveryMode") as DeliveryMode;

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
      setShowAdvanced(false);
      setRunAtDate(undefined);
      setRunAtHour("12");
      setRunAtMinute("00");
    }
    onOpenChange(isOpen);
  }

  function onSubmit(values: AddCronJobFormValues) {
    const nameExists = jobs.some(
      (j) => j.name.toLowerCase() === values.name.toLowerCase()
    );
    if (nameExists) {
      form.setError("name", {
        message: "A cron job with this name already exists",
      });
      return;
    }

    const now = new Date().toISOString();
    let expression = values.expression || "";
    let intervalMs: number | undefined;

    if (values.scheduleType === "interval" && values.intervalValue) {
      const unit = INTERVAL_UNITS.find((u) => u.value === values.intervalUnit);
      intervalMs = parseInt(values.intervalValue, 10) * (unit?.ms ?? 60_000);
      expression = `every ${values.intervalValue} ${values.intervalUnit}`;
    } else if (values.scheduleType === "once" && values.runAt) {
      expression = `once at ${values.runAt}`;
    }

    const newJob: CronJob = {
      id: `cron-${crypto.randomUUID().slice(0, 8)}`,
      name: values.name,
      description: values.description || "",
      expression,
      status: "active",
      nextRun: values.scheduleType === "once" && values.runAt
        ? new Date(values.runAt).toISOString()
        : new Date(Date.now() + 3_600_000).toISOString(),
      runCount: 0,
      failCount: 0,
      createdAt: now,
      agentId: values.agentId || undefined,
      scheduleType: values.scheduleType as ScheduleType,
      intervalMs,
      runAt: values.runAt || undefined,
      sessionType: values.sessionType as "isolated" | "main",
      prompt: values.prompt || undefined,
      model: values.model || undefined,
      deliveryMode: values.deliveryMode as DeliveryMode,
      deliveryChannel: values.deliveryChannel
        ? (values.deliveryChannel as CronJob["deliveryChannel"])
        : undefined,
      webhookUrl: values.webhookUrl || undefined,
      timeout: values.timeout ? parseInt(values.timeout, 10) : undefined,
      maxRetries: values.maxRetries ? parseInt(values.maxRetries, 10) : undefined,
      timezone: values.timezone || undefined,
      deleteAfterRun: values.deleteAfterRun || undefined,
      lightContext: values.lightContext || undefined,
    };

    addJob(newJob);
    toast.success("Cron job created successfully");
    handleClose(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[640px] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">New Cron Job</SheetTitle>
        <SheetDescription className="sr-only">
          Create a new scheduled cron job
        </SheetDescription>

        {/* Header */}
        <div className="border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <h2 className="text-base font-semibold text-[var(--content-primary)]">
            New Cron Job
          </h2>
          <p className="text-xs text-[var(--content-muted)] mt-0.5">
            Schedule an automated task for your agents
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
                htmlFor="cron-name"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cron-name"
                placeholder="e.g., daily-code-review"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cron-description"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Description
              </Label>
              <Input
                id="cron-description"
                placeholder="e.g., Review all open PRs every morning"
                className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                {...form.register("description")}
              />
            </div>

            {/* Schedule Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Schedule Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1 rounded-xl border border-[var(--border-default)] p-1 bg-[var(--surface-bg)]">
                {(["cron", "interval", "once"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      form.setValue("scheduleType", type, { shouldValidate: true })
                    }
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      scheduleType === type
                        ? "bg-white text-[var(--content-primary)] shadow-sm"
                        : "text-[var(--content-muted)] hover:text-[var(--content-secondary)]"
                    }`}
                  >
                    {type === "cron"
                      ? "Cron Expression"
                      : type === "interval"
                        ? "Interval"
                        : "One-Time"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cron Expression Builder (conditional) */}
            {scheduleType === "cron" && (
              <CronExpressionBuilder
                value={form.watch("expression") || ""}
                onChange={(val) =>
                  form.setValue("expression", val, { shouldValidate: true })
                }
                error={form.formState.errors.expression?.message}
              />
            )}

            {/* Interval (conditional) */}
            {scheduleType === "interval" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[var(--content-secondary)]">
                  Interval <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 30"
                    className="h-10 rounded-xl border-[var(--border-default)] bg-white flex-1"
                    {...form.register("intervalValue")}
                  />
                  <Select
                    value={form.watch("intervalUnit")}
                    onValueChange={(val) =>
                      form.setValue(
                        "intervalUnit",
                        val as "minutes" | "hours" | "days"
                      )
                    }
                  >
                    <SelectTrigger className="w-32 !h-10 rounded-xl border-[var(--border-default)] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVAL_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.formState.errors.intervalValue && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.intervalValue.message}
                  </p>
                )}
              </div>
            )}

            {/* Run At — Calendar + Time in single popover (conditional) */}
            {scheduleType === "once" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[var(--content-secondary)]">
                  Run At <span className="text-red-500">*</span>
                </Label>

                <Popover>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-3 text-sm transition-colors hover:border-[var(--content-muted)]"
                      />
                    }
                  >
                    <CalendarDays
                      className="h-4 w-4 text-[var(--content-muted)]"
                      strokeWidth={1.5}
                    />
                    <span
                      className={
                        runAtDate
                          ? "text-[var(--content-secondary)]"
                          : "text-[var(--content-muted)]"
                      }
                    >
                      {runAtDate
                        ? `${format(runAtDate, "MMM dd, yyyy")} at ${runAtHour.padStart(2, "0")}:${runAtMinute.padStart(2, "0")}`
                        : "Pick date & time"}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="w-auto p-0"
                  >
                    <div className="rounded-xl border border-[var(--border-default)] bg-white shadow-card overflow-hidden">
                      <Calendar
                        mode="single"
                        selected={runAtDate}
                        onSelect={(date) => {
                          setRunAtDate(date);
                          if (date) {
                            const d = new Date(date);
                            d.setHours(
                              parseInt(runAtHour, 10),
                              parseInt(runAtMinute, 10)
                            );
                            form.setValue("runAt", d.toISOString(), {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />

                      {/* Time picker row */}
                      <div className="border-t border-[var(--border-divider)] px-3 py-2.5 flex items-center gap-2">
                        <Clock
                          className="h-4 w-4 text-[var(--content-muted)]"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium text-[var(--content-secondary)]">
                          Time
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          <Select
                            value={runAtHour}
                            onValueChange={(val) => {
                              const h = val as string;
                              setRunAtHour(h);
                              if (runAtDate) {
                                const d = new Date(runAtDate);
                                d.setHours(
                                  parseInt(h, 10),
                                  parseInt(runAtMinute, 10)
                                );
                                form.setValue("runAt", d.toISOString(), {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="w-16 !h-8 rounded-lg border-[var(--border-default)] bg-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS_OF_DAY.map((h) => (
                                <SelectItem key={h} value={String(h).padStart(2, "0")}>
                                  {String(h).padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-[var(--content-muted)] font-medium">
                            :
                          </span>
                          <Select
                            value={runAtMinute}
                            onValueChange={(val) => {
                              const m = val as string;
                              setRunAtMinute(m);
                              if (runAtDate) {
                                const d = new Date(runAtDate);
                                d.setHours(
                                  parseInt(runAtHour, 10),
                                  parseInt(m, 10)
                                );
                                form.setValue("runAt", d.toISOString(), {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="w-16 !h-8 rounded-lg border-[var(--border-default)] bg-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MINUTES_OF_HOUR.map((m) => (
                                <SelectItem key={m} value={String(m).padStart(2, "0")}>
                                  {String(m).padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {form.formState.errors.runAt && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.runAt.message}
                  </p>
                )}
              </div>
            )}

            {/* Agent */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Agent
              </Label>
              <Select
                value={form.watch("agentId") || undefined}
                onValueChange={(val) =>
                  form.setValue("agentId", val as string, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full !h-10 rounded-xl border-[var(--border-default)] bg-white">
                  <SelectValue placeholder="Select an agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Session Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1 rounded-xl border border-[var(--border-default)] p-1 bg-[var(--surface-bg)]">
                {(["isolated", "main"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      form.setValue("sessionType", type, { shouldValidate: true })
                    }
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      form.watch("sessionType") === type
                        ? "bg-white text-[var(--content-primary)] shadow-sm"
                        : "text-[var(--content-muted)] hover:text-[var(--content-secondary)]"
                    }`}
                  >
                    {type === "isolated" ? "Isolated (Recommended)" : "Main"}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cron-prompt"
                className="text-xs font-medium text-[var(--content-secondary)]"
              >
                Prompt
              </Label>
              <Textarea
                id="cron-prompt"
                rows={6}
                placeholder="e.g., Review all open PRs and summarize changes..."
                className="rounded-xl border-[var(--border-default)] bg-white text-sm"
                {...form.register("prompt")}
              />
              <p className="text-[11px] text-[var(--content-muted)]">
                The message or instructions sent to the agent each time this job
                runs.
              </p>
            </div>

            {/* --- Advanced Toggle --- */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-divider)]">
              <Label
                htmlFor="cron-advanced-toggle"
                className="text-sm font-medium text-[var(--content-primary)]"
              >
                Advanced Configuration
              </Label>
              <Switch
                id="cron-advanced-toggle"
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
                  {/* Model Override */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[var(--content-secondary)]">
                      Model Override
                    </Label>
                    <Select
                      value={form.watch("model") || undefined}
                      onValueChange={(val) => form.setValue("model", val as string)}
                    >
                      <SelectTrigger className="w-full !h-10 rounded-xl border-[var(--border-default)] bg-white">
                        <SelectValue placeholder="Agent's default model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-[var(--content-muted)]">
                      Override the agent&apos;s default model for this job.
                    </p>
                  </div>

                  {/* Delivery Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider">
                    Delivery
                  </h3>

                  {/* Delivery Mode */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[var(--content-secondary)]">
                      Delivery Mode
                    </Label>
                    <Select
                      value={form.watch("deliveryMode")}
                      onValueChange={(val) =>
                        form.setValue("deliveryMode", val as DeliveryMode)
                      }
                    >
                      <SelectTrigger className="w-full !h-10 rounded-xl border-[var(--border-default)] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announce">Announce</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-[var(--content-muted)]">
                      How results are delivered after each run.
                    </p>
                  </div>

                  {/* Delivery Channel (conditional) */}
                  {deliveryMode === "announce" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[var(--content-secondary)]">
                        Delivery Channel
                      </Label>
                      <Select
                        value={form.watch("deliveryChannel") || undefined}
                        onValueChange={(val) =>
                          form.setValue("deliveryChannel", val as string)
                        }
                      >
                        <SelectTrigger className="w-full !h-10 rounded-xl border-[var(--border-default)] bg-white">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_CHANNELS.map((ch) => (
                            <SelectItem key={ch} value={ch}>
                              {ch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Channel where job results are sent.
                      </p>
                    </div>
                  )}

                  {/* Webhook URL (conditional) */}
                  {deliveryMode === "webhook" && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cron-webhook-url"
                        className="text-xs font-medium text-[var(--content-secondary)]"
                      >
                        Webhook URL
                      </Label>
                      <Input
                        id="cron-webhook-url"
                        placeholder="https://example.com/webhook"
                        className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                        {...form.register("webhookUrl")}
                      />
                      <p className="text-[11px] text-[var(--content-muted)]">
                        URL to POST results to after each run.
                      </p>
                    </div>
                  )}

                  {/* Execution Section */}
                  <h3 className="text-xs font-semibold text-[var(--content-muted)] uppercase tracking-wider pt-2">
                    Execution
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Timeout */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cron-timeout"
                        className="text-xs font-medium text-[var(--content-secondary)]"
                      >
                        Timeout (seconds)
                      </Label>
                      <Input
                        id="cron-timeout"
                        type="number"
                        min="1"
                        placeholder="e.g., 300"
                        className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                        {...form.register("timeout")}
                      />
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Maximum execution time. Default: 300.
                      </p>
                    </div>

                    {/* Max Retries */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cron-max-retries"
                        className="text-xs font-medium text-[var(--content-secondary)]"
                      >
                        Max Retries
                      </Label>
                      <Input
                        id="cron-max-retries"
                        type="number"
                        min="0"
                        placeholder="e.g., 3"
                        className="h-10 rounded-xl border-[var(--border-default)] bg-white"
                        {...form.register("maxRetries")}
                      />
                      <p className="text-[11px] text-[var(--content-muted)]">
                        Retry attempts on failure. Default: 3.
                      </p>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[var(--content-secondary)]">
                      Timezone
                    </Label>
                    <Select
                      value={form.watch("timezone") || undefined}
                      onValueChange={(val) =>
                        form.setValue("timezone", val as string)
                      }
                    >
                      <SelectTrigger className="w-full !h-10 rounded-xl border-[var(--border-default)] bg-white">
                        <SelectValue placeholder="UTC (default)" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-[var(--content-muted)]">
                      IANA timezone for cron expressions. Leave empty for UTC.
                    </p>
                  </div>

                  {/* Switches */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="cron-delete-after-run"
                          className="text-xs font-medium text-[var(--content-secondary)]"
                        >
                          Delete After Run
                        </Label>
                        <p className="text-[11px] text-[var(--content-muted)]">
                          Automatically remove this job after it completes.
                        </p>
                      </div>
                      <Switch
                        id="cron-delete-after-run"
                        checked={form.watch("deleteAfterRun")}
                        onCheckedChange={(checked) =>
                          form.setValue("deleteAfterRun", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="cron-light-context"
                          className="text-xs font-medium text-[var(--content-secondary)]"
                        >
                          Light Context
                        </Label>
                        <p className="text-[11px] text-[var(--content-muted)]">
                          Use minimal context window for faster, cheaper runs.
                        </p>
                      </div>
                      <Switch
                        id="cron-light-context"
                        checked={form.watch("lightContext")}
                        onCheckedChange={(checked) =>
                          form.setValue("lightContext", checked)
                        }
                      />
                    </div>
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
              Create Cron Job
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
