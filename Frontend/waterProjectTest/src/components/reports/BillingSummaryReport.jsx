import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { theme, layoutStyles } from "../../theme";

export default function BillingSummaryReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/apartment-admin/reports/billing-summary")
      .then((res) => setReport(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (format) => {
    const res = await api.get(`/apartment-admin/reports/billing-summary/${format}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Billing-Summary-Report.${format === "pdf" ? "pdf" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>Loading...</div>;
  if (!report) return <div style={{ fontSize: 12.5, color: theme.colors.textMuted }}>No data available.</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleDownload("pdf")} style={layoutStyles.btnSecondary}>📄 Download PDF</button>
        <button onClick={() => handleDownload("excel")} style={layoutStyles.btnSecondary}>📊 Download Excel</button>
      </div>

      <div style={{ ...layoutStyles.statGrid, marginBottom: 20 }}>
        <StatBox label="Total Bills" value={report.totalBills} />
        <StatBox label="Paid" value={report.paidBills} color={theme.colors.success} />
        <StatBox label="Unpaid" value={report.unpaidBills} color={theme.colors.warning} />
        <StatBox label="Overdue" value={report.overdueBills} color={theme.colors.danger} />
      </div>
      <div style={{ ...layoutStyles.statGrid, marginBottom: 20 }}>
        <StatBox label="Total Billed (₹)" value={report.totalBilledAmount.toFixed(2)} />
        <StatBox label="Total Collected (₹)" value={report.totalCollected.toFixed(2)} color={theme.colors.success} />
        <StatBox label="Outstanding (₹)" value={report.totalOutstanding.toFixed(2)} color={theme.colors.danger} />
      </div>

      <table style={layoutStyles.table}>
        <thead><tr><Th>Cycle</Th><Th>Bills</Th><Th>Billed (₹)</Th><Th>Collected (₹)</Th></tr></thead>
        <tbody>
          {report.cycleTrends.map((t, i) => (
            <tr key={i}>
              <Td>{t.billingCycle}</Td><Td>{t.billCount}</Td>
              <Td>{t.totalBilled.toFixed(2)}</Td><Td>{t.totalCollected.toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={layoutStyles.statCard}>
      <div style={layoutStyles.statLabel}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || theme.colors.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}
function Th({ children }) { return <th style={layoutStyles.th}>{children}</th>; }
function Td({ children }) { return <td style={layoutStyles.td}>{children}</td>; }