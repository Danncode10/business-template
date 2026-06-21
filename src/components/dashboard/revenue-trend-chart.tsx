"use client";

import { useEffect, useRef, useState } from "react";

export type RevenuePoint = { date: string; revenue: number; count: number };
type Period = "today" | "week" | "month";

export function RevenueTrendChart({
  points,
  period,
  height = 200,
}: {
  points: RevenuePoint[];
  period: Period;
  height?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (period === "today") return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (period === "week") return date.toLocaleDateString("en-US", { weekday: "short" });
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const paddingX = 8;
  const paddingTop = 12;
  const paddingBottom = 24;
  const innerWidth = Math.max(0, width - paddingX * 2);
  const innerHeight = height - paddingTop - paddingBottom;
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
  const lastIndex = Math.max(points.length - 1, 1);

  const xAt = (index: number) => paddingX + (index / lastIndex) * innerWidth;
  const yAt = (value: number) => paddingTop + innerHeight - (value / maxRevenue) * innerHeight;
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(1)} ${yAt(point.revenue).toFixed(1)}`)
    .join(" ");
  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  if (width === 0) return <div ref={wrapperRef} style={{ height }} />;

  return (
    <div ref={wrapperRef} className="relative" style={{ height }}>
      <svg width={width} height={height} role="img" aria-label="Revenue trend">
        <path
          d={path}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point, index) =>
          index % labelStep === 0 || index === points.length - 1 ? (
            <text
              key={point.date}
              x={xAt(index)}
              y={height - 6}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {formatDate(point.date)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
