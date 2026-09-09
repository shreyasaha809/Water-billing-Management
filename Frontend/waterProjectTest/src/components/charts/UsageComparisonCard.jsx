import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { theme } from "../../theme";

export default function UsageComparisonCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/household-user/usage-comparison");
        setData(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading...</div>;
  if (!data) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>No comparison data available yet.</div>;

  const isAbove = data.status === "ABOVE_AVERAGE";
  const isBelow = data.status === "BELOW_AVERAGE";

  const barPercent = data.averageUsage > 0
    ? Math.min((data.userUsage / (data.averageUsage * 2)) * 100, 100)
    : 0;

  const barColor = isAbove ? theme.colors.danger : isBelow ? theme.colors.success : theme.colors.primary;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        <MetricBox label="Your Usage" value={`${data.userUsage} L`} accent={theme.colors.primary} />
        <MetricBox label="Apartment Average" value={`${data.averageUsage} L`} accent={theme.colors.accent} />
        <MetricBox label="Difference" value={`${data.difference} L`} accent={isAbove ? theme.colors.danger : theme.colors.success} />
        <MetricBox label="Percentage" value={`${data.percentage}%`} accent={isAbove ? theme.colors.danger : theme.colors.success} />
      </div>

      <div style={{ background: theme.colors.surfaceHover, borderRadius: 999, height: 14, overflow: "hidden", marginBottom: 12, border: `1px solid ${theme.colors.border}` }}>
        <div className="glass-shimmer" style={{
          position: "relative", width: `${barPercent}%`, height: "100%",
          background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
          borderRadius: 999, transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)", overflow: "hidden",
        }} />
      </div>

      <div style={{
        fontSize: 13.5, fontWeight: 600,
        color: isAbove ? theme.colors.danger : isBelow ? theme.colors.success : theme.colors.text,
      }}>
        {isAbove && `⚠ You used ${data.percentage}% more water than the apartment average.`}
        {isBelow && `✅ Great job! You used ${data.percentage}% less water than the apartment average.`}
        {!isAbove && !isBelow && `Your usage matches the apartment average.`}
      </div>
    </div>
  );
}

function MetricBox({ label, value, accent }) {
  return (
    <div className="hover-lift" style={{ padding: 14, borderRadius: 12, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, borderTop: `2px solid ${accent || theme.colors.primary}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: theme.colors.textFaint, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: theme.colors.text, marginTop: 5, fontFamily: theme.mono }}>{value}</div>
    </div>
  );
}