import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import api from "../../api/axiosInstance";
import { theme, layoutStyles } from "../../theme";

const PIE_COLORS = ["#7c3aed", "#2563eb", "#0891b2", "#d97706", "#16a34a", "#dc2626"];
const STATUS_COLORS = { GENERATED: "#d97706", PAID: "#16a34a", OVERDUE: "#dc2626" };

export default function CommunityAnalyticsReport() {
  const [report, setReport] = useState(null);
  const [readings, setReadings] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/apartment-admin/reports/community-analytics"),
      api.get("/apartment-admin/water-usage/readings"),
      api.get("/apartment-admin/water-usage/bills"),
    ])
      .then(([reportRes, readingsRes, billsRes]) => {
        setReport(reportRes.data.data);
        setReadings(readingsRes.data.data || []);
        setBills(billsRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (format) => {
    const res = await api.get(`/apartment-admin/reports/community-analytics/${format}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Community-Analytics-Report.${format === "pdf" ? "pdf" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading...</div>;
  if (!report) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>No data available.</div>;

  const isGrowth = report.consumptionChangePercent >= 0;

  // Monthly usage trend — sum usageUnits (liters) per billing cycle, chronologically.
  const monthlyMap = {};
  readings.forEach((r) => {
    if (!r.billingCycle) return;
    monthlyMap[r.billingCycle] = (monthlyMap[r.billingCycle] || 0) + (r.usageUnits || 0);
  });
  const monthlyTrend = Object.entries(monthlyMap)
    .map(([cycle, liters]) => ({ cycle, liters }))
    .sort((a, b) => a.cycle.localeCompare(b.cycle));

  // Billing distribution — count of bills by status.
  const statusMap = {};
  bills.forEach((b) => {
    statusMap[b.status] = (statusMap[b.status] || 0) + 1;
  });
  const billingDistribution = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Water allocation overview — purchased vs consumed (all-time).
  const allocationData = [
    { name: "Consumed", value: Math.round(report.totalConsumptionAllTime) },
    { name: "Purchased Surplus", value: Math.max(0, Math.round(report.totalWaterPurchasedLiters - report.totalConsumptionAllTime)) },
  ].filter((d) => d.value > 0);

  // Community water consumption — current vs previous cycle.
  const cycleComparison = [
    { label: "Previous Cycle", liters: Math.round(report.previousCycleConsumption) },
    { label: "Current Cycle", liters: Math.round(report.currentCycleConsumption) },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleDownload("pdf")} style={layoutStyles.btnSecondary} className="aa-btn-secondary">📄 Download PDF</button>
        <button onClick={() => handleDownload("excel")} style={layoutStyles.btnSecondary} className="aa-btn-secondary">📊 Download Excel</button>
      </div>

      <div style={layoutStyles.statGrid}>
        <StatBox label="Total Residents" value={report.totalResidents} />
        <StatBox label="Total Consumption (L)" value={report.totalConsumptionAllTime} />
        <StatBox label="Avg / Household (L)" value={report.averageConsumptionPerHousehold} />
        <StatBox
          label={isGrowth ? "Consumption Growth" : "Consumption Decline"}
          value={`${Math.abs(report.consumptionChangePercent)}%`}
          color={isGrowth ? theme.colors.danger : theme.colors.success}
        />
      </div>
      <div style={{ ...layoutStyles.statGrid, marginTop: 14 }}>
        <StatBox label="Water Purchased (L)" value={report.totalWaterPurchasedLiters} />
        <StatBox label="Purchase Cost (₹)" value={report.totalWaterPurchaseCost.toFixed(2)} />
        <StatBox label="Support Tickets" value={report.totalSupportTickets} />
        <StatBox label="Announcements" value={report.totalAnnouncements} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 26 }}>
        <ChartCard title="Monthly Usage Trend">
          {monthlyTrend.length === 0 ? (
            <EmptyChart text="No metered readings yet." />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="commTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
                <XAxis dataKey="cycle" tick={{ fontSize: 10.5, fill: theme.colors.textMuted }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} formatter={(v) => [`${v} L`, "Usage"]} />
                <Area type="monotone" dataKey="liters" stroke="#7c3aed" strokeWidth={2.5} fill="url(#commTrendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Community Water Consumption">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={cycleComparison} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: theme.colors.textMuted }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 10.5, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} formatter={(v) => [`${v} L`, "Consumption"]} />
              <Bar dataKey="liters" radius={[8, 8, 0, 0]} maxBarSize={70} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Billing Distribution">
          {billingDistribution.length === 0 ? (
            <EmptyChart text="No bills generated yet." />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={billingDistribution} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {billingDistribution.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLORS[d.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Water Allocation Overview">
          {allocationData.length === 0 ? (
            <EmptyChart text="No purchase/consumption data yet." />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {allocationData.map((d, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} formatter={(v) => [`${v} L`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="aa-panel" style={{ padding: "18px 18px 14px 18px", borderRadius: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.colors.text, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function EmptyChart({ text }) {
  return <div style={{ fontSize: 12, color: theme.colors.textFaint, textAlign: "center", padding: "50px 0" }}>{text}</div>;
}

function StatBox({ label, value, color }) {
  return (
    <div style={layoutStyles.statCard} className="aa-stat-card">
      <div style={layoutStyles.statLabel} className="aa-stat-label">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || theme.colors.text, marginTop: 4 }} className="aa-heading">{value}</div>
    </div>
  );
}
