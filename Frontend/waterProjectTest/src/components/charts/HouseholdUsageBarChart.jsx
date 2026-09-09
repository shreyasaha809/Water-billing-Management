import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import api from "../../api/axiosInstance";
import { theme } from "../../theme";
import ChartTooltip from "./ChartTooltip";

const COLOR_MAP = {
  NORMAL: "#22c55e",
  ABOVE_AVERAGE: "#eab308",
  HIGHEST: "#ef4444",
};

const LEGEND_PAYLOAD = [
  { value: "Normal", type: "square", color: COLOR_MAP.NORMAL },
  { value: "Above Average", type: "square", color: COLOR_MAP.ABOVE_AVERAGE },
  { value: "Highest Consumer", type: "square", color: COLOR_MAP.HIGHEST },
];

export default function HouseholdUsageBarChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/apartment-admin/charts/household-usage");
        setData(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading...</div>;
  if (data.length === 0) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted, padding: "40px 0", textAlign: "center" }}>No usage data yet for this cycle.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barCategoryGap={20}>
        <defs>
          {Object.entries(COLOR_MAP).map(([key, color]) => (
            <linearGradient key={key} id={`barGrad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <XAxis dataKey="household" tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} label={{ value: "Litres", angle: -90, position: "insideLeft", fontSize: 11, fill: theme.colors.textFaint }} />
        <Tooltip content={<ChartTooltip unit=" L" />} cursor={{ fill: theme.colors.surfaceHover }} />
        <Legend payload={LEGEND_PAYLOAD} wrapperStyle={{ fontSize: 11.5, color: theme.colors.textMuted }} />
        <Bar dataKey="usage" radius={[8, 8, 0, 0]} animationDuration={900} animationEasing="ease-out" maxBarSize={46}>
          {data.map((entry, index) => (
            <Cell key={index} fill={`url(#barGrad-${entry.colorStatus || "NORMAL"})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
