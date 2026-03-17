"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", tokens: 45000 },
  { name: "Tue", tokens: 52000 },
  { name: "Wed", tokens: 38000 },
  { name: "Thu", tokens: 67000 },
  { name: "Fri", tokens: 54000 },
  { name: "Sat", tokens: 31000 },
  { name: "Sun", tokens: 42000 },
];

export function TokenUsageChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E8654A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#E8654A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EC" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#9B9B9B", fontSize: 12 }}
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
          formatter={(value) => [`${Number(value).toLocaleString()} tokens`, "Usage"]}
        />
        <Area
          type="monotone"
          dataKey="tokens"
          stroke="#E8654A"
          strokeWidth={2}
          fill="url(#tokenGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
