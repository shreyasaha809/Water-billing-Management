import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { theme, layoutStyles, StatusBadge } from "../../theme";
import { CountUp, SkeletonStatCard, SkeletonRows, AnimatedCard, AnimatedRow } from "../../components/Animated";
import AiAssistant from "../../components/AiAssistant";
import HouseholdUsageBarChart from "../../components/charts/HouseholdUsageBarChart";
import GlowTrendChart from "../../components/charts/GlowTrendChart";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageSelector from "../../components/LanguageSelector";
import "./apartmentAdminDashboard.css";
import ResidentUsageReport from "../../components/reports/ResidentUsageReport";
import BillingSummaryReport from "../../components/reports/BillingSummaryReport";
import CommunityAnalyticsReport from "../../components/reports/CommunityAnalyticsReport";
import { useToast } from "../../context/ToastContext";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "households", label: "Households", icon: "⌂" },
  { key: "waterBilling", label: "Water Usage & Billing", icon: "◇" },
  { key: "billingCycles", label: "Billing Cycles", icon: "🗓" },
  { key: "invoices", label: "Invoices", icon: "▧" },
  { key: "tariffPlans", label: "Tariff Plans", icon: "▥" },
  { key: "waterPurchase", label: "Water Purchase", icon: "▣" },
  { key: "distribution", label: "Cost Distribution", icon: "⚖" },
  { key: "alerts", label: "Alerts", icon: "⚠" },
  { key: "deletedHouseholds", label: "Deleted Households", icon: "🗑" },
  { key: "support", label: "Support", icon: "🎫" },
  { key: "reports", label: "Reports", icon: "▨" },
  { key: "announcements", label: "Announcements", icon: "📢" },
  { key: "profile", label: "Profile", icon: "☺" },
  { key: "logout", label: "Logout", icon: "⏻" },
];

export default function ApartmentAdminDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || "Community Admin";
  const [active, setActive] = useState("dashboard");
  const [apartmentName, setApartmentName] = useState("");

  const [households, setHouseholds] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);

  const [readings, setReadings] = useState([]);
  const [bills, setBills] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [loadingBills, setLoadingBills] = useState(true);

  const [deletedLogs, setDeletedLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchHouseholds = async () => {
    setLoadingHouseholds(true);
    try {
      const res = await api.get("/apartment-admin/households");
      setHouseholds(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingHouseholds(false); }
  };

  const fetchReadings = async () => {
    setLoadingReadings(true);
    try {
      const res = await api.get("/apartment-admin/water-usage/readings");
      setReadings(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingReadings(false); }
  };

  const fetchBills = async () => {
    setLoadingBills(true);
    try {
      const res = await api.get("/apartment-admin/water-usage/bills");
      setBills(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingBills(false); }
  };

  const fetchDeletedLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get("/apartment-admin/households/deleted-logs");
      setDeletedLogs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingLogs(false); }
  };

  const fetchProfileForApartmentName = async () => {
    try {
      const res = await api.get("/apartment-admin/profile");
      setApartmentName(res.data.data.apartmentName);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHouseholds();
    fetchReadings();
    fetchBills();
    fetchDeletedLogs();
    fetchProfileForApartmentName();
  }, []);

  const handleNavClick = (key) => {
    if (key === "logout") {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    setActive(key);
  };

  const handleDeleteHousehold = async (id, name) => {
    const confirmed = window.confirm(`Delete household user "${name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await api.delete(`/apartment-admin/households/${id}`);
      toast.success(res.data.message);
      fetchHouseholds();
      fetchDeletedLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleUpdateHousehold = async (id, payload) => {
    const res = await api.put(`/apartment-admin/households/${id}`, payload);
    fetchHouseholds();
    return res.data;
  };

  return (
    <div style={layoutStyles.page} className="aa-shell">
      <div className="aa-bg-blob aa-blob-1" />
      <div className="aa-bg-blob aa-blob-2" />
      <div className="aa-bg-blob aa-blob-3" />
      <div className="aa-content">
      <div style={layoutStyles.topBar} className="anim-navbar aa-topbar">
        <div style={layoutStyles.logoBlock}>
          <div className="aa-logo-badge"><HydroLogo colorMode="dark" /></div>
          <div>
            <div style={layoutStyles.brand} className="aa-heading aa-topbar-text">HydroHome</div>
            <div style={layoutStyles.tagline} className="aa-topbar-text-muted">WATER MONITORING SYSTEM</div>
          </div>
        </div>

       <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <ThemeToggle />
  <LanguageSelector variant="light" />
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
    <div style={layoutStyles.userBlock}>
      <span style={layoutStyles.statusDot} />
      <span style={layoutStyles.userText} className="aa-topbar-text">Apartment Admin · {fullName}</span>
    </div>
    {apartmentName && (
      <div className="aa-topbar-text-muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
        {apartmentName}
      </div>
    )}
  </div>
  <div style={layoutStyles.headerAvatar} className="aa-avatar">{getInitials(fullName)}</div>
</div>
      </div>

      <div style={layoutStyles.body}>
        <div style={layoutStyles.sidebar} className="anim-sidebar aa-sidebar">
          <div style={layoutStyles.sidebarHeader} className="aa-eyebrow">Dashboard</div>
          <div style={layoutStyles.sidebarDivider} />
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              style={{ ...layoutStyles.navItem, ...(active === item.key ? layoutStyles.navItemActive : {}) }}
              className={active === item.key ? "aa-nav-active" : "aa-nav-item"}
            >
              <span style={layoutStyles.navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div style={layoutStyles.main} key={active} className="anim-page">
          {active === "dashboard" && (
            <DashboardHome
              households={households}
              bills={bills}
              loadingHouseholds={loadingHouseholds}
              loadingBills={loadingBills}
            />
          )}

          {active === "households" && (
            <HouseholdsSection
              households={households}
              loading={loadingHouseholds}
              onDelete={handleDeleteHousehold}
              onUpdate={handleUpdateHousehold}
              navigate={navigate}
            />
          )}

          {active === "waterBilling" && (
            <WaterBillingSection
              households={households}
              readings={readings}
              bills={bills}
              loadingReadings={loadingReadings}
              loadingBills={loadingBills}
              onRecorded={() => {
                fetchReadings();
                fetchBills();
              }}
            />
          )}

          {active === "invoices" && (
            <InvoicesSection bills={bills} households={households} loading={loadingBills} />
          )}

          {active === "deletedHouseholds" && (
            <DeletedHouseholdsSection logs={deletedLogs} loading={loadingLogs} />
          )}

        {active === "announcements" && <AdminAnnouncementsSection />}
         {active === "profile" && <ProfileSection />}
          {active === "billingCycles" && <BillingCyclesSection />}
          {active === "tariffPlans" && <TariffPlansSection />}
          {active === "waterPurchase" && <WaterPurchaseSection />}
          {active === "distribution" && <DistributionSection />}
         {active === "alerts" && <AlertsSection />}
          {active === "support" && <AdminSupportSection />}

        {active === "reports" && <ReportsSection />}
        </div>
      </div>

      <AiAssistant
    role="APARTMENT_ADMIN"
    onNavigate={(key) => setActive(key)}
/>
      </div>
    </div>
  );
}

function DashboardHome({ households, bills, loadingHouseholds, loadingBills }) {
  const totalUsage = bills.reduce((sum, b) => sum + (b.usageUnits || 0), 0);
  const totalBilled = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <>
      <SectionTitle text="Dashboard" />
      <div style={layoutStyles.statGrid}>
        {loadingHouseholds ? (
          [0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} className="aa-stat-card" />)
        ) : (
          <>
            <AnimatedCard index={0}><StatCard label="TOTAL HOUSEHOLDS" value={households.length} color="purple" icon="🏠" /></AnimatedCard>
            <AnimatedCard index={1}><StatCard label="BILLS GENERATED" value={bills.length} color="blue" icon="🧾" /></AnimatedCard>
            <AnimatedCard index={2}><StatCard label="TOTAL USAGE (LITERS)" value={totalUsage} decimals={1} color="amber" icon="💧" /></AnimatedCard>
            <AnimatedCard index={3}><StatCard label="TOTAL BILLED (₹)" value={totalBilled} prefix="₹" decimals={2} color="green" icon="₹" /></AnimatedCard>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, marginBottom: 18 }}>
        <Panel title="Usage Trend Across Billing Cycles">
          {loadingBills ? <EmptyState text="Loading..." /> : <UsageTrendChart bills={bills} />}
        </Panel>

        <Panel title="Bills Overview">
          {loadingBills ? <EmptyState text="Loading..." /> : <BillStatusDonutChart bills={bills} />}
        </Panel>
      </div>

      <Panel title="Billing by Household">
        {loadingBills ? <EmptyState text="Loading..." /> : <HouseholdBillingTrendChart bills={bills} />}
      </Panel>

      <Panel title="Household Usage Comparison (Current Cycle)">
        <HouseholdUsageBarChart />
      </Panel>

      <Panel title="Recent Bills">
        {loadingBills ? (
          <EmptyState text="Loading..." />
        ) : bills.length === 0 ? (
          <EmptyState text="No bills generated yet." />
        ) : (
          <BillsTable bills={bills.slice(0, 5)} />
        )}
      </Panel>
    </>
  );
}

function UsageTrendChart({ bills }) {
  const cycleMap = {};
  bills.forEach((b) => {
    cycleMap[b.billingCycle] = (cycleMap[b.billingCycle] || 0) + b.usageUnits;
  });
  const data = Object.entries(cycleMap).map(([cycle, usage]) => ({ billingCycle: cycle, usageUnits: usage }));

  if (data.length === 0) return <EmptyState text="No usage data yet." />;

  const width = 900;
  const height = 240;
  const padding = 44;
  const barWidth = Math.min(36, (width - padding * 2) / (data.length * 2));
  const maxVal = Math.max(...data.map((d) => d.usageUnits), 1) * 1.15;

  return (
    <div style={{ overflowX: "auto" }} className="anim-card">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="trendBarActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="trendBarPast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.85} />
            <stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padding} x2={width - padding}
            y1={height - padding - f * (height - padding * 2)} y2={height - padding - f * (height - padding * 2)}
            stroke={theme.colors.border} strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {data.map((d, i) => {
          const x = padding + (i / data.length) * (width - padding * 2) + ((width - padding * 2) / data.length - barWidth) / 2;
          const barHeight = (d.usageUnits / maxVal) * (height - padding * 2);
          const y = height - padding - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="6"
                fill={i === data.length - 1 ? "url(#trendBarActive)" : "url(#trendBarPast)"}
              />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={theme.colors.text} fontFamily={theme.font}>
                {d.usageUnits.toFixed(1)}
              </text>
              <text x={x + barWidth / 2} y={height - 14} textAnchor="middle" fontSize="10.5" fill={theme.colors.textFaint} fontFamily={theme.font}>
                {d.billingCycle}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BillStatusDonutChart({ bills }) {
  const total = bills.length || 1;
  const generated = bills.filter((b) => b.status === "GENERATED").length;
  const paid = bills.filter((b) => b.status === "PAID").length;
  const other = total - generated - paid;

  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const generatedLen = (generated / total) * circumference;
  const paidLen = (paid / total) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }} className="anim-card">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 6px 16px rgba(var(--shadow-color),0.15))" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.colors.surfaceHover} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={theme.colors.warning} strokeWidth={strokeWidth}
          strokeDasharray={`${generatedLen} ${circumference - generatedLen}`}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={theme.colors.success} strokeWidth={strokeWidth}
          strokeDasharray={`${paidLen} ${circumference - paidLen}`}
          strokeDashoffset={-generatedLen}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="48%" textAnchor="middle" fontSize="26" fontWeight="800" fill={theme.colors.text} fontFamily={theme.font}>{total}</text>
        <text x="50%" y="63%" textAnchor="middle" fontSize="11" fill={theme.colors.textFaint} fontFamily={theme.font}>Total Bills</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <LegendRow color={theme.colors.warning} label="Generated" value={generated} />
        <LegendRow color={theme.colors.success} label="Paid" value={paid} />
        {other > 0 && <LegendRow color={theme.colors.textFaint} label="Other" value={other} />}
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ fontSize: 12.5, color: theme.colors.textMuted, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: theme.colors.text, fontWeight: 700, marginLeft: 4 }}>{value}</span>
    </div>
  );
}

function HouseholdBillingTrendChart({ bills }) {
  const householdMap = {};
  bills.forEach((b) => {
    householdMap[b.householdUserName] = (householdMap[b.householdUserName] || 0) + b.amount;
  });
  const data = Object.entries(householdMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .reverse();

  if (data.length === 0) return <EmptyState text="No billing data yet." />;

  return (
    <GlowTrendChart
      data={data} xKey="name" yKey="amount"
      valuePrefix="₹" unit=" ₹" height={280} highlightCount={3}
      gradientId="billingByHousehold"
    />
  );
}

function HouseholdsSection({ households, loading, onDelete, onUpdate, navigate }) {
  const [editingHousehold, setEditingHousehold] = useState(null);
  return (
    <>
      <SectionTitle text="Households" />
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => navigate("/dashboard/apartment-admin/households/register")}
          style={layoutStyles.btnPrimary} className="aa-btn-primary"
        >
          + Register Household
        </button>
      </div>
      <Panel title="All Households">
        {loading ? (
          <table style={layoutStyles.table} className="aa-table"><tbody><SkeletonRows rows={3} columns={6} /></tbody></table>
        ) : households.length === 0 ? (
          <EmptyState text="No household users registered yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead>
              <tr>
                <Th>FULL NAME</Th>
                <Th>EMAIL</Th>
                <Th>PHONE</Th>
                <Th>FLAT NO.</Th>
                <Th>STATUS</Th>
                <Th>ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {households.map((h, i) => (
                <AnimatedRow key={h.id} index={i}>
                  <Td>{h.fullName}</Td>
                  <Td>{h.email}</Td>
                  <Td>{h.phoneNumber}</Td>
                  <Td>{h.flatNumber}</Td>
                  <Td>
                    <Badge status={h.status} />
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setEditingHousehold(h)}
                        className="aa-icon-btn"
                        data-tooltip="Edit household"
                        aria-label={`Edit ${h.fullName}`}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(h.id, h.fullName)} style={layoutStyles.btnDanger} className="aa-btn-danger">
                        Delete
                      </button>
                    </div>
                  </Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {editingHousehold && (
        <EditHouseholdModal
          household={editingHousehold}
          onClose={() => setEditingHousehold(null)}
          onSave={onUpdate}
        />
      )}
    </>
  );
}

function EditHouseholdModal({ household, onClose, onSave }) {
  const toast = useToast();
  const [fullName, setFullName] = useState(household.fullName || "");
  const [email, setEmail] = useState(household.email || "");
  const [phoneNumber, setPhoneNumber] = useState(household.phoneNumber || "");
  const [flatNumber, setFlatNumber] = useState(household.flatNumber || "");
  const [status, setStatus] = useState(household.status || "ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !flatNumber.trim()) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(household.id, { fullName, email, phoneNumber, flatNumber, status });
      toast.success("Household updated successfully.");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ ...layoutStyles.sectionTitle, fontSize: 17 }} className="aa-heading">Edit Household</h2>
          <button type="button" onClick={onClose} className="aa-icon-btn" aria-label="Close" data-tooltip="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={layoutStyles.label}>Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={layoutStyles.input} className="aa-input" required />

          <label style={layoutStyles.label}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={layoutStyles.input} className="aa-input" required />

          <label style={layoutStyles.label}>Phone Number</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={layoutStyles.input} className="aa-input" required />

          <label style={layoutStyles.label}>Flat / House Number</label>
          <input value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} style={layoutStyles.input} className="aa-input" required />

          <label style={layoutStyles.label}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={layoutStyles.input} className="aa-input">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {error && <div style={{ color: theme.colors.danger, fontSize: 12.5, marginTop: 12, fontWeight: 600 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button type="submit" disabled={saving} style={layoutStyles.btnPrimary} className="aa-btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} style={layoutStyles.btnSecondary} className="aa-btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WaterBillingSection({ households, readings, bills, loadingReadings, loadingBills, onRecorded }) {
  const toast = useToast();
  const [householdUserId, setHouseholdUserId] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [billGeneratedDate, setBillGeneratedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const billingCycleRef = useRef(null);

  const formatBillingCycle = (monthValue) => {
    if (!monthValue) return "";
    const [year, month] = monthValue.split("-");
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${monthNames[parseInt(month, 10) - 1]}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!householdUserId || !currentReading || !billingCycle) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
   const res = await api.post("/apartment-admin/water-usage/readings", {
        householdUserId: Number(householdUserId),
        currentReading: Number(currentReading),
        billingCycle: formatBillingCycle(billingCycle),
        billGeneratedDate: billGeneratedDate || undefined,
      });
      setSuccess(res.data.message);
      setHouseholdUserId("");
      setCurrentReading("");
      setBillingCycle("");
      setBillGeneratedDate("");
      onRecorded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record reading.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBill = async (billId, billNumber) => {
    const confirmed = window.confirm(`Delete bill "${billNumber}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await api.delete(`/apartment-admin/water-usage/bills/${billId}`);
      toast.success(res.data.message);
      onRecorded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bill.");
    }
  };

  return (
    <>
      <SectionTitle text="Water Usage & Billing" />

      <Panel title="Record Meter Reading & Generate Bill">
        <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Household</label>
            <select
              value={householdUserId}
              onChange={(e) => setHouseholdUserId(e.target.value)}
              style={layoutStyles.input} className="aa-input"
            >
              <option value="">-- Select household --</option>
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.fullName} — Flat {h.flatNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Current Meter Reading (Liters)</label>
            <input
              type="number"
              step="0.01"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              style={layoutStyles.input} className="aa-input"
              placeholder="e.g. 250"
            />
          </div>
<div className="aa-field-highlight">
            <label style={layoutStyles.label}>Billing Cycle</label>
            <input
              type="month"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              style={layoutStyles.input} className="aa-input"
            />
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Bill Date (optional — defaults to today)</label>
            <input
              type="date"
              value={billGeneratedDate}
              onChange={(e) => setBillGeneratedDate(e.target.value)}
              style={layoutStyles.input} className="aa-input"
            />
          </div>

          {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: theme.colors.success, fontSize: 12, marginTop: 10 }}>{success}</div>}

          <button type="submit" disabled={submitting} style={{ ...layoutStyles.btnPrimary, marginTop: 18 }} className="aa-btn-primary">
            {submitting ? "Processing..." : "Record Reading & Generate Bill"}
          </button>
        </form>
      </Panel>

      <Panel title="Meter Reading History" collapsible>
        {loadingReadings ? (
          <table style={layoutStyles.table} className="aa-table"><tbody><SkeletonRows rows={3} columns={7} /></tbody></table>
        ) : readings.length === 0 ? (
          <EmptyState text="No meter readings recorded yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead>
              <tr>
                <Th>HOUSEHOLD</Th>
                <Th>FLAT</Th>
                <Th>PREVIOUS (L)</Th>
                <Th>CURRENT (L)</Th>
                <Th>USAGE (L)</Th>
                <Th>CYCLE</Th>
                <Th>DATE</Th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <AnimatedRow key={r.id} index={i}>
                  <Td>{r.householdUserName}</Td>
                  <Td>{r.flatNumber}</Td>
                  <Td>{r.previousReading}</Td>
                  <Td>{r.currentReading}</Td>
                  <Td>{r.usageUnits}</Td>
                  <Td>{r.billingCycle}</Td>
                  <Td>{new Date(r.readingDate).toLocaleDateString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Generated Bills" collapsible>
        {loadingBills ? (
          <table style={layoutStyles.table} className="aa-table"><tbody><SkeletonRows rows={3} columns={9} /></tbody></table>
        ) : bills.length === 0 ? (
          <EmptyState text="No bills generated yet." />
        ) : (
          <BillsTable bills={bills} onDelete={handleDeleteBill} />
        )}
      </Panel>
    </>
  );
}

function InvoicesSection({ bills, households, loading }) {
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterHousehold, setFilterHousehold] = useState("");
  const [filterCycle, setFilterCycle] = useState("");

  const cycles = [...new Set(bills.map((b) => b.billingCycle))];

  const filteredBills = bills.filter((b) => {
    const matchesHousehold = !filterHousehold || b.householdUserName === filterHousehold;
    const matchesCycle = !filterCycle || b.billingCycle === filterCycle;
    return matchesHousehold && matchesCycle;
  });

  return (
    <>
      <SectionTitle text="Invoices" />

      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="Total Invoices" value={bills.length} color="purple" /></AnimatedCard>
        <AnimatedCard index={1}><StatCard label="Filtered Results" value={filteredBills.length} color="blue" /></AnimatedCard>
        <AnimatedCard index={2}>
          <StatCard label="Total Billed (₹)" value={bills.reduce((s, b) => s + b.amount, 0)} prefix="₹" decimals={2} color="green" />
        </AnimatedCard>
      </div>

      <Panel title="Filter Invoices">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }} className="aa-field-highlight">
            <label style={layoutStyles.label}>Household</label>
            <select value={filterHousehold} onChange={(e) => setFilterHousehold(e.target.value)} style={layoutStyles.input} className="aa-input">
              <option value="">All Households</option>
              {households.map((h) => (
                <option key={h.id} value={h.fullName}>{h.fullName} — Flat {h.flatNumber}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 180 }} className="aa-field-highlight">
            <label style={layoutStyles.label}>Billing Cycle</label>
            <select value={filterCycle} onChange={(e) => setFilterCycle(e.target.value)} style={layoutStyles.input} className="aa-input">
              <option value="">All Cycles</option>
              {cycles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="All Invoices" collapsible>
        {loading ? (
          <table style={layoutStyles.table} className="aa-table"><tbody><SkeletonRows rows={4} columns={8} /></tbody></table>
        ) : filteredBills.length === 0 ? (
          <EmptyState text="No invoices match the selected filters." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead>
              <tr>
                <Th>Bill No.</Th><Th>Household</Th><Th>Flat</Th><Th>Cycle</Th>
                <Th>Usage (L)</Th><Th>Amount (₹)</Th><Th>Status</Th><Th>Invoice</Th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((b, i) => (
                <AnimatedRow key={b.id} index={i}>
                  <Td>{b.billNumber}</Td>
                  <Td>{b.householdUserName}</Td>
                  <Td>{b.flatNumber}</Td>
                  <Td>{b.billingCycle}</Td>
                  <Td>{b.usageUnits}</Td>
                  <Td>{b.amount.toFixed(2)}</Td>
                  <Td><Badge status={b.status} /></Td>
                  <Td>
                    <button onClick={() => setSelectedBill(b)} style={layoutStyles.btnSecondary} className="aa-btn-secondary">View</button>
                  </Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {selectedBill && (
        <AdminInvoiceModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </>
  );
}

function AdminInvoiceModal({ bill, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="anim-modal-overlay" style={invoiceStyles.overlay} onClick={onClose}>
      <div className="anim-modal" style={invoiceStyles.card} onClick={(e) => e.stopPropagation()} id="invoice-print-area">
        <div style={invoiceStyles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HydroLogo colorMode="light" />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: theme.colors.text }}>HydroHome</div>
              <div style={{ fontSize: 10.5, color: theme.colors.textFaint }}>Water Monitoring & Billing</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: theme.colors.primary }}>INVOICE</div>
            <div style={{ fontSize: 11.5, color: theme.colors.textFaint, marginTop: 2 }}>{bill.billNumber}</div>
          </div>
        </div>

        <div style={invoiceStyles.divider} />

        <div style={invoiceStyles.metaRow}>
          <div>
            <div style={invoiceStyles.metaLabel}>Billed To</div>
            <div style={invoiceStyles.metaValue}>{bill.householdUserName}</div>
            <div style={invoiceStyles.metaSub}>Flat {bill.flatNumber}</div>
          </div>
        <div style={{ textAlign: "right" }}>
            <div style={invoiceStyles.metaLabel}>Billing Cycle</div>
            <div style={invoiceStyles.metaValue}>{bill.billingCycle}</div>
            <div style={invoiceStyles.metaSub}>Generated {new Date(bill.generatedDate).toLocaleDateString()}</div>
            <div style={invoiceStyles.metaSub}>Due {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"}</div>
          </div>
        </div>

       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: theme.colors.text }}>Total Usage</span>
          <span style={{ fontWeight: 700, color: theme.colors.text }}>{bill.usageUnits?.toFixed(1)} L</span>
        </div>

        <table style={invoiceStyles.table}>
          <thead>
            <tr>
              <th style={invoiceStyles.th}>Description</th>
              <th style={invoiceStyles.th}>Volume</th>
              <th style={invoiceStyles.th}>Rate</th>
              <th style={{ ...invoiceStyles.th, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.tier1Usage != null ? (
              <>
                <tr>
                  <td style={invoiceStyles.td}>
                    Tier 1
                    <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Up to {bill.tier1Usage.toFixed(1)} L</div>
                  </td>
                  <td style={invoiceStyles.td}>{bill.tier1Usage.toFixed(1)} L</td>
                  <td style={invoiceStyles.td}>₹{bill.tier1Rate.toFixed(2)}/L</td>
                  <td style={{ ...invoiceStyles.td, textAlign: "right" }}>₹{bill.tier1Amount.toFixed(2)}</td>
                </tr>
                {bill.tier2Usage > 0 && (
                  <tr>
                    <td style={invoiceStyles.td}>
                      Tier 2
                      <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Beyond threshold</div>
                    </td>
                    <td style={invoiceStyles.td}>{bill.tier2Usage.toFixed(1)} L</td>
                    <td style={invoiceStyles.td}>₹{bill.tier2Rate.toFixed(2)}/L</td>
                    <td style={{ ...invoiceStyles.td, textAlign: "right" }}>₹{bill.tier2Amount.toFixed(2)}</td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td style={invoiceStyles.td}>Water usage charges — {bill.billingCycle}</td>
                <td style={invoiceStyles.td}>{bill.usageUnits}</td>
                <td style={invoiceStyles.td}>{bill.ratePerUnit}</td>
                <td style={{ ...invoiceStyles.td, textAlign: "right" }}>
                  ₹{(bill.amount - (bill.extraChargeAmount || 0) - (bill.lateFeeAmount || 0)).toFixed(2)}
                </td>
              </tr>
            )}

            {bill.extraChargeAmount > 0 && (
              <tr>
                <td style={invoiceStyles.td}>
                  Shared Area Water Allocation
                  <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Reconciled against actual purchase cost</div>
                </td>
                <td style={invoiceStyles.td}>—</td>
                <td style={invoiceStyles.td}>—</td>
                <td style={{ ...invoiceStyles.td, textAlign: "right" }}>₹{bill.extraChargeAmount.toFixed(2)}</td>
              </tr>
            )}

            {bill.lateFeeAmount > 0 && (
              <tr>
                <td style={invoiceStyles.td}>
                  Late Payment Penalty
                  <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Overdue payment charge</div>
                </td>
                <td style={invoiceStyles.td}>—</td>
                <td style={invoiceStyles.td}>—</td>
                <td style={{ ...invoiceStyles.td, textAlign: "right" }}>₹{bill.lateFeeAmount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={invoiceStyles.totalRow}>
          <span style={invoiceStyles.totalLabel}>Total Amount Due</span>
          <span style={invoiceStyles.totalValue}>₹{bill.amount.toFixed(2)}</span>
        </div>

        <div style={{ marginTop: 10 }}>
          <Badge status={bill.status} />
        </div>

        <div style={invoiceStyles.footer}>
          This is a system-generated invoice from HydroHome Water Monitoring & Billing Platform.
        </div>

        <div style={invoiceStyles.actions}>
          <button onClick={handlePrint} style={layoutStyles.btnPrimary} className="aa-btn-primary">🖨 Print / Save as PDF</button>
          <button onClick={onClose} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}
function BillsTable({ bills, onDelete }) {
  return (
    <table style={layoutStyles.table} className="aa-table">
      <thead>
        <tr>
          <Th>BILL NO.</Th>
          <Th>HOUSEHOLD</Th>
          <Th>FLAT</Th>
          <Th>CYCLE</Th>
          <Th>USAGE (L)</Th>
          <Th>RATE/L (₹)</Th>
          <Th>AMOUNT (₹)</Th>
          <Th>STATUS</Th>
          <Th>GENERATED</Th>
          <Th>DUE DATE</Th>
          {onDelete && <Th>ACTIONS</Th>}
        </tr>
      </thead>
      <tbody>
        {bills.map((b) => (
          <tr key={b.id}>
            <Td>{b.billNumber}</Td>
            <Td>{b.householdUserName}</Td>
            <Td>{b.flatNumber}</Td>
            <Td>{b.billingCycle}</Td>
            <Td>{b.usageUnits}</Td>
            <Td>{b.ratePerUnit}</Td>
            <Td>{b.amount.toFixed(2)}</Td>
            <Td>
              <Badge status={b.status} />
            </Td>
            <Td>{new Date(b.generatedDate).toLocaleDateString()}</Td>
            <Td>{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}</Td>
            {onDelete && (
              <Td>
                <button onClick={() => onDelete(b.id, b.billNumber)} style={layoutStyles.btnDanger} className="aa-btn-danger">
                  Delete
                </button>
              </Td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TariffPlansSection() {
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [baseTierLimitLiters, setBaseTierLimitLiters] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [higherRate, setHigherRate] = useState("");
  const [lateFeeAmount, setLateFeeAmount] = useState("");
  const [lateFeeIntervalDays, setLateFeeIntervalDays] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/tariff-plan");
      setPlan(res.data.data);
      setBaseTierLimitLiters(res.data.data.baseTierLimitLiters);
      setBaseRate(res.data.data.baseRate);
      setHigherRate(res.data.data.higherRate);
      setLateFeeAmount(res.data.data.lateFeeAmount);
      setLateFeeIntervalDays(res.data.data.lateFeeIntervalDays);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/apartment-admin/tariff-plan", {
        baseTierLimitLiters: Number(baseTierLimitLiters),
        baseRate: Number(baseRate),
        higherRate: Number(higherRate),
        lateFeeAmount: Number(lateFeeAmount),
        lateFeeIntervalDays: Number(lateFeeIntervalDays),
      });
      setPlan(res.data.data);
      toast.success(res.data.message);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update tariff plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionTitle text="Tariff Plans" />
      <Panel title="Tiered Pricing Configuration">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : !editMode ? (
          <>
            <p style={{ fontSize: 12.5, color: theme.colors.textMuted, marginBottom: 16 }}>
              First {plan?.baseTierLimitLiters?.toLocaleString()} L billed at base rate, everything beyond that at the higher rate. A late fee applies for every {plan?.lateFeeIntervalDays} day(s) a bill remains unpaid past its due date.
            </p>
            <div style={layoutStyles.statGrid}>
              <AnimatedCard index={0}><ProfileField label="Base Tier Limit (L)" value={plan?.baseTierLimitLiters} highlight="purple" /></AnimatedCard>
              <AnimatedCard index={1}><ProfileField label="Base Rate (₹/L)" value={plan?.baseRate} highlight="blue" /></AnimatedCard>
              <AnimatedCard index={2}><ProfileField label="Higher Rate (₹/L)" value={plan?.higherRate} highlight="amber" /></AnimatedCard>
              <AnimatedCard index={3}><ProfileField label="Late Fee (₹)" value={plan?.lateFeeAmount} highlight="green" /></AnimatedCard>
              <AnimatedCard index={4}><ProfileField label="Late Fee Interval (days)" value={plan?.lateFeeIntervalDays} highlight="purple" /></AnimatedCard>
            </div>
            <button onClick={() => setEditMode(true)} style={{ ...layoutStyles.btnPrimary, marginTop: 16 }} className="aa-btn-primary">
              Edit Tariff Plan
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ maxWidth: 400 }}>
            <div className="aa-field-highlight">
              <label style={layoutStyles.label}>Base Tier Limit (Liters)</label>
              <input type="number" value={baseTierLimitLiters} onChange={(e) => setBaseTierLimitLiters(e.target.value)} style={layoutStyles.input} className="aa-input" required />
            </div>

            <div className="aa-field-highlight">
              <label style={layoutStyles.label}>Base Rate (₹ per Liter)</label>
              <input type="number" step="0.01" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} style={layoutStyles.input} className="aa-input" required />
            </div>

            <div className="aa-field-highlight">
              <label style={layoutStyles.label}>Higher Rate (₹ per Liter, beyond tier limit)</label>
              <input type="number" step="0.01" value={higherRate} onChange={(e) => setHigherRate(e.target.value)} style={layoutStyles.input} className="aa-input" required />
            </div>

            <div className="aa-field-highlight">
              <label style={layoutStyles.label}>Late Fee Amount (₹)</label>
              <input type="number" step="1" value={lateFeeAmount} onChange={(e) => setLateFeeAmount(e.target.value)} style={layoutStyles.input} className="aa-input" required />
            </div>

            <div className="aa-field-highlight">
              <label style={layoutStyles.label}>Late Fee Interval (days overdue between each charge)</label>
              <input type="number" step="1" value={lateFeeIntervalDays} onChange={(e) => setLateFeeIntervalDays(e.target.value)} style={layoutStyles.input} className="aa-input" required />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={layoutStyles.btnPrimary} className="aa-btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditMode(false)} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Panel>
    </>
  );
}

function WaterPurchaseSection() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("");
  const [sourceType, setSourceType] = useState("MUNICIPAL");
  const [volume, setVolume] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/water-purchases");
      setPurchases(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const formatCycle = (v) => {
    if (!v) return "";
    const [year, month] = v.split("-");
    const names = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${names[parseInt(month, 10) - 1]}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!billingCycle || !volume || !unitCost || !purchaseDate) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/apartment-admin/water-purchases", {
        billingCycle: formatCycle(billingCycle),
        sourceType,
        volumePurchasedLiters: Number(volume),
        unitCost: Number(unitCost),
        purchaseDate,
      });
      setSuccess(res.data.message);
      setVolume(""); setUnitCost(""); setPurchaseDate("");
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionTitle text="Water Purchase" />

      <Panel title="Record New Purchase">
        <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Billing Cycle (Month)</label>
            <input type="month" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} style={layoutStyles.input} className="aa-input" />
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Source Type</label>
            <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} style={layoutStyles.input} className="aa-input">
              <option value="MUNICIPAL">Municipal Supply</option>
              <option value="TANKER">Tanker Delivery</option>
            </select>
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Volume Purchased (Liters)</label>
            <input type="number" step="0.01" value={volume} onChange={(e) => setVolume(e.target.value)} style={layoutStyles.input} className="aa-input" placeholder="e.g. 50000" />
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Unit Cost (₹ per Liter)</label>
            <input type="number" step="0.001" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} style={layoutStyles.input} className="aa-input" placeholder="e.g. 0.15" />
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Purchase Date</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} style={layoutStyles.input} className="aa-input" />
          </div>

          {volume && unitCost && (
            <div style={{ marginTop: 12, fontSize: 13, color: theme.colors.primary, fontWeight: 700 }}>
              Total Cost: ₹{(Number(volume) * Number(unitCost)).toFixed(2)}
            </div>
          )}

          {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: theme.colors.success, fontSize: 12, marginTop: 10 }}>{success}</div>}

          <button type="submit" disabled={submitting} style={{ ...layoutStyles.btnPrimary, marginTop: 18 }} className="aa-btn-primary">
            {submitting ? "Recording..." : "Record Purchase"}
          </button>
        </form>
      </Panel>

      <Panel title="Purchase History" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : purchases.length === 0 ? (
          <EmptyState text="No purchases recorded yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Cycle</Th><Th>Source</Th><Th>Volume (L)</Th><Th>Unit Cost (₹)</Th><Th>Total Cost (₹)</Th><Th>Date</Th></tr></thead>
            <tbody>
              {purchases.map((p, i) => (
                <AnimatedRow key={p.id} index={i}>
                  <Td>{p.billingCycle}</Td>
                  <Td>{p.sourceType === "TANKER" ? "🚛 Tanker" : "🏛 Municipal"}</Td>
                  <Td>{p.volumePurchasedLiters}</Td>
                  <Td>{p.unitCost}</Td>
                  <Td>{p.totalCost.toFixed(2)}</Td>
                  <Td>{new Date(p.purchaseDate).toLocaleDateString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function DistributionSection() {
  const [cycle, setCycle] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCycle = (v) => {
    if (!v) return "";
    const [year, month] = v.split("-");
    const names = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${names[parseInt(month, 10) - 1]}-${year}`;
  };

  const handleCalculate = async () => {
    setError("");
    if (!cycle) { setError("Please select a billing cycle."); return; }
    setLoading(true);
    try {
      const res = await api.get(`/apartment-admin/distribution/${formatCycle(cycle)}`);
      setResults(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate distribution.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = results ? results.reduce((s, r) => s + r.allocatedCost, 0) : 0;

  return (
    <>
      <SectionTitle text="Cost Distribution" />
      <Panel title="Calculate Proportional Cost Distribution">
        <p style={{ fontSize: 12.5, color: theme.colors.textMuted, marginBottom: 16 }}>
          Distributes total water purchase cost across households by metered consumption. Households without readings fall back to an equal flat share.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }} className="aa-field-highlight">
            <label style={layoutStyles.label}>Billing Cycle</label>
            <input type="month" value={cycle} onChange={(e) => setCycle(e.target.value)} style={layoutStyles.input} className="aa-input" />
          </div>
          <button onClick={handleCalculate} disabled={loading} style={{ ...layoutStyles.btnPrimary, marginBottom: 2 }} className="aa-btn-primary">
            {loading ? "Calculating..." : "Calculate Distribution"}
          </button>
        </div>
        {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 14 }}>{error}</div>}
      </Panel>

      {results && (
        <Panel title={`Distribution Result — Total Allocated: ₹${totalAllocated.toFixed(2)}`}>
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Household</Th><Th>Flat</Th><Th>Metered Usage (L)</Th><Th>Allocated Cost (₹)</Th><Th>Method</Th></tr></thead>
            <tbody>
              {results.map((r, i) => (
                <AnimatedRow key={r.householdUserId} index={i}>
                  <Td>{r.householdName}</Td>
                  <Td>{r.flatNumber}</Td>
                  <Td>{r.meteredUsageLiters}</Td>
                  <Td>₹{r.allocatedCost.toFixed(2)}</Td>
                  <Td>
                    <span style={{
                      padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                      background: r.allocationMethod === "PROPORTIONAL" ? theme.colors.successLight : theme.colors.warningLight,
                      color: r.allocationMethod === "PROPORTIONAL" ? theme.colors.success : theme.colors.warning,
                    }}>
                      {r.allocationMethod === "PROPORTIONAL" ? "Metered" : "Flat Split"}
                    </span>
                  </Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </>
  );
}

function AlertsSection() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/alerts");
      setAlerts(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await api.post("/apartment-admin/alerts/run-check-now");
      toast.success("Alert check completed. Refreshing list...");
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run alert check.");
    } finally {
      setRunning(false);
    }
  };

  const handleRunLateFeeCheck = async () => {
    setRunning(true);
    try {
      await api.post("/apartment-admin/alerts/run-late-fee-check-now");
      toast.success("Late fee check completed. Refresh bills to see changes.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run late fee check.");
    } finally {
      setRunning(false);
    }
  };

  const thresholdAlerts = alerts.filter((a) => a.alertType === "THRESHOLD_EXCEEDED");
  const leakAlerts = alerts.filter((a) => a.alertType === "LEAK_SUSPECTED");
  const tariffAlerts = alerts.filter((a) => a.alertType === "TARIFF_THRESHOLD_EXCEEDED");

  return (
    <>
      <SectionTitle text="Alerts" />

      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="Total Alerts" value={alerts.length} color="purple" /></AnimatedCard>
        <AnimatedCard index={1}><StatCard label="Threshold Exceeded" value={thresholdAlerts.length} color="amber" /></AnimatedCard>
        <AnimatedCard index={2}><StatCard label="Suspected Leaks" value={leakAlerts.length} color="blue" /></AnimatedCard>
        <AnimatedCard index={3}><StatCard label="Tariff Threshold" value={tariffAlerts.length} color="green" /></AnimatedCard>
      </div>

      <Panel title="Alert Engine">
        <p style={{ fontSize: 12.5, color: theme.colors.textMuted, marginBottom: 14 }}>
          Runs automatically every day at 7:00 AM — checks each household against usage thresholds, tariff limits, and flags statistical outliers (usage &gt; 2σ above their average) as possible leaks. Emails are sent automatically when triggered.
        </p>
        <button onClick={handleRunNow} disabled={running} style={layoutStyles.btnPrimary} className="aa-btn-primary">
          {running ? "Running..." : "Run Check Now (for testing)"}
        </button>
        <button onClick={handleRunLateFeeCheck} disabled={running} style={{ ...layoutStyles.btnSecondary, marginLeft: 10 }} className="aa-btn-secondary">
          Run Late Fee Check Now (for testing)
        </button>
      </Panel>

      <Panel title="Alert Log" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : alerts.length === 0 ? (
          <EmptyState text="No alerts triggered yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Household</Th><Th>Flat</Th><Th>Type</Th><Th>Message</Th><Th>Triggered</Th></tr></thead>
            <tbody>
              {alerts.map((a, i) => (
                <AnimatedRow key={a.id} index={i}>
                  <Td>{a.householdName}</Td>
                  <Td>{a.flatNumber}</Td>
                  <Td>
                    <span style={{
                      padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                      background: a.alertType === "LEAK_SUSPECTED" ? theme.colors.dangerLight : theme.colors.warningLight,
                      color: a.alertType === "LEAK_SUSPECTED" ? theme.colors.danger : theme.colors.warning,
                    }}>
                      {a.alertType === "LEAK_SUSPECTED" ? "🚨 Leak"
                        : a.alertType === "TARIFF_THRESHOLD_EXCEEDED" ? "💰 Tariff"
                        : "⚠ Threshold"}
                    </span>
                  </Td>
                  <Td style={{ whiteSpace: "normal", maxWidth: 350 }}>{a.message}</Td>
                  <Td>{new Date(a.triggeredAt).toLocaleString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function BillingCyclesSection() {
  const toast = useToast();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCycle, setNewCycle] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/billing-cycles");
      setCycles(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCycles(); }, []);

  const formatCycle = (v) => {
    if (!v) return "";
    const [year, month] = v.split("-");
    const names = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return `${names[parseInt(month, 10) - 1]}-${year}`;
  };

  const handleOpen = async () => {
    if (!newCycle) { toast.warning("Select a month first."); return; }
    setProcessing(true);
    try {
      const res = await api.post(`/apartment-admin/billing-cycles/${formatCycle(newCycle)}/open`);
      toast.success(res.data.message);
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open cycle.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalize = async (cycleName) => {
    const confirmed = window.confirm(`Finalize "${cycleName}"? This will generate bills for all households with recorded readings.`);
    if (!confirmed) return;
    setProcessing(true);
    try {
     const res = await api.put(`/apartment-admin/billing-cycles/${cycleName}/finalize`);
      toast.success(res.data.message);
      if (res.data.data?.warning) {
        toast.warning(res.data.data.warning, 8000);
      }
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize cycle.");
    } finally {
      setProcessing(false);
    }
  };

  const handleArchive = async (cycleName) => {
    setProcessing(true);
    try {
      const res = await api.put(`/apartment-admin/billing-cycles/${cycleName}/archive`);
      toast.success(res.data.message);
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive cycle.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <SectionTitle text="Billing Cycles" />

      <Panel title="Open a New Billing Cycle" collapsible>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }} className="aa-field-highlight">
            <label style={layoutStyles.label}>Cycle Month</label>
            <input type="month" value={newCycle} onChange={(e) => setNewCycle(e.target.value)} style={layoutStyles.input} className="aa-input" />
          </div>
          <button onClick={handleOpen} disabled={processing} style={{ ...layoutStyles.btnPrimary, marginBottom: 2 }} className="aa-btn-primary">
            Open Cycle
          </button>
        </div>
      </Panel>

      <Panel title="All Billing Cycles" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : cycles.length === 0 ? (
          <EmptyState text="No billing cycles yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Cycle</Th><Th>Status</Th><Th>Bills Generated</Th><Th>Opened</Th><Th>Finalized</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {cycles.map((c, i) => (
                <AnimatedRow key={c.id} index={i}>
                  <Td>{c.cycleName}</Td>
                  <Td>
                    <span style={{
                      padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                      background: c.status === "OPEN" ? theme.colors.primaryLight
                        : c.status === "FINALIZED" ? theme.colors.successLight : theme.colors.bg,
                      color: c.status === "OPEN" ? theme.colors.primary
                        : c.status === "FINALIZED" ? theme.colors.success : theme.colors.textMuted,
                    }}>
                      {c.status}
                    </span>
                  </Td>
                  <Td>{c.billsGenerated}</Td>
                  <Td>{new Date(c.openedAt).toLocaleDateString()}</Td>
                  <Td>{c.finalizedAt ? new Date(c.finalizedAt).toLocaleDateString() : "—"}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.status === "OPEN" && (
                        <button onClick={() => handleFinalize(c.cycleName)} disabled={processing} style={layoutStyles.btnSuccess} className="aa-btn-success">
                          Finalize
                        </button>
                      )}
                      {c.status === "FINALIZED" && (
                        <button onClick={() => handleArchive(c.cycleName)} disabled={processing} style={layoutStyles.btnSecondary} className="aa-btn-secondary">
                          Archive
                        </button>
                      )}
                    </div>
                  </Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}


function DeletedHouseholdsSection({ logs, loading }) {
  return (
    <>
      <SectionTitle text="Deleted Households" />
      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="TOTAL DELETIONS" value={logs.length} /></AnimatedCard>
      </div>
      <Panel title="Deletion History" collapsible>
        {loading ? (
          <table style={layoutStyles.table} className="aa-table"><tbody><SkeletonRows rows={2} columns={4} /></tbody></table>
        ) : logs.length === 0 ? (
          <EmptyState text="No households have been deleted yet." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead>
              <tr>
                <Th>FULL NAME</Th>
                <Th>EMAIL</Th>
                <Th>FLAT NO.</Th>
                <Th>DELETED ON</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <AnimatedRow key={l.id} index={i}>
                  <Td>{l.fullName}</Td>
                  <Td>{l.email}</Td>
                  <Td>{l.flatNumber}</Td>
                  <Td>{new Date(l.deletedAt).toLocaleString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function AdminSupportSection() {
  const [view, setView] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async (filter = statusFilter) => {
    setLoading(true);
    try {
      const res = await api.get(`/apartment-admin/support${filter !== "ALL" ? `?status=${filter}` : ""}`);
      setTickets(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  if (view === "detail" && selectedTicketId) {
    return (
      <AdminTicketDetailView
        ticketId={selectedTicketId}
        onBack={() => { setView("list"); fetchTickets(); }}
      />
    );
  }

  if (view === "create") {
    return (
      <NewAdminTicketForm
        onDone={() => { setView("list"); fetchTickets(); }}
        onCancel={() => setView("list")}
      />
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case "RESOLVED": case "CLOSED": return { bg: theme.colors.successLight, fg: theme.colors.success };
      case "ESCALATED": return { bg: theme.colors.dangerLight, fg: theme.colors.danger };
      case "IN_PROGRESS": case "WAITING_FOR_USER": return { bg: theme.colors.warningLight, fg: theme.colors.warning };
      default: return { bg: theme.colors.primaryLight, fg: theme.colors.primary };
    }
  };

  const STATUS_OPTIONS = ["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "ESCALATED", "WAITING_FOR_USER", "RESOLVED", "CLOSED"];

  return (
    <>
      <SectionTitle text="Support" />

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setView("create")} style={layoutStyles.btnPrimary} className="aa-btn-primary">
          + New Ticket to Super Admin
        </button>
      </div>

      <Panel title="Filter by Status">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: `1px solid ${statusFilter === s ? theme.colors.primary : theme.colors.border}`,
                background: statusFilter === s ? theme.colors.primaryLight : theme.colors.surface,
                color: statusFilter === s ? theme.colors.primary : theme.colors.textMuted,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Tickets" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : tickets.length === 0 ? (
          <EmptyState text="No tickets found." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Ticket No.</Th><Th>Raised By</Th><Th>Flat</Th><Th>Category</Th><Th>Title</Th><Th>Priority</Th><Th>Status</Th><Th>Created</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {tickets.map((t, i) => {
                const colors = statusColor(t.status);
                return (
                  <AnimatedRow key={t.id} index={i}>
                    <Td>{t.ticketNumber}</Td>
                    <Td>{t.householdName || (t.raisedByAdminName ? `${t.raisedByAdminName} (Admin)` : "—")}</Td>
                    <Td>{t.flatNumber || "—"}</Td>
                    <Td>{t.category}</Td>
                    <Td>{t.title}</Td>
                    <Td><PriorityBadge priority={t.priority} /></Td>
                    <Td>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: colors.bg, color: colors.fg }}>
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </Td>
                    <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <button onClick={() => { setSelectedTicketId(t.id); setView("detail"); }} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Open</button>
                    </Td>
                  </AnimatedRow>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return <span>—</span>;
  const cls = priority === "HIGH" ? "aa-priority-high" : priority === "LOW" ? "aa-priority-low" : "aa-priority-medium";
  return <span className={`aa-priority-badge ${cls}`}>{priority}</span>;
}

const SUPPORT_CATEGORY_OPTIONS = ["BILLING", "WATER_METER", "WATER_LEAKAGE", "COMPLAINT", "TECHNICAL_ISSUE", "OTHER"];

function NewAdminTicketForm({ onDone, onCancel }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [priority, setPriority] = useState("MEDIUM");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !description.trim() || !priority) {
      setError("Title, description, and priority are required.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("priority", priority);
      files.forEach((f) => formData.append("attachments", f));

      await api.post("/apartment-admin/support/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Ticket sent to Super Admin.");
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aa-modal-overlay" onClick={onCancel}>
      <div className="aa-modal-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ ...layoutStyles.sectionTitle, fontSize: 17 }} className="aa-heading">New Ticket to Super Admin</h2>
          <button type="button" onClick={onCancel} className="aa-icon-btn" aria-label="Close" data-tooltip="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Ticket Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={layoutStyles.input} className="aa-input" required />
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...layoutStyles.input, minHeight: 100, fontFamily: "inherit" }} className="aa-input" required
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="aa-field-highlight" style={{ flex: 1 }}>
              <label style={layoutStyles.label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={layoutStyles.input} className="aa-input">
                {SUPPORT_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div className="aa-field-highlight" style={{ flex: 1 }}>
              <label style={layoutStyles.label}>Priority <span style={{ color: theme.colors.danger }}>*</span></label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={layoutStyles.input} className="aa-input" required>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="aa-field-highlight">
            <label style={layoutStyles.label}>Attachment (optional)</label>
            <label className="aa-file-drop" htmlFor="admin-ticket-attachment">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.64 18.36a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span>Click to attach a file, or drag it here</span>
              <span className="aa-file-drop-hint">PDF, JPG, PNG, DOC, DOCX</span>
              <input
                id="admin-ticket-attachment"
                type="file"
                accept={ACCEPTED}
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            {files.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {files.map((f, i) => (
                  <div key={i} className="aa-file-chip">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="aa-file-chip-name">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="aa-file-chip-remove" aria-label={`Remove ${f.name}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ color: theme.colors.danger, fontSize: 12.5, marginTop: 4, marginBottom: 4, fontWeight: 600 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={submitting} style={layoutStyles.btnPrimary} className="aa-btn-primary">
              {submitting ? "Sending..." : "Send to Super Admin"}
            </button>
            <button type="button" onClick={onCancel} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminTicketDetailView({ ticketId, onBack }) {
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/apartment-admin/support/${ticketId}`);
      setTicket(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await api.put(`/apartment-admin/support/${ticketId}/accept`);
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept ticket.");
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (status) => {
    const confirmed = window.confirm(`Mark this ticket as ${status.replace(/_/g, " ")}?`);
    if (!confirmed) return;
    setProcessing(true);
    try {
      await api.put(`/apartment-admin/support/${ticketId}/status`, { status });
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setProcessing(false);
    }
  };

  const handleEscalate = async () => {
    const confirmed = window.confirm("Escalate this ticket to Super Admin? This forwards the full conversation history.");
    if (!confirmed) return;
    setProcessing(true);
    try {
      await api.put(`/apartment-admin/support/${ticketId}/escalate`);
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to escalate ticket.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/apartment-admin/support/${ticketId}/messages`, { message: newMessage, isInternalNote: isInternal });
      setNewMessage("");
      setIsInternal(false);
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Loading..." /></>;
  if (!ticket) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Ticket not found." /></>;

  const isClosed = ["RESOLVED", "CLOSED"].includes(ticket.status);

  return (
    <>
      <SectionTitle text={ticket.ticketNumber} />
      <button onClick={onBack} style={{ ...layoutStyles.btnSecondary, marginBottom: 16 }} className="aa-btn-secondary">← Back to Tickets</button>

      <Panel title="Ticket Info">
        <div style={layoutStyles.statGrid}>
          <ProfileField label="Raised By" value={ticket.householdName || (ticket.raisedByAdminName ? `${ticket.raisedByAdminName} (Apartment Admin)` : "—")} />
          <ProfileField label="Flat" value={ticket.flatNumber || "—"} />
          <ProfileField label="Category" value={ticket.category} />
          <ProfileField label="Priority" value={ticket.priority} />
          <ProfileField label="Status" value={ticket.status.replace(/_/g, " ")} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textFaint, textTransform: "uppercase", marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 13.5, color: theme.colors.text, whiteSpace: "pre-line" }}>{ticket.description}</div>
        </div>
        {ticket.ticketAttachments?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textFaint, textTransform: "uppercase", marginBottom: 6 }}>Attachments</div>
            {ticket.ticketAttachments.map((a) => (
              <div key={a.id}>
                <a href={`http://localhost:8080${a.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: theme.colors.primary, fontSize: 13 }}>
                  📎 {a.fileName}
                </a>
              </div>
            ))}
          </div>
        )}

       <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          {!ticket.raisedByAdminName && ticket.status === "PENDING" && (
            <button onClick={handleAccept} disabled={processing} style={layoutStyles.btnPrimary} className="aa-btn-primary">Accept Ticket</button>
          )}
          {!ticket.raisedByAdminName && !isClosed && ticket.status !== "PENDING" && (
            <>
              <button onClick={() => handleStatusChange("IN_PROGRESS")} disabled={processing} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Mark In Progress</button>
              <button onClick={() => handleStatusChange("RESOLVED")} disabled={processing} style={layoutStyles.btnSuccess} className="aa-btn-success">Mark Resolved</button>
              <button onClick={() => handleStatusChange("CLOSED")} disabled={processing} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Close Ticket</button>
              {ticket.status !== "ESCALATED" && (
                <button onClick={handleEscalate} disabled={processing} style={layoutStyles.btnDanger} className="aa-btn-danger">Escalate to Super Admin</button>
              )}
            </>
          )}
          {ticket.raisedByAdminName && (
            <div style={{ fontSize: 12.5, color: theme.colors.textFaint, fontStyle: "italic" }}>
              This ticket was sent to the Super Admin. Only the Super Admin can update its status.
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Conversation">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {ticket.messages.length === 0 ? (
            <EmptyState text="No messages yet." />
          ) : (
            ticket.messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.senderRole === "HOUSEHOLD" ? "flex-start" : "flex-end",
                maxWidth: "75%",
                background: m.isInternalNote ? theme.colors.warningLight
                  : m.senderRole === "HOUSEHOLD" ? theme.colors.bg : theme.colors.primaryLight,
                borderRadius: 10, padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.textFaint, marginBottom: 4 }}>
                  {m.senderName} · {m.senderRole.replace(/_/g, " ")}
                  {m.isInternalNote && " · 🔒 Internal Note"}
                </div>
                <div style={{ fontSize: 13, color: theme.colors.text, whiteSpace: "pre-line" }}>{m.message}</div>
                <div style={{ fontSize: 10, color: theme.colors.textFaint, marginTop: 4 }}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {!isClosed && (
          <form onSubmit={handleSendMessage}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ ...layoutStyles.input, flex: 1 }} className="aa-input"
                placeholder="Type a reply to the household..."
              />
              <button type="submit" disabled={sending} style={layoutStyles.btnPrimary} className="aa-btn-primary">
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: theme.colors.textMuted, cursor: "pointer" }}>
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
              Internal note (not visible to household)
            </label>
          </form>
        )}
      </Panel>
    </>
  );
}

function AdminAnnouncementsSection() {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/announcements");
      setAnnouncements(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.delete(`/apartment-admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    }
  };

  const handleArchiveExpired = async () => {
    try {
      const res = await api.post("/apartment-admin/announcements/archive-expired");
      toast.success(res.data.message);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to archive.");
    }
  };

  if (view === "create" || view === "edit") {
    return (
      <AnnouncementFormView
        mode={view}
        announcementId={editingId}
        announcements={announcements}
        onDone={() => { setView("list"); setEditingId(null); fetchAnnouncements(); }}
      />
    );
  }

  const priorityColor = (p) => {
    switch (p) {
      case "URGENT": return { bg: theme.colors.dangerLight, fg: theme.colors.danger };
      case "HIGH": return { bg: theme.colors.warningLight, fg: theme.colors.warning };
      default: return { bg: theme.colors.primaryLight, fg: theme.colors.primary };
    }
  };

  const filtered = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SectionTitle text="Announcements" />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setView("create")} style={layoutStyles.btnPrimary} className="aa-btn-primary">+ New Announcement</button>
        <button onClick={handleArchiveExpired} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Archive Expired</button>
      </div>

      <Panel title="Search & Filter">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..." style={{ ...layoutStyles.input, maxWidth: 260 }} className="aa-input"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...layoutStyles.input, maxWidth: 200 }} className="aa-input">
            <option value="ALL">All Categories</option>
            <option value="WATER_SUPPLY">Water Supply</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="BILLING">Billing</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </Panel>

      <Panel title="All Announcements" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No announcements found." />
        ) : (
          <table style={layoutStyles.table} className="aa-table">
            <thead><tr><Th>Title</Th><Th>Category</Th><Th>Priority</Th><Th>Publish</Th><Th>Expiry</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {filtered.map((a, i) => {
                const colors = priorityColor(a.priority);
                return (
                  <AnimatedRow key={a.id} index={i}>
                    <Td>{a.title}</Td>
                    <Td>{a.category.replace(/_/g, " ")}</Td>
                    <Td>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: colors.bg, color: colors.fg }}>
                        {a.priority}
                      </span>
                    </Td>
                    <Td>{a.publishDate}</Td>
                    <Td>{a.expiryDate || "—"}</Td>
                    <Td>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: a.isActive ? theme.colors.successLight : theme.colors.bg, color: a.isActive ? theme.colors.success : theme.colors.textMuted }}>
                        {a.isExpired ? "EXPIRED" : a.isActive ? "ACTIVE" : "ARCHIVED"}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditingId(a.id); setView("edit"); }} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Edit</button>
                        <button onClick={() => handleDelete(a.id, a.title)} style={layoutStyles.btnDanger} className="aa-btn-danger">Delete</button>
                      </div>
                    </Td>
                  </AnimatedRow>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function AnnouncementFormView({ mode, announcementId, announcements, onDone }) {
  const existing = mode === "edit" ? announcements.find((a) => a.id === announcementId) : null;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [category, setCategory] = useState(existing?.category || "GENERAL");
  const [priority, setPriority] = useState(existing?.priority || "MEDIUM");
  const [publishDate, setPublishDate] = useState(existing?.publishDate || new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !description) { setError("Title and description are required."); return; }
    setSubmitting(true);
    try {
      const payload = { title, description, category, priority, publishDate, expiryDate: expiryDate || null };
      if (mode === "create") {
        await api.post("/apartment-admin/announcements", payload);
      } else {
        await api.put(`/apartment-admin/announcements/${announcementId}`, payload);
      }
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionTitle text={mode === "create" ? "New Announcement" : "Edit Announcement"} />
      <Panel title="Announcement Details">
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <label style={layoutStyles.label}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={layoutStyles.input} className="aa-input" />

          <label style={layoutStyles.label}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...layoutStyles.input, minHeight: 100, fontFamily: "inherit" }} className="aa-input" />

          <label style={layoutStyles.label}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={layoutStyles.input} className="aa-input">
            <option value="WATER_SUPPLY">Water Supply</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="BILLING">Billing</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="GENERAL">General</option>
          </select>

          <label style={layoutStyles.label}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={layoutStyles.input} className="aa-input">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <label style={layoutStyles.label}>Publish Date</label>
          <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} style={layoutStyles.input} className="aa-input" />

          <label style={layoutStyles.label}>Expiry Date (optional)</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={layoutStyles.input} className="aa-input" />

          {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="submit" disabled={submitting} style={layoutStyles.btnPrimary} className="aa-btn-primary">
              {submitting ? "Saving..." : mode === "create" ? "Publish" : "Save Changes"}
            </button>
            <button type="button" onClick={onDone} style={layoutStyles.btnSecondary} className="aa-btn-secondary">Cancel</button>
          </div>
        </form>
      </Panel>
    </>
  );
}

function ReportsSection() {
  const [activeReport, setActiveReport] = useState("residentUsage");
  const REPORT_TABS = [
    { key: "residentUsage", label: "Resident Usage Comparison" },
    { key: "billingSummary", label: "Billing Summary" },
    { key: "communityAnalytics", label: "Community Analytics" },
  ];

  return (
    <>
      <SectionTitle text="Reports" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            style={activeReport === tab.key ? layoutStyles.btnPrimary : layoutStyles.btnSecondary}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeReport === "residentUsage" && (
        <Panel title="Resident-Wise Water Usage Comparison Report"><ResidentUsageReport /></Panel>
      )}
      {activeReport === "billingSummary" && (
        <Panel title="Billing Summary Report"><BillingSummaryReport /></Panel>
      )}
      {activeReport === "communityAnalytics" && (
        <Panel title="Community Analytics Report"><CommunityAnalyticsReport /></Panel>
      )}
    </>
  );
}

function ProfileSection() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [submittingPw, setSubmittingPw] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/profile");
      setProfile(res.data.data);
      setFullName(res.data.data.fullName);
      setEmail(res.data.data.email);
      setPhoneNumber(res.data.data.phoneNumber);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/apartment-admin/profile", { fullName, email, phoneNumber });
      setProfile(res.data.data);
      localStorage.setItem("fullName", res.data.data.fullName);
      toast.success(res.data.message);
      setEditMode(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update profile."); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (newPassword !== confirmNewPassword) { setPwError("New password and confirm password do not match."); return; }
    setSubmittingPw(true);
    try {
      const res = await api.put("/apartment-admin/profile/change-password", { currentPassword, newPassword });
      setPwSuccess(res.data.message);
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setShowChangePassword(false);
    } catch (err) { setPwError(err.response?.data?.message || "Failed to change password."); }
    finally { setSubmittingPw(false); }
  };

  return (
    <>
      <SectionTitle text="My Profile" />

      <Panel title="Account Details">
        {loading ? (
          <div style={layoutStyles.statGrid}>{[0,1,2,3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} className="aa-stat-card" />)}</div>
        ) : !profile ? (
          <EmptyState text="Unable to load profile." />
        ) : !editMode ? (
          <>
            <div className="aa-profile-avatar">{getInitials(profile.fullName)}</div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text }} className="aa-heading">{profile.fullName}</div>
              <div style={{ fontSize: 12.5, color: theme.colors.textMuted, marginTop: 2 }}>Apartment Admin · {profile.apartmentName}</div>
            </div>
            <div style={layoutStyles.statGrid}>
              <AnimatedCard index={0}><ProfileField label="FULL NAME" value={profile.fullName} /></AnimatedCard>
              <AnimatedCard index={1}><ProfileField label="EMAIL" value={profile.email} /></AnimatedCard>
              <AnimatedCard index={2}><ProfileField label="PHONE" value={profile.phoneNumber} /></AnimatedCard>
              <AnimatedCard index={3}><ProfileField label="APARTMENT NAME" value={profile.apartmentName} /></AnimatedCard>
            </div>
            <div style={{ ...layoutStyles.statGrid, marginTop: 16 }}>
              <AnimatedCard index={4}><ProfileField label="ADDRESS" value={profile.apartmentAddress} /></AnimatedCard>
              <AnimatedCard index={5}><ProfileField label="CITY" value={profile.city} /></AnimatedCard>
              <AnimatedCard index={6}><ProfileField label="STATE" value={profile.state} /></AnimatedCard>
              <AnimatedCard index={7}><ProfileField label="PIN CODE" value={profile.pinCode} /></AnimatedCard>
            </div>
            <button onClick={() => setEditMode(true)} style={{ ...layoutStyles.btnPrimary, marginTop: 16 }} className="aa-btn-primary">
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ maxWidth: 400 }}>
            <label style={layoutStyles.label}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={layoutStyles.input} className="aa-input" required />

            <label style={layoutStyles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={layoutStyles.input} className="aa-input" required />

            <label style={layoutStyles.label}>Phone Number</label>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={layoutStyles.input} className="aa-input" required />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={layoutStyles.btnPrimary} className="aa-btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditMode(false)} style={layoutStyles.btnSecondary} className="aa-btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </Panel>

      <Panel title="Security">
        {!showChangePassword ? (
          <button onClick={() => setShowChangePassword(true)} style={layoutStyles.btnPrimary} className="aa-btn-primary">
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} style={{ maxWidth: 360 }}>
            <label style={layoutStyles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={layoutStyles.input} className="aa-input"
              required
            />

            <label style={layoutStyles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={layoutStyles.input} className="aa-input"
              required
            />

            <label style={layoutStyles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={layoutStyles.input} className="aa-input"
              required
            />

            {pwError && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{pwError}</div>}
            {pwSuccess && <div style={{ color: theme.colors.success, fontSize: 12, marginTop: 10 }}>{pwSuccess}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="submit" disabled={submittingPw} style={layoutStyles.btnPrimary} className="aa-btn-primary">
                {submittingPw ? "Updating..." : "Update Password"}
              </button>
              <button type="button" onClick={() => setShowChangePassword(false)} style={layoutStyles.btnSecondary} className="aa-btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </Panel>
    </>
  );
}

function ProfileField({ label, value, highlight }) {
  return (
    <div style={layoutStyles.statCard} className={`aa-stat-card${highlight ? ` ${STAT_COLOR_CLASS[highlight]}` : ""}`}>
      <div style={layoutStyles.statLabel}>{label}</div>
      <div style={{ color: theme.colors.text, fontSize: 14, fontWeight: 700, marginTop: 4, wordBreak: "break-word", overflowWrap: "break-word" }}>{value}</div>
    </div>
  );
}

function PlaceholderSection({ title }) {
  return (
    <>
      <SectionTitle text={title} />
      <Panel title={title}>
        <EmptyState text={`${title} module coming soon.`} />
      </Panel>
    </>
  );
}

function SectionTitle({ text }) {
  return (
    <div style={layoutStyles.sectionTitleWrap}>
      <h1 style={layoutStyles.sectionTitle} className="aa-heading">{text}</h1>
    </div>
  );
}

const STAT_COLOR_CLASS = {
  purple: "aa-stat-purple",
  blue: "aa-stat-blue",
  amber: "aa-stat-amber",
  green: "aa-stat-green",
};

function StatCard({ label, value, prefix = "", suffix = "", decimals = 0, color, icon }) {
  const isNumeric = typeof value === "number";
  const colorClass = color ? STAT_COLOR_CLASS[color] : "";
  return (
    <div style={layoutStyles.statCard} className={`aa-stat-card ${colorClass}`}>
      {icon && <div className="aa-stat-icon">{icon}</div>}
      <div style={layoutStyles.statLabel} className="aa-stat-label">{label}</div>
      <div style={layoutStyles.statValue} className="aa-heading aa-stat-value">
        {isNumeric ? <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} /> : value}
      </div>
    </div>
  );
}

function Panel({ title, children, collapsible = false, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div style={layoutStyles.panel} className="anim-card aa-panel">
      <div style={layoutStyles.panelHeader} className="aa-panel-header">
        <span className="aa-panel-header-title">{title}</span>
        {collapsible && (
          <button
            type="button"
            aria-label={collapsed ? "Expand section" : "Collapse section"}
            aria-expanded={!collapsed}
            className={`aa-collapse-toggle${collapsed ? " is-collapsed" : ""}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
      {collapsible ? (
        <div className={`aa-panel-body-collapsible${collapsed ? " is-collapsed" : ""}`}>
          <div style={layoutStyles.panelBody}>{children}</div>
        </div>
      ) : (
        <div style={layoutStyles.panelBody}>{children}</div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={layoutStyles.emptyState}>{text}</div>;
}

function Th({ children }) {
  return <th style={layoutStyles.th}>{children}</th>;
}
function Td({ children }) {
  return <td style={layoutStyles.td}>{children}</td>;
}

function Badge({ status }) {
  return (
    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, ...StatusBadge({ status }) }}>
      {status}
    </span>
  );
}

function HydroLogo({ colorMode = "light" }) {
  const color = colorMode === "light" ? theme.colors.primary : "#ffffff";
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="2" />
      <path d="M24 12 C24 12 14 25 14 32 A10 10 0 0 0 34 32 C34 25 24 12 24 12Z" fill={color} />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

const styles = {
  calendarBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const invoiceStyles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
  },
  card: {
    background: "#ffffff", borderRadius: 16, width: 560, maxWidth: "100%",
    maxHeight: "90vh", overflowY: "auto", padding: 32,
    boxShadow: "0 24px 64px rgba(15,23,42,0.3)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  divider: { height: 1, background: theme.colors.border, margin: "24px 0" },
  metaRow: { display: "flex", justifyContent: "space-between", marginBottom: 24 },
  metaLabel: { fontSize: 10.5, color: theme.colors.textFaint, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  metaValue: { fontSize: 14, color: theme.colors.text, fontWeight: 700 },
  metaSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "10px 8px", fontSize: 10.5, fontWeight: 700,
    color: theme.colors.textFaint, textTransform: "uppercase", borderBottom: `2px solid ${theme.colors.border}`,
  },
  td: { padding: "14px 8px", color: theme.colors.text, borderBottom: `1px solid ${theme.colors.bg}` },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 18, paddingTop: 18, borderTop: `2px solid ${theme.colors.border}`,
  },
  totalLabel: { fontSize: 14, fontWeight: 700, color: theme.colors.text },
  totalValue: { fontSize: 24, fontWeight: 800, color: theme.colors.primary },
  footer: { fontSize: 11, color: theme.colors.textFaint, marginTop: 24, lineHeight: 1.5 },
  actions: { display: "flex", gap: 10, marginTop: 24 },
};