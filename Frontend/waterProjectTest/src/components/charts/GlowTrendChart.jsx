import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { theme } from "../../theme";
import ChartTooltip from "./ChartTooltip";

// Compact "95K" / "₹95K" style formatter used for the floating peak labels.
export function formatCompact(value, prefix = "") {
  if (value == null || isNaN(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 100000) return `${prefix}${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1000) return `${prefix}${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${prefix}${Math.round(value)}`;
}

/**
 * Glowing gradient area/line chart — smooth curve, gradient fill,
 * and floating value badges over the top N points. Shared visual
 * language used for billing/usage trend charts across dashboards.
 */
export default function GlowTrendChart({
  data,
  xKey,
  yKey,
  valuePrefix = "",
  unit = "",
  height = 260,
  highlightCount = 3,
  gradientId = "glowTrendGradient",
}) {
  if (!data || data.length === 0) return null;

  const sorted = [...data]
    .map((d, i) => ({ i, v: d[yKey] || 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, Math.min(highlightCount, data.length));
  const highlightSet = new Set(sorted.map((s) => s.i));

  const renderDot = (props) => {
    const { cx, cy, index } = props;
    if (cx == null || cy == null) return null;
    const val = data[index][yKey];
    const isHighlight = highlightSet.has(index);

    if (!isHighlight) {
      return (
        <circle
          key={`dot-${index}`}
          cx={cx} cy={cy} r={3}
          fill={theme.colors.surface}
          stroke={theme.colors.accent}
          strokeWidth={2}
        />
      );
    }

    const label = formatCompact(val, valuePrefix);
    const boxWidth = Math.max(38, label.length * 8 + 14);

    return (
      <g key={`dot-${index}`} className="glow-peak-dot">
        <circle cx={cx} cy={cy} r={7} fill={theme.colors.accent} opacity={0.18} />
        <circle cx={cx} cy={cy} r={4.5} fill={theme.colors.surface} stroke={theme.colors.accent} strokeWidth={2.5} />
        <rect
          x={cx - boxWidth / 2} y={cy - 34} width={boxWidth} height={22} rx={8}
          fill={theme.colors.surface} stroke={theme.colors.border}
          style={{ filter: "drop-shadow(0 4px 10px rgba(var(--shadow-color),0.18))" }}
        />
        <text
          x={cx} y={cy - 19} textAnchor="middle" fontSize={11} fontWeight={700}
          fill={theme.colors.primary} fontFamily={theme.font}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="anim-card">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 34, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.38} />
              <stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${gradientId}Stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.colors.primary} />
              <stop offset="100%" stopColor={theme.colors.accent} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={theme.colors.border} vertical={false} />
          <XAxis
            dataKey={xKey} tick={{ fontSize: 11, fill: theme.colors.textMuted }}
            axisLine={{ stroke: theme.colors.border }} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={false} tickLine={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: theme.colors.accent, strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone" dataKey={yKey} name={yKey}
            stroke={`url(#${gradientId}Stroke)`} strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={renderDot}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: theme.colors.primary }}
            animationDuration={900} animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
