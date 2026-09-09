import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { theme, layoutStyles, StatusBadge, HEADER_HEIGHT } from "../../theme";
import { CountUp, SkeletonStatCard, AnimatedCard, AnimatedRow } from "../../components/Animated";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import AiAssistant from "../../components/AiAssistant"; 
import DailyUsageChart from "../../components/charts/DailyUsageChart";
import MonthlyUsageChart from "../../components/charts/MonthlyUsageChart";
import UsageComparisonCard from "../../components/charts/UsageComparisonCard";
import GlowTrendChart from "../../components/charts/GlowTrendChart";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageSelector from "../../components/LanguageSelector";
import "./householdDashboard.css";
import { useToast } from "../../context/ToastContext";


const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "myUsage", label: "My Usage", icon: "◇" },
  { key: "usageHistory", label: "Usage History", icon: "▤" },
  { key: "myBills", label: "My Bills", icon: "▧" },
  { key: "notifications", label: "Notifications", icon: "⚠" },
  { key: "waterTips", label: "Water Tips", icon: "☺" },
  { key: "support", label: "Support", icon: "🎫" },
  { key: "announcements", label: "Announcements", icon: "📢" },
  { key: "profile", label: "Profile", icon: "☺" },
  { key: "logout", label: "Logout", icon: "⏻" },
];
export default function HouseholdDashboard() {
  const fullName = localStorage.getItem("fullName") || "Resident";
  const [active, setActive] = useState("dashboard");

  const [profile, setProfile] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [latestBill, setLatestBill] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/household-user/profile");
      setProfile(res.data.data);
    } catch (err) { console.error(err); }
  };
  const fetchLatestReading = async () => {
    try {
      const res = await api.get("/household-user/water-usage/latest-reading");
      setLatestReading(res.data.data);
    } catch (err) { console.error(err); }
  };
  const fetchLatestBill = async () => {
    try {
      const res = await api.get("/household-user/water-usage/latest-bill");
      setLatestBill(res.data.data);
    } catch (err) { console.error(err); }
  };
  const fetchBillHistory = async () => {
    try {
      const res = await api.get("/household-user/water-usage/bills");
      setBillHistory(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchLatestReading(), fetchLatestBill(), fetchBillHistory()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleNavClick = (key) => {
    if (key === "logout") {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    setActive(key);
    if (["dashboard", "myUsage", "usageHistory", "myBills"].includes(key)) {
      fetchLatestReading();
      fetchLatestBill();
      fetchBillHistory();
    }
  };

  return (
    <div style={layoutStyles.page} className="hd-shell">
      <div className="hd-bg-blob hd-blob-1" />
      <div className="hd-bg-blob hd-blob-2" />
      <div className="hd-bg-blob hd-blob-3" />
      <div className="hd-content">
      <div style={styles.topBar} className="anim-navbar hd-topbar">
        <div style={styles.logoBlock}>
          <div className="hd-logo-badge"><HydroLogo colorMode="dark" /></div>
          <div>
            <div style={styles.brand} className="hd-heading hd-topbar-text">HydroHome</div>
            <div style={styles.tagline} className="hd-topbar-text-muted">RESIDENT PORTAL</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeToggle />
          <LanguageSelector variant="light" />
          <NotificationBell
            onClick={() => handleNavClick("notifications")}
            onLiveUpdate={() => {
              fetchLatestReading();
              fetchLatestBill();
              fetchBillHistory();
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
            <div style={styles.userBlock}>
              <span style={styles.statusDot} />
              <span style={styles.userText} className="hd-topbar-text">Resident · {fullName}</span>
            </div>
            {profile && (
              <div style={styles.apartmentInfo} className="hd-topbar-text-muted">
                {profile.apartmentName} · Admin: {profile.apartmentAdminName}
              </div>
            )}
          </div>
          <div style={layoutStyles.headerAvatar} className="hd-avatar">{getInitials(fullName)}</div>
        </div>
      </div>

      <div style={layoutStyles.body}>
        <div style={layoutStyles.sidebar} className="anim-sidebar hd-sidebar">
          <div style={layoutStyles.sidebarHeader} className="hd-eyebrow">Resident Menu</div>
          <div style={layoutStyles.sidebarDivider} />
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              style={{ ...layoutStyles.navItem, ...(active === item.key ? layoutStyles.navItemActive : {}) }}
              className={active === item.key ? "hd-nav-active" : "hd-nav-item"}
            >
              <span style={layoutStyles.navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div style={layoutStyles.main} key={active} className="anim-page">
          {active === "dashboard" && (
            <>
      <UrgentAnnouncementBanner />
      <DashboardHome latestReading={latestReading} latestBill={latestBill} billHistory={billHistory} loading={loading} />
            </>
          )}
          {active === "myUsage" && <MyUsageSection latestReading={latestReading} loading={loading} />}
          {active === "usageHistory" && <UsageHistorySection billHistory={billHistory} loading={loading} />}
          {active === "myBills" && (
            <MyBillsSection
              billHistory={billHistory}
              latestBill={latestBill}
              loading={loading}
              profile={profile}
              onRefresh={() => {
                fetchLatestBill();
                fetchBillHistory();
              }}
            />
          )}
          {active === "notifications" && <NotificationsSection />}
           {active === "support" && <SupportSection />}
          {active === "profile" && <ProfileSection />}
          {active === "announcements" && <AnnouncementsPage />}
        {active === "waterTips" && <WaterTipsSection />}

        </div>
      </div>

      <AiAssistant role="HOUSEHOLD_USER" onNavigate={(key) => setActive(key)} />
      </div>
    </div>
  );
}


function NotificationBell({ onClick, onLiveUpdate }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await api.get("/household-user/notifications/unread-count");
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUnread();

    const token = localStorage.getItem("token");
    const householdUserId = localStorage.getItem("userId");

    const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${householdUserId}`, () => {
          fetchUnread();
          if (onLiveUpdate) onLiveUpdate();
        });
      },
    });
    client.activate();

    return () => client.deactivate();
  }, []);

  return (
    <div onClick={onClick} className="hd-topbar-text hd-bell-btn" style={{ position: "relative", cursor: "pointer" }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff",
          borderRadius: "50%", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
        }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}


function DashboardHome({ latestReading, latestBill, billHistory, loading }) {
  return (
    <>
      <SectionTitle text="My Dashboard" />

      <div style={layoutStyles.statGrid}>
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} className="hd-stat-card" />)
        ) : (
          <>
            <AnimatedCard index={0}>
              <StatCard label="Today's Usage" value={latestReading ? latestReading.usageUnits : "—"} suffix=" L" color="blue" icon="💧" />
            </AnimatedCard>
            <AnimatedCard index={1}>
              <StatCard label="Current Bill" value={latestBill ? latestBill.amount : "—"} prefix="₹" decimals={2} color="purple" icon="🧾" />
            </AnimatedCard>
            <AnimatedCard index={2}>
              <div style={layoutStyles.statCard} className="hd-stat-card hd-stat-amber">
                <div className="hd-stat-icon">📋</div>
                <div style={layoutStyles.statLabel} className="hd-stat-label">Bill Status</div>
                <div style={{ marginTop: 6 }}>
                  {latestBill ? <Badge status={latestBill.status} /> : <span style={{ color: theme.colors.textFaint }}>—</span>}
                </div>
              </div>
            </AnimatedCard>
            <AnimatedCard index={3}>
              <StatCard label="Total Bills" value={billHistory.length} color="green" icon="📊" />
            </AnimatedCard>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, marginBottom: 18 }}>
        <Panel title="Water Usage Trend">
          {loading ? (
            <EmptyState text="Loading..." />
          ) : billHistory.length === 0 ? (
            <EmptyState text="No usage data yet. Your Apartment Admin hasn't recorded a reading for you." />
          ) : (
            <UsageBarChart data={[...billHistory].reverse()} />
          )}
        </Panel>

        <Panel title="Bills Overview">
          {loading ? (
            <EmptyState text="Loading..." />
          ) : billHistory.length === 0 ? (
            <EmptyState text="No bills yet." />
          ) : (
            <StatusDonutChart billHistory={billHistory} />
          )}
        </Panel>
      </div>

      <Panel title="Usage Flow">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : billHistory.length === 0 ? (
          <EmptyState text="No usage data yet." />
        ) : (
          <UsageWaveChart data={[...billHistory].reverse()} />
        )}
      </Panel>

      <Panel title="Recent Bills">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : billHistory.length === 0 ? (
          <EmptyState text="No bills yet." />
        ) : (
          <BillsTable bills={billHistory.slice(0, 5)} />
        )}
      </Panel>
     <AnnouncementWidget />
    </>
  );
}

// Modern bar chart — usage per billing cycle, two-tone bars
function UsageBarChart({ data }) {
  const width = 900;
  const height = 240;
  const padding = 44;
  const barWidth = Math.min(36, (width - padding * 2) / (data.length * 2));

  const values = data.map((d) => d.usageUnits);
  const maxVal = Math.max(...values, 1) * 1.15;

  return (
    <div style={{ overflowX: "auto" }} className="anim-card">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="hhBarActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={theme.colors.primary} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="hhBarPast" x1="0" y1="0" x2="0" y2="1">
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
                fill={i === data.length - 1 ? "url(#hhBarActive)" : "url(#hhBarPast)"}
              />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={theme.colors.text} fontFamily={theme.font}>
                {d.usageUnits}
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

function StatusDonutChart({ billHistory }) {
  const total = billHistory.length || 1;
  const generated = billHistory.filter((b) => b.status === "GENERATED").length;
  const paid = billHistory.filter((b) => b.status === "PAID").length;
  const other = total - generated - paid;

  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const generatedPct = generated / total;
  const paidPct = paid / total;

  const generatedLen = generatedPct * circumference;
  const paidLen = paidPct * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }} className="anim-card">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 6px 16px rgba(var(--shadow-color),0.15))" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.colors.surfaceHover} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={theme.colors.warning} strokeWidth={strokeWidth}
          strokeDasharray={`${generatedLen} ${circumference - generatedLen}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={theme.colors.success} strokeWidth={strokeWidth}
          strokeDasharray={`${paidLen} ${circumference - paidLen}`}
          strokeDashoffset={-generatedLen}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="48%" textAnchor="middle" fontSize="26" fontWeight="800" fill={theme.colors.text} fontFamily={theme.font}>
          {total}
        </text>
        <text x="50%" y="63%" textAnchor="middle" fontSize="11" fill={theme.colors.textFaint} fontFamily={theme.font}>
          Total Bills
        </text>
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

function UsageWaveChart({ data }) {
  const width = 900;
  const height = 220;
  const padding = 40;

  const values = data.map((d) => d.usageUnits);
  const maxVal = Math.max(...values, 1);

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (d.usageUnits / maxVal) * (height - padding * 2);
    return { x, y };
  });

  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midX = (curr.x + next.x) / 2;
      d += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ overflowX: "auto" }} className="anim-card">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: 500 }}>
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={theme.colors.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#waveGradient)" />
        <path d={linePath} fill="none" stroke={theme.colors.accent} strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={theme.colors.surface} stroke={theme.colors.accent} strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

function MyUsageSection({ latestReading, loading }) {
  return (
    <>
      <SectionTitle text="My Usage" />
      <Panel title="Latest Meter Reading">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : !latestReading ? (
          <EmptyState text="No meter reading recorded yet." />
        ) : (
          <div style={layoutStyles.statGrid}>
            <AnimatedCard index={0}><ProfileField label="Previous Reading" value={latestReading.previousReading} /></AnimatedCard>
            <AnimatedCard index={1}><ProfileField label="Current Reading" value={latestReading.currentReading} /></AnimatedCard>
            <AnimatedCard index={2}><ProfileField label="Usage" value={`${latestReading.usageUnits} L`} /></AnimatedCard>
            <AnimatedCard index={3}><ProfileField label="Billing Cycle" value={latestReading.billingCycle} /></AnimatedCard>
            <AnimatedCard index={4}><ProfileField label="Reading Date" value={new Date(latestReading.readingDate).toLocaleDateString()} /></AnimatedCard>
          </div>
        )}
      </Panel>
      <Panel title="Daily Water Usage Trend">
        <DailyUsageChart />
      </Panel>

      <Panel title="Monthly Water Usage Trend">
        <MonthlyUsageChart />
      </Panel>

      <Panel title="Your Usage vs Apartment Average">
        <UsageComparisonCard />
      </Panel>
    </>
  );
}

function UsageHistorySection({ billHistory, loading }) {
  return (
    <>
      <SectionTitle text="Usage History" />
      <Panel title="Usage Trend">
        {loading ? <EmptyState text="Loading..." /> : billHistory.length === 0 ? <EmptyState text="No usage history yet." /> : <UsageBarChart data={[...billHistory].reverse()} />}
      </Panel>
      <Panel title="All Recorded Usage">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : billHistory.length === 0 ? (
          <EmptyState text="No usage history yet." />
        ) : (
          <table style={layoutStyles.table} className="hd-table">
            <thead><tr><Th>Cycle</Th><Th>Usage (L)</Th><Th>Rate/L (₹)</Th><Th>Amount (₹)</Th><Th>Date</Th></tr></thead>
            <tbody>
              {billHistory.map((b, i) => (
                <AnimatedRow key={b.id} index={i}>
                  <Td>{b.billingCycle}</Td><Td>{b.usageUnits}</Td><Td>{b.ratePerUnit}</Td>
                  <Td>{b.amount.toFixed(2)}</Td><Td>{new Date(b.generatedDate).toLocaleDateString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function MyBillsSection({ billHistory, latestBill, loading, profile, onRefresh }) {
  const [selectedBill, setSelectedBill] = useState(null);
  const [payingBill, setPayingBill] = useState(null);

  return (
    <>
      <SectionTitle text="My Bills" />

      {billHistory.some((b) => b.status === "OVERDUE") && (
        <div style={{
          background: theme.colors.dangerLight, border: `1px solid ${theme.colors.danger}`,
          borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: theme.colors.danger, fontWeight: 600,
        }}>
          ⚠ You have {billHistory.filter((b) => b.status === "OVERDUE").length} overdue bill(s). Please pay as soon as possible to avoid additional late fees.
        </div>
      )}

      {latestBill && (
        <Panel title="Latest Bill">
          <div style={layoutStyles.statGrid}>
            <AnimatedCard index={0}><ProfileField label="Bill Number" value={latestBill.billNumber} /></AnimatedCard>
           <AnimatedCard index={1}><ProfileField label="Billing Cycle" value={latestBill.billingCycle} /></AnimatedCard>
            <AnimatedCard index={2}><ProfileField label="Amount" value={`₹${latestBill.amount.toFixed(2)}`} /></AnimatedCard>
            <AnimatedCard index={5}><ProfileField label="Due Date" value={latestBill.dueDate ? new Date(latestBill.dueDate).toLocaleDateString() : "—"} /></AnimatedCard>
            <AnimatedCard index={3}>
              <div style={layoutStyles.statCard}>
                <div style={layoutStyles.statLabel}>Status</div>
                <div style={{ marginTop: 6 }}><Badge status={latestBill.status} /></div>
              </div>
            </AnimatedCard>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setSelectedBill(latestBill)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">View Invoice</button>
            {latestBill.status !== "PAID" && (
              <button onClick={() => setPayingBill(latestBill)} style={layoutStyles.btnPrimary} className="hd-btn-primary">Pay Now</button>
            )}
          </div>
        </Panel>
      )}

      <Panel title="Billing Trend">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : billHistory.length === 0 ? (
          <EmptyState text="No bills yet." />
        ) : (
          <GlowTrendChart
            data={[...billHistory].reverse().map((b) => ({ cycle: b.billingCycle, amount: b.amount }))}
            xKey="cycle" yKey="amount" valuePrefix="₹" unit=" ₹" height={260} highlightCount={3}
            gradientId="householdBillingTrend"
          />
        )}
      </Panel>

      <Panel title="Bill History" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : billHistory.length === 0 ? (
          <EmptyState text="No bills yet." />
        ) : (
          <table style={layoutStyles.table} className="hd-table">
            <thead><tr><Th>Bill No.</Th><Th>Cycle</Th><Th>Usage (L)</Th><Th>Amount (₹)</Th><Th>Status</Th><Th>Generated</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {billHistory.map((b, i) => (
                <AnimatedRow key={b.id} index={i}>
                  <Td>{b.billNumber}</Td><Td>{b.billingCycle}</Td><Td>{b.usageUnits}</Td>
                  <Td>{b.amount.toFixed(2)}</Td><Td><Badge status={b.status} /></Td>
                  <Td>{new Date(b.generatedDate).toLocaleDateString()}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setSelectedBill(b)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">View</button>
                      {b.status !== "PAID" && (
                        <button onClick={() => setPayingBill(b)} style={layoutStyles.btnPrimary} className="hd-btn-primary">Pay</button>
                      )}
                    </div>
                  </Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

       <PaymentHistorySection loading={loading} /> 

      {selectedBill && (
        <InvoiceModal bill={selectedBill} profile={profile} onClose={() => setSelectedBill(null)} />
      )}

      {payingBill && (
        <PayBillModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaid={onRefresh}
        />
      )}
    </>
  );
}

function SupportSection() {
  const [view, setView] = useState("list"); // list, create, detail
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/household-user/support");
      setTickets(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  if (view === "create") {
    return <CreateTicketView onBack={() => { setView("list"); fetchTickets(); }} />;
  }

  if (view === "detail" && selectedTicketId) {
    return <TicketDetailView ticketId={selectedTicketId} onBack={() => { setView("list"); fetchTickets(); }} />;
  }

  const statusColor = (status) => {
    switch (status) {
      case "RESOLVED": case "CLOSED": return { bg: theme.colors.successLight, fg: theme.colors.success };
      case "ESCALATED": return { bg: theme.colors.dangerLight, fg: theme.colors.danger };
      case "IN_PROGRESS": case "WAITING_FOR_USER": return { bg: theme.colors.warningLight, fg: theme.colors.warning };
      default: return { bg: theme.colors.primaryLight, fg: theme.colors.primary };
    }
  };

  return (
    <>
      <SectionTitle text="Support" />
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setView("create")} style={layoutStyles.btnPrimary} className="hd-btn-primary">+ New Support Ticket</button>
      </div>
      <Panel title="My Tickets">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : tickets.length === 0 ? (
          <EmptyState text="No support tickets yet." />
        ) : (
          <table style={layoutStyles.table} className="hd-table">
            <thead><tr><Th>Ticket No.</Th><Th>Category</Th><Th>Title</Th><Th>Priority</Th><Th>Status</Th><Th>Created</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {tickets.map((t, i) => {
                const colors = statusColor(t.status);
                return (
                  <AnimatedRow key={t.id} index={i}>
                    <Td>{t.ticketNumber}</Td>
                    <Td>{t.category}</Td>
                    <Td>{t.title}</Td>
                    <Td><HdPriorityBadge priority={t.priority} /></Td>
                    <Td>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10.5, fontWeight: 700, background: colors.bg, color: colors.fg }}>
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </Td>
                    <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <button onClick={() => { setSelectedTicketId(t.id); setView("detail"); }} style={layoutStyles.btnSecondary} className="hd-btn-secondary">View</button>
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

function CreateTicketView({ onBack }) {
  const toast = useToast();
  const [category, setCategory] = useState("BILLING");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      files.forEach((f) => formData.append("attachments", f));

      const res = await api.post("/household-user/support", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hd-modal-overlay" onClick={onBack}>
      <div className="hd-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ ...layoutStyles.sectionTitle, fontSize: 17 }} className="hd-heading">New Support Ticket</h2>
          <button type="button" onClick={onBack} className="hd-icon-btn" aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="hd-field-highlight">
            <label style={layoutStyles.label}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={layoutStyles.input} className="hd-input" placeholder="Brief summary of the issue" required />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div className="hd-field-highlight" style={{ flex: 1 }}>
              <label style={layoutStyles.label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={layoutStyles.input} className="hd-input">
                <option value="BILLING">Billing</option>
                <option value="WATER_METER">Water Meter</option>
                <option value="WATER_LEAKAGE">Water Leakage</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="TECHNICAL_ISSUE">Technical Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="hd-field-highlight" style={{ flex: 1 }}>
              <label style={layoutStyles.label}>Priority <span style={{ color: theme.colors.danger }}>*</span></label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={layoutStyles.input} className="hd-input" required>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="hd-field-highlight">
            <label style={layoutStyles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...layoutStyles.input, minHeight: 100, resize: "vertical", fontFamily: "inherit" }} className="hd-input"
              placeholder="Describe the issue in detail"
              required
            />
          </div>

          <div className="hd-field-highlight">
            <label style={layoutStyles.label}>Attachment (optional)</label>
            <label className="hd-file-drop" htmlFor="hd-ticket-attachment">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.64 18.36a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span>Click to attach a file, or drag it here</span>
              <span className="hd-file-drop-hint">PDF, JPG, PNG, DOC, DOCX</span>
              <input id="hd-ticket-attachment" type="file" accept={ACCEPTED} multiple onChange={handleFileChange} style={{ display: "none" }} />
            </label>
            {files.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {files.map((f, i) => (
                  <div key={i} className="hd-file-chip">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="hd-file-chip-name">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="hd-file-chip-remove" aria-label={`Remove ${f.name}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="submit" disabled={submitting} style={layoutStyles.btnPrimary} className="hd-btn-primary">
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
            <button type="button" onClick={onBack} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailView({ ticketId, onBack }) {
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/household-user/support/${ticketId}`);
      setTicket(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/household-user/support/${ticketId}/messages`, { message: newMessage });
      setNewMessage("");
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Loading..." /></>;
  if (!ticket) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Ticket not found." /></>;

  return (
    <>
      <SectionTitle text={ticket.ticketNumber} />
      <button onClick={onBack} style={{ ...layoutStyles.btnSecondary, marginBottom: 16 }} className="hd-btn-secondary">← Back to Tickets</button>

      <Panel title="Ticket Info">
        <div style={layoutStyles.statGrid}>
          <ProfileField label="Category" value={ticket.category} />
          <ProfileField label="Status" value={ticket.status.replace(/_/g, " ")} />
          <ProfileField label="Priority" value={ticket.priority} />
          <ProfileField label="Assigned Admin" value={ticket.assignedAdminName || "Not yet assigned"} />
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
      </Panel>

      <Panel title="Conversation">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {ticket.messages.length === 0 ? (
            <EmptyState text="No messages yet." />
          ) : (
            ticket.messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.senderRole === "HOUSEHOLD" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                background: m.senderRole === "HOUSEHOLD" ? theme.colors.primaryLight : theme.colors.bg,
                borderRadius: 10, padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.textFaint, marginBottom: 4 }}>
                  {m.senderName} · {m.senderRole.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 13, color: theme.colors.text, whiteSpace: "pre-line" }}>{m.message}</div>
                <div style={{ fontSize: 10, color: theme.colors.textFaint, marginTop: 4 }}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {!["RESOLVED", "CLOSED"].includes(ticket.status) && (
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 10 }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ ...layoutStyles.input, flex: 1 }} className="hd-input"
              placeholder="Type a reply..."
            />
            <button type="submit" disabled={sending} style={layoutStyles.btnPrimary} className="hd-btn-primary">
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </Panel>
    </>
  );
}

function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (pageNum = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`/household-user/notifications?page=${pageNum}&size=10`);
      setNotifications(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
      setPage(pageNum);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(0); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/household-user/notifications/${id}/read`);
      fetchNotifications(page);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/household-user/notifications/read-all");
      fetchNotifications(page);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/household-user/notifications/${id}`);
      fetchNotifications(page);
    } catch (err) { console.error(err); }
  };

  const typeColor = (type) => {
    switch (type) {
      case "SUCCESS": return { bg: theme.colors.successLight, fg: theme.colors.success };
      case "WARNING": return { bg: theme.colors.warningLight, fg: theme.colors.warning };
      case "ERROR": return { bg: theme.colors.dangerLight, fg: theme.colors.danger };
      default: return { bg: theme.colors.primaryLight, fg: theme.colors.primary };
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case "SUCCESS": return "✅";
      case "WARNING": return "⚠️";
      case "ERROR": return "🚨";
      default: return "🔔";
    }
  };

  return (
    <>
      <SectionTitle text="Notifications" />
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleMarkAllRead} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Mark All as Read</button>
      </div>
      <Panel title="All Notifications" collapsible>
        {loading ? (
          <EmptyState text="Loading..." />
        ) : notifications.length === 0 ? (
          <EmptyState text="No notifications yet." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map((n) => {
              const colors = typeColor(n.type);
              return (
                <div
                  key={n.id}
                  className={`hd-notif-card${n.isRead ? "" : " hd-notif-unread"}`}
                  style={{ "--notif-accent": colors.fg, "--notif-tint": colors.bg }}
                >
                  <div className="hd-notif-icon" style={{ background: colors.bg, color: colors.fg }}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="hd-notif-body">
                    <div className="hd-notif-header">
                      <span className="hd-notif-title">{n.title}</span>
                      {!n.isRead && <span className="hd-notif-badge">NEW</span>}
                    </div>
                    <div className="hd-notif-message">{n.message}</div>
                    <div className="hd-notif-footer">
                      <span className="hd-notif-time">🕒 {new Date(n.createdAt).toLocaleString()}</span>
                      <div className="hd-notif-actions">
                        {!n.isRead && (
                          <button onClick={() => handleMarkRead(n.id)} className="hd-notif-action-btn">Mark Read</button>
                        )}
                        <button onClick={() => handleDelete(n.id)} className="hd-notif-action-btn hd-notif-action-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                <button disabled={page === 0} onClick={() => fetchNotifications(page - 1)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Previous</button>
                <span style={{ fontSize: 12.5, color: theme.colors.textMuted, alignSelf: "center" }}>Page {page + 1} of {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => fetchNotifications(page + 1)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Next</button>
              </div>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}

function InvoiceModal({ bill, profile, onClose }) {
  if (!bill) return null;
  const handlePrint = () => window.print();

  return (
    <div className="anim-modal-overlay" style={styles.overlay} onClick={onClose}>
      <div className="anim-modal" style={styles.invoiceCard} onClick={(e) => e.stopPropagation()} id="invoice-print-area">
        <div style={styles.invoiceHeader}>
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

        <div style={styles.invoiceDivider} />

        <div style={styles.invoiceMetaRow}>
          <div>
            <div style={styles.invoiceMetaLabel}>Billed To</div>
            <div style={styles.invoiceMetaValue}>{profile?.fullName || "—"}</div>
            <div style={styles.invoiceMetaSub}>Flat {profile?.flatNumber} · {profile?.apartmentName}</div>
          </div>
         <div style={{ textAlign: "right" }}>
            <div style={styles.invoiceMetaLabel}>Billing Cycle</div>
            <div style={styles.invoiceMetaValue}>{bill.billingCycle}</div>
            <div style={styles.invoiceMetaSub}>Generated {new Date(bill.generatedDate).toLocaleDateString()}</div>
            <div style={styles.invoiceMetaSub}>Due {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"}</div>
          </div>
        </div>

       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: theme.colors.text }}>Total Usage</span>
          <span style={{ fontWeight: 700, color: theme.colors.text }}>{bill.usageUnits?.toFixed(1)} L</span>
        </div>

        <table style={styles.invoiceTable}>
          <thead>
            <tr>
              <th style={styles.invoiceTh}>Description</th>
              <th style={styles.invoiceTh}>Volume</th>
              <th style={styles.invoiceTh}>Rate</th>
              <th style={{ ...styles.invoiceTh, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.tier1Usage != null ? (
              <>
                <tr>
                  <td style={styles.invoiceTd}>
                    Tier 1
                    <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Up to {bill.tier1Usage.toFixed(1)} L</div>
                  </td>
                  <td style={styles.invoiceTd}>{bill.tier1Usage.toFixed(1)} L</td>
                  <td style={styles.invoiceTd}>₹{bill.tier1Rate.toFixed(2)}/L</td>
                  <td style={{ ...styles.invoiceTd, textAlign: "right" }}>₹{bill.tier1Amount.toFixed(2)}</td>
                </tr>
                {bill.tier2Usage > 0 && (
                  <tr>
                    <td style={styles.invoiceTd}>
                      Tier 2
                      <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Beyond threshold</div>
                    </td>
                    <td style={styles.invoiceTd}>{bill.tier2Usage.toFixed(1)} L</td>
                    <td style={styles.invoiceTd}>₹{bill.tier2Rate.toFixed(2)}/L</td>
                    <td style={{ ...styles.invoiceTd, textAlign: "right" }}>₹{bill.tier2Amount.toFixed(2)}</td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td style={styles.invoiceTd}>Water usage charges — {bill.billingCycle}</td>
                <td style={styles.invoiceTd}>{bill.usageUnits}</td>
                <td style={styles.invoiceTd}>{bill.ratePerUnit}</td>
                <td style={{ ...styles.invoiceTd, textAlign: "right" }}>
                  ₹{(bill.amount - (bill.extraChargeAmount || 0) - (bill.lateFeeAmount || 0)).toFixed(2)}
                </td>
              </tr>
            )}

            {bill.extraChargeAmount > 0 && (
              <tr>
                <td style={styles.invoiceTd}>
                  Shared Area Water Allocation
                  <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Reconciled against actual purchase cost</div>
                </td>
                <td style={styles.invoiceTd}>—</td>
                <td style={styles.invoiceTd}>—</td>
                <td style={{ ...styles.invoiceTd, textAlign: "right" }}>₹{bill.extraChargeAmount.toFixed(2)}</td>
              </tr>
            )}

            {bill.lateFeeAmount > 0 && (
              <tr>
                <td style={styles.invoiceTd}>
                  Late Payment Penalty
                  <div style={{ fontSize: 11, color: theme.colors.textFaint }}>Overdue payment charge</div>
                </td>
                <td style={styles.invoiceTd}>—</td>
                <td style={styles.invoiceTd}>—</td>
                <td style={{ ...styles.invoiceTd, textAlign: "right" }}>₹{bill.lateFeeAmount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={styles.invoiceTotalRow}>
          <span style={styles.invoiceTotalLabel}>Total Amount Due</span>
          <span style={styles.invoiceTotalValue}>₹{bill.amount.toFixed(2)}</span>
        </div>

        <div style={{ marginTop: 10 }}>
          <Badge status={bill.status} />
        </div>

        <div style={styles.invoiceFooter}>
          This is a system-generated invoice from HydroHome Water Monitoring & Billing Platform.
        </div>

        <div style={styles.invoiceActions}>
          <button onClick={handlePrint} style={layoutStyles.btnPrimary} className="hd-btn-primary">🖨 Print / Save as PDF</button>
          <button onClick={onClose} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

function BillsTable({ bills }) {
  return (
    <table style={layoutStyles.table} className="hd-table">
      <thead><tr><Th>Bill No.</Th><Th>Cycle</Th><Th>Usage (L)</Th><Th>Amount (₹)</Th><Th>Status</Th><Th>Generated</Th></tr></thead>
      <tbody>
        {bills.map((b, i) => (
          <AnimatedRow key={b.id} index={i}>
            <Td>{b.billNumber}</Td><Td>{b.billingCycle}</Td><Td>{b.usageUnits}</Td>
            <Td>{b.amount.toFixed(2)}</Td><Td><Badge status={b.status} /></Td>
            <Td>{new Date(b.generatedDate).toLocaleDateString()}</Td>
          </AnimatedRow>
        ))}
      </tbody>
    </table>
  );
}
function PayBillModal({ bill, onClose, onPaid }) {
  const toast = useToast();
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleOnlinePayment = async () => {
    setError("");
    setSubmitting(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your connection and try again.");
        setSubmitting(false);
        return;
      }

      const orderRes = await api.post("/household-user/payments/create-order", { billId: bill.id });
      const order = orderRes.data.data;

      const options = {
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "HydroHome",
        description: `Water Bill — ${order.billNumber}`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/household-user/payments/verify", {
              billId: bill.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success(verifyRes.data.message);
            onPaid();
            onClose();
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        theme: { color: theme.colors.primary },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start payment.");
      setSubmitting(false);
    }
  };

  const handleCashPayment = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/household-user/payments/pay", {
        billId: bill.id,
        paymentMethod: "CASH",
      });
      toast.success(res.data.message);
      onPaid();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === "ONLINE") {
      handleOnlinePayment();
    } else {
      handleCashPayment();
    }
  };

  return (
    <div className="anim-modal-overlay" style={styles.overlay} onClick={onClose}>
      <div className="anim-modal" style={styles.payCard} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text, margin: 0 }}>Pay Bill</h2>
        <p style={{ fontSize: 13, color: theme.colors.textMuted, marginTop: 6, marginBottom: 20 }}>
          {bill.billNumber} · {bill.billingCycle}
        </p>

        <div style={styles.payAmountBox}>
          <div style={{ fontSize: 11, color: theme.colors.textFaint, fontWeight: 700, textTransform: "uppercase" }}>Amount to Pay</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.primary, marginTop: 4 }}>₹{bill.amount.toFixed(2)}</div>
        </div>

        <label style={layoutStyles.label}>Select Payment Method</label>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setPaymentMethod("ONLINE")}
            style={paymentMethod === "ONLINE" ? styles.methodBtnActive : styles.methodBtn}
          >
            💳 Online Payment
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            style={paymentMethod === "CASH" ? styles.methodBtnActive : styles.methodBtn}
          >
            💵 Cash Payment
          </button>
        </div>

        {error && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 14 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <button onClick={handlePay} disabled={submitting} style={{ ...layoutStyles.btnPrimary, flex: 1 }} className="hd-btn-primary">
            {submitting ? "Processing..." : `Confirm Payment (₹${bill.amount.toFixed(2)})`}
          </button>
          <button onClick={onClose} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}


function PaymentHistorySection({ loading }) {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const res = await api.get("/household-user/payments/history");
        setPayments(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoadingPayments(false); }
    };
    fetchPayments();
  }, []);

  return (
    <Panel title="Payment History" collapsible>
      {loadingPayments ? (
        <EmptyState text="Loading..." />
      ) : payments.length === 0 ? (
        <EmptyState text="No payments made yet." />
      ) : (
        <table style={layoutStyles.table} className="hd-table">
          <thead><tr><Th>Bill No.</Th><Th>Method</Th><Th>Amount Paid (₹)</Th><Th>Status</Th><Th>Paid On</Th></tr></thead>
          <tbody>
            {payments.map((p, i) => (
              <AnimatedRow key={p.id} index={i}>
                <Td>{p.billNumber}</Td>
                <Td>{p.paymentMethod === "ONLINE" ? "💳 Online" : "💵 Cash"}</Td>
                <Td>{p.amountPaid.toFixed(2)}</Td>
                <Td><Badge status={p.paymentStatus} /></Td>
                <Td>{new Date(p.paymentDate).toLocaleString()}</Td>
              </AnimatedRow>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function UrgentAnnouncementBanner() {
  const [urgent, setUrgent] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/household-user/announcements");
        const unreadUrgent = res.data.data.filter((a) => !a.isRead && (a.priority === "URGENT" || a.priority === "HIGH"));
        setUrgent(unreadUrgent);
      } catch (err) { console.error(err); }
    };
    fetch();
  }, []);

  const visible = urgent.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(90deg, #ef4444, #dc2626)", color: "#fff",
      borderRadius: 10, padding: "10px 16px", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 12, overflow: "hidden",
    }}>
      <span style={{ fontWeight: 800, fontSize: 12, whiteSpace: "nowrap" }}>🚨 IMPORTANT</span>
      <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block", animation: "scrollText 18s linear infinite", fontSize: 13 }}>
          {visible.map((a) => a.title).join("   •   ")}
        </div>
      </div>
      <button
        onClick={() => setDismissed([...dismissed, ...visible.map((a) => a.id)])}
        style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}
      >
        Dismiss
      </button>
      <style>{`@keyframes scrollText { 0% { transform: translateX(20%); } 100% { transform: translateX(-100%); } }`}</style>
    </div>
  );
}

function AnnouncementWidget() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/household-user/announcements");
        setAnnouncements(res.data.data.slice(0, 3));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const priorityColor = (p) => (p === "URGENT" ? theme.colors.danger : p === "HIGH" ? theme.colors.warning : theme.colors.primary);

  return (
    <Panel title="Latest Announcements">
      {loading ? (
        <EmptyState text="Loading..." />
      ) : announcements.length === 0 ? (
        <EmptyState text="No announcements yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {announcements.map((a) => (
            <div key={a.id} style={{
              padding: 12, borderRadius: 8, border: `1px solid ${theme.colors.border}`,
              borderLeft: `4px solid ${priorityColor(a.priority)}`,
              background: a.isRead ? theme.colors.surface : theme.colors.bg,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: a.isRead ? 500 : 700, fontSize: 13, color: theme.colors.text }}>{a.title}</span>
                {a.priority === "URGENT" && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: theme.colors.danger }}>URGENT</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: theme.colors.textMuted, marginTop: 3 }}>{a.publishDate}</div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/household-user/announcements");
      setAnnouncements(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleOpen = async (a) => {
    try {
      const res = await api.get(`/household-user/announcements/${a.id}`);
      setSelected(res.data.data);
      if (!a.isRead) {
        await api.put(`/household-user/announcements/${a.id}/read`);
        fetchAnnouncements();
      }
    } catch (err) { console.error(err); }
  };

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

  if (selected) {
    const colors = priorityColor(selected.priority);
    return (
      <>
        <SectionTitle text={selected.title} />
        <button onClick={() => setSelected(null)} style={{ ...layoutStyles.btnSecondary, marginBottom: 16 }} className="hd-btn-secondary">← Back to Announcements</button>
        <Panel title="Details">
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: colors.bg, color: colors.fg }}>
              {selected.priority}
            </span>
            <span style={{ fontSize: 12, color: theme.colors.textMuted }}>{selected.category.replace(/_/g, " ")}</span>
          </div>
          <div style={{ fontSize: 14, color: theme.colors.text, whiteSpace: "pre-line", marginBottom: 16 }}>{selected.description}</div>
          <div style={{ fontSize: 12, color: theme.colors.textFaint }}>
            Published {selected.publishDate}{selected.expiryDate && ` · Expires ${selected.expiryDate}`} · By {selected.createdByName}
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <SectionTitle text="Announcements" />
      <Panel title="Search & Filter">
        <div className="hd-filter-toolbar">
          <div className="hd-search-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title..." className="hd-search-input" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...layoutStyles.input, maxWidth: 200 }} className="hd-input">
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((a) => {
              const colors = priorityColor(a.priority);
              return (
                <div key={a.id} onClick={() => handleOpen(a)} style={{
                  padding: 14, borderRadius: 10, border: `1px solid ${theme.colors.border}`,
                  borderLeft: `4px solid ${colors.fg}`, cursor: "pointer",
                  background: a.isRead ? theme.colors.surface : theme.colors.bg,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: a.isRead ? 500 : 700, fontSize: 14, color: theme.colors.text }}>{a.title}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: colors.bg, color: colors.fg }}>
                      {a.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>{a.publishDate}{a.expiryDate && ` · Expires ${a.expiryDate}`}</div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}

const TIP_LIBRARY = [
  { category: "Daily Water Saving", icon: "💧", title: "Time Your Showers", desc: "Keep showers under 5 minutes — a shorter shower can save up to 40 liters each time.", action: "Try a shower timer or a favorite 4-minute song." },
  { category: "Daily Water Saving", icon: "💧", title: "Turn Off While Not in Use", desc: "Shut off the tap while brushing teeth or shaving instead of letting it run.", action: "Fill a cup for rinsing instead of running the tap." },
  { category: "Bathroom Water Saving", icon: "🚿", title: "Fix Running Toilets Fast", desc: "A silently leaking toilet can waste over 100 liters a day without you noticing.", action: "Do the food-dye test: add color to the tank, check the bowl after 10 minutes." },
  { category: "Bathroom Water Saving", icon: "🚿", title: "Low-Flow Fixtures", desc: "Low-flow showerheads and faucet aerators cut water use by up to 50% with no drop in comfort.", action: "Ask your apartment admin about low-flow fixture upgrades." },
  { category: "Kitchen Water Saving", icon: "🍽️", title: "Full Loads Only", desc: "Run the dishwasher only with a full load — it uses the same water regardless of load size.", action: "Scrape plates instead of pre-rinsing under the tap." },
  { category: "Kitchen Water Saving", icon: "🍽️", title: "Wash Produce in a Bowl", desc: "Rinse fruits and vegetables in a filled bowl instead of under running water.", action: "Reuse that rinse water for houseplants afterward." },
  { category: "Laundry Water Saving", icon: "🧺", title: "Batch Your Laundry", desc: "Wait for a full load before running the washing machine to reduce cycles per week.", action: "Group similar fabrics to avoid partial loads." },
  { category: "Laundry Water Saving", icon: "🧺", title: "Choose Eco Cycles", desc: "Eco or quick-wash settings use noticeably less water than standard heavy-duty cycles.", action: "Reserve heavy cycles only for truly soiled loads." },
  { category: "Gardening Water Saving", icon: "🌱", title: "Water Early or Late", desc: "Water plants at dawn or dusk to reduce evaporation loss in the heat of the day.", action: "Avoid watering between 11am–4pm." },
  { category: "Gardening Water Saving", icon: "🌱", title: "Mulch Your Beds", desc: "A layer of mulch keeps soil moist longer, cutting how often you need to water.", action: "Add 2–3 inches of mulch around plant bases." },
  { category: "Leak Detection", icon: "🔧", title: "Check Your Meter", desc: "If no water is being used but your meter is still moving, you likely have a hidden leak.", action: "Check the meter before bed and again first thing in the morning." },
  { category: "Leak Detection", icon: "🔧", title: "Inspect Under Sinks", desc: "Small drips under sinks or behind appliances often go unnoticed for months.", action: "Do a monthly check under sinks and behind the washing machine." },
  { category: "Smart Water Usage", icon: "📊", title: "Track Your Trends", desc: "Reviewing your usage history helps you spot spikes early and adjust habits.", action: "Check Usage History here in the dashboard every billing cycle." },
  { category: "Smart Water Usage", icon: "📊", title: "Compare to the Average", desc: "Seeing how your usage compares to your community's average can highlight easy wins.", action: "Check the Usage vs Apartment comparison in My Usage." },
  { category: "Water Reuse", icon: "♻️", title: "Reuse Cooking Water", desc: "Water used to boil vegetables or pasta can be cooled and used to water plants.", action: "Let it cool fully before pouring on soil." },
  { category: "Water Reuse", icon: "♻️", title: "Collect Shower Warm-Up Water", desc: "Catch the cold water while your shower heats up and reuse it for cleaning or plants.", action: "Keep a bucket by the shower for this." },
  { category: "Tap & Faucet Management", icon: "🚰", title: "Install Aerators", desc: "Faucet aerators mix air into the water stream, using less water with the same pressure feel.", action: "A simple screw-on upgrade, no plumber needed." },
  { category: "Tap & Faucet Management", icon: "🚰", title: "Fix Drips Promptly", desc: "A single dripping tap can waste over 15 liters a day if left unaddressed.", action: "Report persistent drips to your apartment admin." },
  { category: "Rainwater Harvesting", icon: "🌧️", title: "Collect Rooftop Runoff", desc: "Where permitted, a simple rain barrel can capture water for gardening use.", action: "Ask your community about shared rainwater harvesting setups." },
  { category: "Rainwater Harvesting", icon: "🌧️", title: "Direct Runoff to Plants", desc: "Angle downspouts toward garden beds so rainfall naturally waters your plants.", action: "Check drainage after the next rain to see where water flows." },
  { category: "Family Water Conservation", icon: "👨‍👩‍👧", title: "Make It a Household Habit", desc: "Small daily habits add up fastest when the whole household is on board.", action: "Set a simple household water-saving goal each month." },
  { category: "Family Water Conservation", icon: "👨‍👩‍👧", title: "Teach Kids Early", desc: "Involving children in water-saving habits builds lifelong conservation awareness.", action: "Turn off-the-tap-while-brushing into a fun family rule." },
  { category: "Avoiding Water Wastage", icon: "⚠️", title: "Don't Overfill", desc: "Overfilling buckets, tubs, or pots often leads to water spilling and going to waste.", action: "Fill to just what you need for the task." },
  { category: "Avoiding Water Wastage", icon: "⚠️", title: "Match Appliance Settings", desc: "Using the wrong water-level setting on washing machines wastes water on small loads.", action: "Match the load-size setting to your actual laundry size." },
];

const TIP_CATEGORIES = ["All", ...Array.from(new Set(TIP_LIBRARY.map((t) => t.category)))];

function WaterTipsSection() {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/household-user/water-tips");
        setTips(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <><SectionTitle text="Water Tips" /><EmptyState text="Loading..." /></>;
  if (!tips) return <><SectionTitle text="Water Tips" /><EmptyState text="Unable to load tips." /></>;

  const filteredTips = activeCategory === "All" ? TIP_LIBRARY : TIP_LIBRARY.filter((t) => t.category === activeCategory);

  return (
    <>
      <SectionTitle text="Water Tips" />

      <div className="hd-tip-hero">
        <div className="hd-tip-hero-icon">💡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hd-tip-hero-label">Personalized For You</div>
          <div className="hd-tip-hero-list">
            {tips.personalizedTips.map((tip, i) => (
              <div key={i} className="hd-tip-hero-item">{tip}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="hd-tip-featured-grid">
        <div className="hd-tip-featured-card hd-tip-featured-daily">
          <span className="hd-tip-featured-badge">📅 Daily Tip</span>
          <div className="hd-tip-featured-text">{tips.dailyTip}</div>
        </div>
        <div className="hd-tip-featured-card hd-tip-featured-seasonal">
          <span className="hd-tip-featured-badge">🌦️ Seasonal Tip</span>
          <div className="hd-tip-featured-text">{tips.seasonalTip}</div>
        </div>
      </div>

      <div className="hd-tip-emergency">
        <span className="hd-tip-emergency-icon">🚨</span>
        <div>
          <div className="hd-tip-emergency-label">Emergency Water Saving</div>
          <div className="hd-tip-emergency-text">{tips.emergencyTip}</div>
        </div>
      </div>

      <SectionTitle text="Water Conservation Library" />
      <div className="hd-tip-category-bar">
        {TIP_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`hd-tip-category-pill${activeCategory === c ? " is-active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="hd-tip-grid">
        {filteredTips.map((tip, i) => (
          <div key={i} className="hd-tip-card">
            <div className="hd-tip-card-icon">{tip.icon}</div>
            <div className="hd-tip-card-tag">{tip.category}</div>
            <div className="hd-tip-card-title">{tip.title}</div>
            <div className="hd-tip-card-desc">{tip.desc}</div>
            <div className="hd-tip-card-action">✅ {tip.action}</div>
          </div>
        ))}
      </div>
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
      const res = await api.get("/household-user/profile");
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
      const res = await api.put("/household-user/profile", { fullName, email, phoneNumber });
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
      const res = await api.put("/household-user/profile/change-password", { currentPassword, newPassword });
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
          <div style={layoutStyles.statGrid}>{[0,1,2,3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} />)}</div>
        ) : !profile ? (
          <EmptyState text="Unable to load profile." />
        ) : !editMode ? (
          <>
            <div className="hd-profile-avatar">{getInitials(profile.fullName)}</div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text }} className="hd-heading">{profile.fullName}</div>
              <div style={{ fontSize: 12.5, color: theme.colors.textMuted, marginTop: 2 }}>Household · Flat {profile.flatNumber}</div>
            </div>
            <div style={layoutStyles.statGrid}>
              <AnimatedCard index={0}><ProfileField label="Full Name" value={profile.fullName} /></AnimatedCard>
              <AnimatedCard index={1}><ProfileField label="Email" value={profile.email} /></AnimatedCard>
              <AnimatedCard index={2}><ProfileField label="Phone" value={profile.phoneNumber} /></AnimatedCard>
              <AnimatedCard index={3}><ProfileField label="Flat Number" value={profile.flatNumber} /></AnimatedCard>
            </div>
            <div style={{ ...layoutStyles.statGrid, marginTop: 16 }}>
              <AnimatedCard index={4}><ProfileField label="Apartment Name" value={profile.apartmentName} /></AnimatedCard>
              <AnimatedCard index={5}><ProfileField label="Apartment Admin" value={profile.apartmentAdminName} /></AnimatedCard>
              <AnimatedCard index={6}><ProfileField label="Status" value={profile.status} /></AnimatedCard>
            </div>
            <button onClick={() => setEditMode(true)} style={{ ...layoutStyles.btnPrimary, marginTop: 20 }} className="hd-btn-primary">Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ maxWidth: 400 }}>
            <div className="hd-profile-avatar">{getInitials(profile.fullName)}</div>
            <div style={{ ...layoutStyles.statCard, marginBottom: 16 }} className="hd-stat-card">
              <div style={layoutStyles.statLabel}>Full Name (read-only)</div>
              <div style={{ color: theme.colors.text, fontSize: 14, fontWeight: 700, marginTop: 4 }}>{profile.fullName}</div>
            </div>
            <label style={layoutStyles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={layoutStyles.input} className="hd-input" required />
            <label style={layoutStyles.label}>Phone Number</label>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={layoutStyles.input} className="hd-input" required />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={layoutStyles.btnPrimary} className="hd-btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditMode(false)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Panel>
      <Panel title="Security">
        {!showChangePassword ? (
          <button onClick={() => setShowChangePassword(true)} style={layoutStyles.btnPrimary} className="hd-btn-primary">Change Password</button>
        ) : (
          <form onSubmit={handleChangePassword} style={{ maxWidth: 360 }}>
            <label style={layoutStyles.label}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={layoutStyles.input} className="hd-input" required />
            <label style={layoutStyles.label}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={layoutStyles.input} className="hd-input" required />
            <label style={layoutStyles.label}>Confirm New Password</label>
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={layoutStyles.input} className="hd-input" required />
            {pwError && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{pwError}</div>}
            {pwSuccess && <div style={{ color: theme.colors.success, fontSize: 12, marginTop: 10 }}>{pwSuccess}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="submit" disabled={submittingPw} style={layoutStyles.btnPrimary} className="hd-btn-primary">{submittingPw ? "Updating..." : "Update Password"}</button>
              <button type="button" onClick={() => setShowChangePassword(false)} style={layoutStyles.btnSecondary} className="hd-btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Panel>
    </>
  );
}

function ProfileField({ label, value }) {
  return (
    <div style={layoutStyles.statCard}>
      <div style={layoutStyles.statLabel}>{label}</div>
      <div style={{ color: theme.colors.text, fontSize: 14, fontWeight: 700, marginTop: 4, wordBreak: "break-word", overflowWrap: "break-word" }}>{value}</div>
    </div>
  );
}

function PlaceholderSection({ title }) {
  return (<><SectionTitle text={title} /><Panel title={title}><EmptyState text={`${title} module coming soon.`} /></Panel></>);
}
function SectionTitle({ text }) {
  return (<div style={layoutStyles.sectionTitleWrap}><h1 style={layoutStyles.sectionTitle} className="hd-heading">{text}</h1></div>);
}
const HD_STAT_COLOR_CLASS = { purple: "hd-stat-purple", blue: "hd-stat-blue", amber: "hd-stat-amber", green: "hd-stat-green" };
function StatCard({ label, value, prefix = "", suffix = "", decimals = 0, color, icon }) {
  const isNumeric = typeof value === "number";
  const colorClass = color ? HD_STAT_COLOR_CLASS[color] : "";
  return (
    <div style={layoutStyles.statCard} className={`hd-stat-card ${colorClass}`}>
      {icon && <div className="hd-stat-icon">{icon}</div>}
      <div style={layoutStyles.statLabel} className="hd-stat-label">{label}</div>
      <div style={layoutStyles.statValue} className="hd-heading hd-stat-value">
        {isNumeric ? <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} /> : value}
      </div>
    </div>
  );
}
function Panel({ title, children, collapsible = false, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div style={layoutStyles.panel} className="anim-card hd-panel">
      <div style={layoutStyles.panelHeader} className="hd-panel-header">
        <span className="hd-panel-header-title">{title}</span>
        {collapsible && (
          <button
            type="button"
            aria-label={collapsed ? "Expand section" : "Collapse section"}
            aria-expanded={!collapsed}
            className={`hd-collapse-toggle${collapsed ? " is-collapsed" : ""}`}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
      {collapsible ? (
        <div className={`hd-panel-body-collapsible${collapsed ? " is-collapsed" : ""}`}>
          <div style={layoutStyles.panelBody}>{children}</div>
        </div>
      ) : (
        <div style={layoutStyles.panelBody}>{children}</div>
      )}
    </div>
  );
}
function EmptyState({ text }) { return <div style={layoutStyles.emptyState}>{text}</div>; }
function HdPriorityBadge({ priority }) {
  if (!priority) return <span>—</span>;
  const cls = priority === "HIGH" ? "hd-priority-high" : priority === "LOW" ? "hd-priority-low" : "hd-priority-medium";
  return <span className={`hd-priority-badge ${cls}`}>{priority}</span>;
}
function Th({ children }) { return <th style={layoutStyles.th}>{children}</th>; }
function Td({ children }) { return <td style={layoutStyles.td}>{children}</td>; }
function Badge({ status }) {
  return <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, ...StatusBadge({ status }) }}>{status}</span>;
}
function HydroLogo({ colorMode = "dark" }) {
  const color = colorMode === "light" ? theme.colors.primary : "#ffffff";
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke={color} strokeWidth="2" />
      <path d="M24 12 C24 12 14 25 14 32 A10 10 0 0 0 34 32 C34 25 24 12 24 12Z" fill={color} />
    </svg>
  );
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
}

function PersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}



const styles = {
  topBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
    height: HEADER_HEIGHT,
    background: theme.colors.headerBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    boxShadow: "0 4px 24px rgba(var(--shadow-color),0.18)",
    backdropFilter: "blur(10px)",
    boxSizing: "border-box",
  },
  logoBlock: { display: "flex", alignItems: "center", gap: 12 },
  brand: { color: "#ffffff", fontSize: 18, fontWeight: 700, letterSpacing: 0.2 },
  tagline: { color: "rgba(255,255,255,0.7)", fontSize: 10.5, letterSpacing: 1, marginTop: 2 },
  userBlock: { display: "flex", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", background: "#4ade80" },
  userText: { color: "#ffffff", fontSize: 12.5, fontWeight: 600 },
  apartmentInfo: { color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 },

  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
  },
  invoiceCard: {
    background: "#ffffff", borderRadius: 16, width: 560, maxWidth: "100%",
    maxHeight: "90vh", overflowY: "auto", padding: 32,
    boxShadow: "0 24px 64px rgba(15,23,42,0.3)",
  },
  invoiceHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  invoiceDivider: { height: 1, background: theme.colors.border, margin: "24px 0" },
  invoiceMetaRow: { display: "flex", justifyContent: "space-between", marginBottom: 24 },
  invoiceMetaLabel: { fontSize: 10.5, color: theme.colors.textFaint, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  invoiceMetaValue: { fontSize: 14, color: theme.colors.text, fontWeight: 700 },
  invoiceMetaSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  invoiceTable: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  invoiceTh: {
    textAlign: "left", padding: "10px 8px", fontSize: 10.5, fontWeight: 700,
    color: theme.colors.textFaint, textTransform: "uppercase", borderBottom: `2px solid ${theme.colors.border}`,
  },
  invoiceTd: { padding: "14px 8px", color: theme.colors.text, borderBottom: `1px solid ${theme.colors.bg}` },
  invoiceTotalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 18, paddingTop: 18, borderTop: `2px solid ${theme.colors.border}`,
  },
  invoiceTotalLabel: { fontSize: 14, fontWeight: 700, color: theme.colors.text },
  invoiceTotalValue: { fontSize: 24, fontWeight: 800, color: theme.colors.primary },
  invoiceFooter: { fontSize: 11, color: theme.colors.textFaint, marginTop: 24, lineHeight: 1.5 },
  invoiceActions: { display: "flex", gap: 10, marginTop: 24 },

  payCard: {
  background: "#ffffff", borderRadius: 16, width: 420, maxWidth: "100%",
  padding: 28, boxShadow: "0 24px 64px rgba(15,23,42,0.3)",
},
payAmountBox: {
  background: theme.colors.bg, borderRadius: 12, padding: "16px 18px",
  textAlign: "center", marginBottom: 20,
},
methodBtn: {
  flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${theme.colors.borderStrong}`,
  background: theme.colors.surface, color: theme.colors.textMuted, fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
},
methodBtnActive: {
  flex: 1, padding: "12px 0", borderRadius: 10, border: `2px solid ${theme.colors.primary}`,
  background: theme.colors.primaryLight, color: theme.colors.primary, fontSize: 13, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit",
},
};