import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../../api/axiosInstance";
import { theme } from "../../theme";
import ChartTooltip from "./ChartTooltip";

export default function DailyUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/household-user/charts/daily-usage");
        setData(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }} className="skeleton" >&nbsp;</div>;
  if (data.length === 0) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted, padding: "40px 0", textAlign: "center" }}>No usage data yet.</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="dailyUsageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={theme.colors.border} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} label={{ value: "Litres", angle: -90, position: "insideLeft", fontSize: 11, fill: theme.colors.textFaint }} />
        <Tooltip content={<ChartTooltip unit=" L" />} cursor={{ stroke: theme.colors.primary, strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone" dataKey="usage" stroke={theme.colors.primary} strokeWidth={2.5}
          fill="url(#dailyUsageGradient)" dot={{ r: 3, fill: theme.colors.primary, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
          animationDuration={900} animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
