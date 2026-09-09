import { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import api from "../../api/axiosInstance";
import { theme, layoutStyles } from "../../theme";

const PIE_COLORS = ["#7c3aed", "#2563eb", "#0891b2", "#d97706", "#16a34a", "#dc2626", "#db2777"];

export default function SuperAdminOrgReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/reports/organization")
      .then((res) => setReport(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (format) => {
    const res = await api.get(`/super-admin/reports/organization/${format}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Organization-Report.${format === "pdf" ? "pdf" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading...</div>;
  if (!report) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>No data available.</div>;

  const residentStatusData = [
    { name: "Active", value: report.activeResidents },
    { name: "Inactive", value: report.inactiveResidents },
  ].filter((d) => d.value > 0);

  const billingStatusData = [
    { name: "Paid", value: report.paidBills },
    { name: "Unpaid", value: report.unpaidBills },
  ].filter((d) => d.value > 0);

  const ticketStatusData = [
    { name: "Open / In Progress", value: report.openTickets },
    { name: "Resolved / Closed", value: report.resolvedTickets },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleDownload("pdf")} style={layoutStyles.btnSecondary} className="sa-btn-secondary">📄 Download PDF</button>
        <button onClick={() => handleDownload("excel")} style={layoutStyles.btnSecondary} className="sa-btn-secondary">📊 Download Excel</button>
      </div>

      {/* Overview */}
      <SectionLabel text="Overview" />
      <div style={layoutStyles.statGrid}>
        <StatBox label="Total Communities" value={report.totalCommunities} icon="🏢" color="purple" />
        <StatBox label="Total Residents" value={report.totalResidents} icon="👨‍👩‍👧" color="blue" />
        <StatBox label="Total Admins" value={report.totalAdmins} icon="🛡️" color="amber" />
        <StatBox label="Support Tickets" value={report.totalSupportTickets} icon="🎫" color="green" />
      </div>

      {/* Billing & Revenue */}
      <SectionLabel text="Billing & Revenue" />
      <div style={layoutStyles.statGrid}>
        <StatBox label="Total Billed (₹)" value={report.totalBilledAmount.toFixed(2)} icon="🧾" color="blue" />
        <StatBox label="Total Revenue (₹)" value={report.totalRevenue.toFixed(2)} icon="💰" color="green" />
        <StatBox label="Outstanding (₹)" value={report.outstandingAmount.toFixed(2)} icon="⚠️" color="amber" />
        <StatBox label="Total Consumption (L)" value={report.totalConsumption} icon="💧" color="purple" />
      </div>

      {/* Support Activity */}
      <SectionLabel text="Support Activity" />
      <div style={layoutStyles.statGrid}>
        <StatBox label="Escalated Tickets" value={report.escalatedTickets} icon="🚨" color="amber" />
        <StatBox label="Open Tickets" value={report.openTickets} icon="🕓" color="blue" />
        <StatBox label="Resolved Tickets" value={report.resolvedTickets} icon="✅" color="green" />
      </div>

      {/* Charts */}
      <SectionLabel text="Analytics" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 26 }}>
        <ChartCard title="Community-wise Resident Distribution">
          {report.communities.length === 0 ? <EmptyChart text="No communities yet." /> : (
            <CommunityBarChart data={report.communities} dataKey="residentCount" name="Residents" color="#2563eb" />
          )}
        </ChartCard>

        <ChartCard title="Community-wise Water Usage Comparison">
          {report.communities.length === 0 ? <EmptyChart text="No usage data yet." /> : (
            <CommunityBarChart data={report.communities} dataKey="totalUsage" name="Usage (L)" color="#7c3aed" valueSuffix=" L" />
          )}
        </ChartCard>

        <ChartCard title="Revenue by Community">
          {report.communities.length === 0 ? <EmptyChart text="No revenue data yet." /> : (
            <CommunityBarChart data={report.communities} dataKey="totalRevenue" name="Revenue (₹)" color="#16a34a" valuePrefix="₹" />
          )}
        </ChartCard>

        <ChartCard title="Resident Status">
          {residentStatusData.length === 0 ? <EmptyChart text="No resident data yet." /> : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={residentStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {residentStatusData.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Billing Status Distribution">
          {billingStatusData.length === 0 ? <EmptyChart text="No bills yet." /> : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={billingStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {billingStatusData.map((d, i) => <Cell key={i} fill={d.name === "Paid" ? "#16a34a" : "#dc2626"} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Support Ticket Status Overview">
          {ticketStatusData.length === 0 ? <EmptyChart text="No tickets yet." /> : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={ticketStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {ticketStatusData.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Community comparison table */}
      <SectionLabel text="Community Comparison" />
      <table style={layoutStyles.table} className="sa-table">
        <thead><tr><Th>Community</Th><Th>Residents</Th><Th>Usage (L)</Th><Th>Revenue (₹)</Th></tr></thead>
        <tbody>
          {report.communities.map((c, i) => (
            <tr key={i}>
              <Td>{c.apartmentName}</Td><Td>{c.residentCount}</Td>
              <Td>{c.totalUsage}</Td><Td>{c.totalRevenue.toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommunityBarChart({ data, dataKey, name, color, valuePrefix = "", valueSuffix = "" }) {
  // Numbered bars keep the axis clean and layout stable no matter how many
  // communities exist or how long their names are; the wrapping legend below
  // maps each number back to its full community name.
  const indexed = data.map((d, i) => ({ ...d, __idx: i + 1 }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={indexed} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
          <XAxis dataKey="__idx" tick={{ fontSize: 11, fill: theme.colors.textMuted, fontWeight: 700 }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 10.5, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}` }}
            labelFormatter={(idx) => indexed[idx - 1]?.apartmentName || ""}
            formatter={(v) => [`${valuePrefix}${v}${valueSuffix}`, name]}
          />
          <Bar dataKey={dataKey} name={name} radius={[8, 8, 0, 0]} maxBarSize={50} fill={color} />
        </BarChart>
      </ResponsiveContainer>
      <div className="sa-chart-legend">
        {indexed.map((d) => (
          <div key={d.__idx} className="sa-chart-legend-item" title={d.apartmentName}>
            <span className="sa-chart-legend-swatch" style={{ background: color }}>{d.__idx}</span>
            <span className="sa-chart-legend-name">{d.apartmentName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAT_TINTS = {
  purple: { bg: "linear-gradient(160deg, #efe9fe, #f7f4ff)", border: "rgba(124,58,237,0.28)", accent: "#7c3aed" },
  blue: { bg: "linear-gradient(160deg, #e4ecfe, #f2f6ff)", border: "rgba(37,99,235,0.28)", accent: "#2563eb" },
  amber: { bg: "linear-gradient(160deg, #fef3d8, #fffaf0)", border: "rgba(217,119,6,0.3)", accent: "#d97706" },
  green: { bg: "linear-gradient(160deg, #ddfbe8, #f2fff7)", border: "rgba(22,163,74,0.28)", accent: "#16a34a" },
};

function SectionLabel({ text }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: theme.colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, margin: "22px 0 12px 0" }}>{text}</div>;
}

function ChartCard({ title, children }) {
  return (
    <div className="sa-panel" style={{ padding: "18px 18px 14px 18px", borderRadius: 16, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.colors.text, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function EmptyChart({ text }) {
  return <div style={{ fontSize: 12, color: theme.colors.textFaint, textAlign: "center", padding: "50px 0" }}>{text}</div>;
}

function StatBox({ label, value, icon, color }) {
  const tint = STAT_TINTS[color] || STAT_TINTS.purple;
  return (
    <div style={{ ...layoutStyles.statCard, background: tint.bg, border: `1px solid ${tint.border}`, borderLeft: `3.5px solid ${tint.accent}` }} className="sa-stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
        <div style={layoutStyles.statLabel}>{label}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: tint.accent, marginTop: 6 }}>{value}</div>
    </div>
  );
}
function Th({ children }) { return <th style={layoutStyles.th}>{children}</th>; }
function Td({ children }) { return <td style={layoutStyles.td}>{children}</td>; }
