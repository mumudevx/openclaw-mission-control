"use client";

import { cronToHuman } from "@/lib/utils/cron-parser";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CronBadgeProps {
  expression: string;
}

export function CronBadge({ expression }: CronBadgeProps) {
  const humanReadable = cronToHuman(expression);

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
      >
        <code className="rounded bg-[var(--surface-bg)] px-2 py-1 font-mono text-xs text-[var(--content-secondary)]">
          {expression}
        </code>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-medium">
        {humanReadable}
      </TooltipContent>
    </Tooltip>
  );
}
