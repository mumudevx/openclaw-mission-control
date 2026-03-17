"use client";

import { useRef, useEffect } from "react";
import type { Agent } from "@/types";

interface OfficeCanvasProps {
  agents: Agent[];
  width?: number;
  height?: number;
}

const DESK_POSITIONS = [
  { x: 120, y: 100 },
  { x: 320, y: 100 },
  { x: 520, y: 100 },
  { x: 720, y: 100 },
  { x: 120, y: 300 },
  { x: 320, y: 300 },
  { x: 520, y: 300 },
  { x: 720, y: 300 },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#34d399",
  idle: "#fbbf24",
  error: "#f87171",
  offline: "#9ca3af",
};

const STATUS_BG: Record<string, string> = {
  active: "#ecfdf5",
  idle: "#fffbeb",
  error: "#fef2f2",
  offline: "#f3f4f6",
};

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFloor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#F8F6F1";
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = "rgba(0,0,0,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Desk surface
  drawRoundRect(ctx, x, y, 128, 80, 8);
  ctx.fillStyle = "#E8DFD0";
  ctx.fill();
  ctx.strokeStyle = "#D4C9B8";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Monitor
  const mx = x + 32;
  const my = y + 10;
  drawRoundRect(ctx, mx, my, 64, 40, 3);
  ctx.fillStyle = "#333";
  ctx.fill();
  ctx.strokeStyle = "#BEBEBE";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Monitor stand
  ctx.fillStyle = "#BEBEBE";
  ctx.fillRect(x + 58, y + 50, 12, 6);

  // Keyboard
  drawRoundRect(ctx, x + 34, my + 46, 60, 10, 2);
  ctx.fillStyle = "#BEBEBE";
  ctx.fill();
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  frame: number
) {
  const status = agent.status as string;
  const color = STATUS_COLORS[status] || "#9ca3af";
  const bg = STATUS_BG[status] || "#f3f4f6";
  const cx = x + 64; // center of desk
  const ay = y + 92; // below desk

  // Bounce for active agents
  const bounce = status === "active" ? Math.sin(frame * 0.08) * 3 : 0;

  // Agent circle
  ctx.beginPath();
  ctx.arc(cx, ay + bounce, 20, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, ay + 24, 14, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fill();

  // Status dot on monitor
  ctx.beginPath();
  ctx.arc(x + 64, y + 30, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Pulse ring for active
  if (status === "active") {
    const pulseAlpha = 0.3 + Math.sin(frame * 0.06) * 0.2;
    ctx.beginPath();
    ctx.arc(x + 64, y + 30, 7 + Math.sin(frame * 0.06) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(52, 211, 153, ${pulseAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Bot icon (simple pixel face)
  ctx.fillStyle = color;
  // Eyes
  ctx.fillRect(cx - 6, ay - 4 + bounce, 4, 4);
  ctx.fillRect(cx + 2, ay - 4 + bounce, 4, 4);
  // Mouth
  ctx.fillRect(cx - 4, ay + 4 + bounce, 8, 2);

  // Name label
  ctx.font = "600 10px Inter, sans-serif";
  const textWidth = ctx.measureText(agent.name).width;
  const lx = cx - textWidth / 2 - 8;
  const ly = ay + 28;

  // Label bg
  drawRoundRect(ctx, lx, ly, textWidth + 16, 18, 9);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Label text
  ctx.fillStyle = "#1A1A1A";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(agent.name, cx, ly + 9);
  ctx.textAlign = "start";

  // Activity bubble for active
  if (status === "active") {
    const bx = cx;
    const by = y - 10 + Math.sin(frame * 0.05) * 4;
    const text = "Working...";
    ctx.font = "500 9px Inter, sans-serif";
    const tw = ctx.measureText(text).width;

    drawRoundRect(ctx, bx - tw / 2 - 8, by - 8, tw + 16, 18, 6);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#E8E8E4";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#6B6B6B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bx, by + 1);
    ctx.textAlign = "start";
  }
}

function drawDecorations(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.font = "32px serif";
  ctx.globalAlpha = 0.3;
  ctx.fillText("\u{1FAB4}", 16, h - 16);
  ctx.fillText("\u{1FAB4}", w - 48, h - 16);
  ctx.font = "22px serif";
  ctx.globalAlpha = 0.2;
  ctx.fillText("\u{1F4CB}", w - 40, 30);
  ctx.globalAlpha = 1;
}

export function OfficeCanvas({ agents, width = 900, height = 480 }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const agentsRef = useRef(agents);
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  useEffect(() => {
    let running = true;

    function draw() {
      if (!running) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      frameRef.current += 1;
      const frame = frameRef.current;

      ctx.clearRect(0, 0, width, height);
      drawFloor(ctx, width, height);

      const visibleAgents = agentsRef.current.slice(0, 8);
      visibleAgents.forEach((agent, i) => {
        const pos = DESK_POSITIONS[i];
        drawDesk(ctx, pos.x, pos.y);
        drawAgent(ctx, agent, pos.x, pos.y, frame);
      });

      drawDecorations(ctx, width, height);
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, imageRendering: "auto" }}
      className="block"
    />
  );
}
