const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
}

export function cronToHuman(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return expression;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Every N minutes: */N * * * *
  if (minute.startsWith("*/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const n = parseInt(minute.slice(2), 10);
    if (n === 1) return "Every minute";
    return `Every ${n} minutes`;
  }

  // Every hour at minute N: N * * * *
  if (!minute.includes("*") && !minute.includes("/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const m = parseInt(minute, 10);
    if (m === 0) return "Every hour";
    return `Every hour at minute ${m}`;
  }

  // Every day at H:MM: M H * * *
  if (!minute.includes("*") && !hour.includes("*") && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (m === 0) return `Every day at ${formatHour(h)}`;
    return `Every day at ${h}:${m.toString().padStart(2, "0")}`;
  }

  // Specific day of week: M H * * D
  if (!minute.includes("*") && !hour.includes("*") && dayOfMonth === "*" && month === "*" && !dayOfWeek.includes("*")) {
    const h = parseInt(hour, 10);
    const d = parseInt(dayOfWeek, 10);
    const dayName = dayNames[d] || dayOfWeek;
    return `Every ${dayName} at ${formatHour(h)}`;
  }

  // Specific day of month: M H D * *
  if (!minute.includes("*") && !hour.includes("*") && !dayOfMonth.includes("*") && month === "*" && dayOfWeek === "*") {
    const h = parseInt(hour, 10);
    const dom = parseInt(dayOfMonth, 10);
    const suffix = dom === 1 ? "st" : dom === 2 ? "nd" : dom === 3 ? "rd" : "th";
    if (parseInt(minute, 10) === 0 && h === 0) return `${dom}${suffix} of every month at midnight`;
    return `${dom}${suffix} of every month at ${formatHour(h)}`;
  }

  return expression;
}
