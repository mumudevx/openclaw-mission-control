"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Agent } from "@/types";

interface AgentActivityChartProps {
  agents: Agent[];
}

export function AgentActivityChart({ agents }: AgentActivityChartProps) {
  const data = agents.slice(0, 6).map((agent) => ({
    name: agent.name.length > 10 ? agent.name.slice(0, 10) + "…" : agent.name,
    tokens: agent.tokenUsage.total,
    cost: agent.costTotal,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#9B9B9B", fontSize: 11 }}
          axisLine={{ stroke: "#E8E8E4" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9B9B9B", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #E8E8E4",
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(value) => [`${Number(value).toLocaleString()}`, "Tokens"]}
        />
        <Bar dataKey="tokens" fill="#E8654A" radius={[6, 6, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
