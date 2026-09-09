import { useEffect, useState } from "react";
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, ReferenceLine } from "recharts";
import api from "../../api/axiosInstance";
import { theme, layoutStyles } from "../../theme";
import { useToast } from "../../context/ToastContext";

const COLOR_MAP = { Highest: "#ef4444", "Above Average": "#eab308", Normal: "#22c55e", Lowest: "#3b82f6" };

export default function ResidentUsageReport() {
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/reports/resident-usage-comparison");
      setReport(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const res = await api.get(`/apartment-admin/reports/resident-usage-comparison/${format}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Resident-Usage-Report.${format === "pdf" ? "pdf" : "xlsx"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading report...</div>;
  if (!report || report.rows.length === 0) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>No usage data available for this cycle.</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>{report.apartmentName}</div>
          <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
            Cycle: {report.billingCycle} · Total Usage: {report.totalUsage} L · Average: {report.averageUsage} L
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleDownload("pdf")} disabled={downloading} style={layoutStyles.btnSecondary}>📄 Download PDF</button>
          <button onClick={() => handleDownload("excel")} disabled={downloading} style={layoutStyles.btnSecondary}>📊 Download Excel</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={report.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            {report.rows.map((row, index) => (
              <linearGradient key={index} id={`usageGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_MAP[row.rank] || COLOR_MAP.Normal} stopOpacity={0.95} />
                <stop offset="100%" stopColor={COLOR_MAP[row.rank] || COLOR_MAP.Normal} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
          <XAxis dataKey="flatNumber" tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={{ stroke: theme.colors.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: theme.colors.textMuted }} axisLine={false} tickLine={false} label={{ value: "Litres", angle: -90, position: "insideLeft", fontSize: 11, fill: theme.colors.textMuted }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 12, border: `1px solid ${theme.colors.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}
            formatter={(value, name, props) => [`${value} L`, props.payload.householdName]}
          />
          {report.averageUsage != null && (
            <ReferenceLine y={report.averageUsage} stroke="#7c3aed" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: `Avg ${report.averageUsage} L`, position: "right", fontSize: 10.5, fill: "#7c3aed", fontWeight: 700 }} />
          )}
          <Bar dataKey="totalUsage" radius={[8, 8, 0, 0]} maxBarSize={46}>
            {report.rows.map((row, index) => (
              <Cell key={index} fill={`url(#usageGrad-${index})`} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>

      <table style={{ ...layoutStyles.table, marginTop: 20 }}>
        <thead>
          <tr>
            <Th>Resident</Th><Th>Flat</Th><Th>Usage (L)</Th><Th>Bill Amount (₹)</Th><Th>Category</Th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, i) => (
            <tr key={i}>
              <Td>{row.householdName}</Td>
              <Td>{row.flatNumber}</Td>
              <Td>{row.totalUsage}</Td>
              <Td>{row.totalBilled.toFixed(2)}</Td>
              <Td>
                <span style={{
                  padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                  background: `${COLOR_MAP[row.rank]}22`, color: COLOR_MAP[row.rank],
                }}>
                  {row.rank}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) { return <th style={layoutStyles.th}>{children}</th>; }
function Td({ children }) { return <td style={layoutStyles.td}>{children}</td>; }