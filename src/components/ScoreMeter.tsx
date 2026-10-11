import { useId } from "react";
import { cn } from "@/lib/utils";

/** A single axis on the Well-Architected alignment radar. */
export interface RadarAxis {
  /** Full index name, used for the accessible label. */
  label: string;
  /** Short label rendered next to the axis. */
  shortLabel: string;
  /** 0-100 alignment reading for this axis. */
  value: number;
}

interface ScoreMeterProps {
  /** The axes to plot. Three axes render a clean triangular radar. */
  axes: RadarAxis[];
  className?: string;
  /** SVG viewport size in px (square). */
  size?: number;
}

/** Convert a 0-100 value on a given axis index to an {x,y} point. */
function axisPoint(
  index: number,
  total: number,
  value: number,
  center: number,
  radius: number,
): { x: number; y: number } {
  // Start at the top (−90°) and distribute axes evenly clockwise.
  const angle = -Math.PI / 2 + (index / total) * 2 * Math.PI;
  const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
  return {
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  };
}

function pointsToPath(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

/**
 * Dynamic radar chart that maps candidate troubleshooting logs against the
 * core structural building codes of the AWS Well-Architected Framework.
 *
 * Hand-rendered as SVG to stay dependency-free and consistent with the
 * project's hand-authored primitive conventions. No absolute pass/fail
 * numerical grading strings are rendered — the shape itself is the signal.
 */
export function ScoreMeter({ axes, className, size = 240 }: ScoreMeterProps) {
  const gradientId = useId();
  const center = size / 2;
  const radius = size / 2 - 36;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = axes.map((axis, i) =>
    axisPoint(i, axes.length, axis.value, center, radius),
  );

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[280px]"
        role="img"
        aria-label={`Well-Architected alignment radar: ${axes
          .map((a) => a.label)
          .join(", ")}`}
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.12"
            />
          </radialGradient>
        </defs>

        {/* Concentric grid rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={pointsToPath(
              axes.map((_, i) =>
                axisPoint(i, axes.length, ring * 100, center, radius),
              ),
            )}
            className="fill-none stroke-border"
            strokeWidth={1}
          />
        ))}

        {/* Axis spokes */}
        {axes.map((axis, i) => {
          const outer = axisPoint(i, axes.length, 100, center, radius);
          return (
            <line
              key={axis.label}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              className="stroke-border"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={pointsToPath(dataPoints)}
          fill={`url(#${gradientId})`}
          className="stroke-primary"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data vertices */}
        {dataPoints.map((p, i) => (
          <circle
            key={axes[i].label}
            cx={p.x}
            cy={p.y}
            r={3.5}
            className="fill-primary"
          />
        ))}

        {/* Axis short labels */}
        {axes.map((axis, i) => {
          const labelPoint = axisPoint(i, axes.length, 118, center, radius);
          const anchor =
            Math.abs(labelPoint.x - center) < 1
              ? "middle"
              : labelPoint.x > center
                ? "start"
                : "end";
          return (
            <text
              key={`label-${axis.label}`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {axis.shortLabel}
            </text>
          );
        })}
      </svg>

      <ul className="w-full space-y-1.5">
        {axes.map((axis) => (
          <li
            key={axis.label}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span className="size-2 shrink-0 rounded-full bg-primary" />
            <span className="flex-1 text-foreground">{axis.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
