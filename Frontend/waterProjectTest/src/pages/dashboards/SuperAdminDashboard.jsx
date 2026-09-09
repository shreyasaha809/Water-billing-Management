import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { theme, layoutStyles, StatusBadge } from "../../theme";
import { CountUp, SkeletonStatCard, SkeletonRows, AnimatedCard, AnimatedRow } from "../../components/Animated";
import AiAssistant from "../../components/AiAssistant";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageSelector from "../../components/LanguageSelector";
import GlowTrendChart from "../../components/charts/GlowTrendChart";
import "./superAdminDashboard.css";
import SuperAdminOrgReport from "../../components/reports/SuperAdminOrgReport";
import { useToast } from "../../context/ToastContext";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "pending", label: "Pending Requests", icon: "⏳" },
  { key: "userManagement", label: "User Management", icon: "☺" },
  { key: "deletedLogs", label: "Deleted Apartments", icon: "🗑" },
  { key: "reports", label: "Reports", icon: "▨" },
  { key: "support", label: "support", icon: "🎫" },
  { key: "profile", label: "Profile", icon: "☺" },
  { key: "logout", label: "Logout", icon: "⏻" },
];

export default function SuperAdminDashboard() {
  const toast = useToast();
  const fullName = localStorage.getItem("fullName") || "Super Admin";
  const [active, setActive] = useState("dashboard");

  const [pending, setPending] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [householdUsers, setHouseholdUsers] = useState([]);
  const [deletedLogs, setDeletedLogs] = useState([]);
  const [readingsCount, setReadingsCount] = useState(0);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingHouseholds, setLoadingHouseholds] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const res = await api.get("/super-admin/apartment-admins/pending");
      setPending(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingPending(false); }
  };

  const fetchAll = async () => {
    setLoadingAll(true);
    try {
      const res = await api.get("/super-admin/apartment-admins");
      setAllAdmins(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingAll(false); }
  };

  const fetchHouseholds = async () => {
    setLoadingHouseholds(true);
    try {
      const res = await api.get("/super-admin/households");
      setHouseholdUsers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingHouseholds(false); }
  };

  const fetchDeletedLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get("/super-admin/apartment-admins/deleted-logs");
      setDeletedLogs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoadingLogs(false); }
  };

  const fetchReadingsCount = async () => {
    try {
      const res = await api.get("/super-admin/households/readings-count");
      setReadingsCount(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPending();
    fetchAll();
    fetchHouseholds();
    fetchDeletedLogs();
    fetchReadingsCount();
  }, []);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.put(`/super-admin/apartment-admins/${id}/approve`);
      toast.success(res.data.message);
      fetchPending(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Approval failed."); }
    finally { setActionLoadingId(null); }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.put(`/super-admin/apartment-admins/${id}/reject`);
      toast.success(res.data.message);
      fetchPending(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Rejection failed."); }
    finally { setActionLoadingId(null); }
  };

  const handleDeleteApartment = async (id, name) => {
    const confirmed = window.confirm(`Delete "${name}"'s apartment admin account? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const res = await api.delete(`/super-admin/apartment-admins/${id}`);
      toast.success(res.data.message);
      fetchAll(); fetchPending(); fetchDeletedLogs();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete apartment admin."); }
    finally { setDeletingId(null); }
  };

  const handleNavClick = (key) => {
    if (key === "logout") { localStorage.clear(); window.location.href = "/login"; return; }
    setActive(key);
  };

  const [apartmentHouseholds, setApartmentHouseholds] = useState([]);
const [loadingApartmentHouseholds, setLoadingApartmentHouseholds] = useState(false);
const [selectedApartmentId, setSelectedApartmentId] = useState(null);

const fetchHouseholdsByApartment = async (apartmentId) => {
  setSelectedApartmentId(apartmentId);
  setLoadingApartmentHouseholds(true);
  try {
    const res = await api.get(`/super-admin/apartments/${apartmentId}/households`);
    setApartmentHouseholds(res.data.data);
  } catch (err) { console.error(err); }
  finally { setLoadingApartmentHouseholds(false); }
};

  const approvedCount = allAdmins.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = allAdmins.filter((a) => a.status === "REJECTED").length;

  return (
    <div style={layoutStyles.page} className="sa-shell">
      <div className="sa-bg-blob sa-blob-1" />
      <div className="sa-bg-blob sa-blob-2" />
      <div className="sa-bg-blob sa-blob-3" />
      <div className="sa-content">
      <div style={layoutStyles.topBar} className="anim-navbar sa-topbar">
        <div style={layoutStyles.logoBlock}>
          <div className="sa-logo-badge"><HydroLogo /></div>
          <div>
            <div style={layoutStyles.brand} className="sa-heading sa-topbar-text">HydroHome</div>
            <div style={layoutStyles.tagline} className="sa-topbar-text-muted">WATER MONITORING SYSTEM</div>
          </div>
        </div>
       <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <ThemeToggle />
  <LanguageSelector variant="light" />
  <div style={layoutStyles.userBlock}>
    <span style={layoutStyles.statusDot} />
    <span style={layoutStyles.userText} className="sa-topbar-text">Super Admin · {fullName}</span>
  </div>
  <div style={layoutStyles.headerAvatar} className="sa-avatar">{getInitials(fullName)}</div>
</div>
      </div>

      <div style={layoutStyles.body}>
        <div style={layoutStyles.sidebar} className="anim-sidebar sa-sidebar">
          <div style={layoutStyles.sidebarHeader} className="sa-eyebrow">Control Panel</div>
          <div style={layoutStyles.sidebarDivider} />
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              style={{ ...layoutStyles.navItem, ...(active === item.key ? layoutStyles.navItemActive : {}) }}
              className={active === item.key ? "sa-nav-active" : "sa-nav-item"}
            >
              <span style={layoutStyles.navIcon}>{item.icon}</span>
              {item.label}
              {item.key === "pending" && pending.length > 0 && (
                <span style={layoutStyles.navBadge}>{pending.length}</span>
              )}
            </div>
          ))}
        </div>

        <div style={layoutStyles.main} key={active} className="anim-page">
          {active === "dashboard" && (
            <DashboardHome
              totalAdmins={allAdmins.length} pendingCount={pending.length}
              approvedCount={approvedCount} rejectedCount={rejectedCount}
              pending={pending} loadingPending={loadingPending}
              actionLoadingId={actionLoadingId} onApprove={handleApprove} onReject={handleReject}
              householdUsers={householdUsers} loadingHouseholds={loadingHouseholds}
            />
          )}
          {active === "pending" && (
            <PendingRequestsSection
              pending={pending} loading={loadingPending}
              actionLoadingId={actionLoadingId} onApprove={handleApprove} onReject={handleReject}
            />
          )}
          {active === "userManagement" && (
  <UserManagementSection
    allAdmins={allAdmins} loadingAll={loadingAll}
    onDelete={handleDeleteApartment} deletingId={deletingId}
    households={householdUsers} loadingHouseholds={loadingHouseholds}
    readingsCount={readingsCount}
    selectedApartmentId={selectedApartmentId}
    onSelectApartment={fetchHouseholdsByApartment}
    apartmentHouseholds={apartmentHouseholds}
    loadingApartmentHouseholds={loadingApartmentHouseholds}
  />
)}

          {active === "deletedLogs" && (
            <DeletedLogsSection logs={deletedLogs} loading={loadingLogs} />
          )}

          {active === "support" && <SuperAdminSupportSection />}
          {active === "profile" && <ProfileSection />}
          {active === "reports" && <ReportsSection />}
        </div>
      </div>

      <AiAssistant
    role="SUPER_ADMIN"
    onNavigate={(key) => setActive(key)}
/>
      </div>
    </div>
  );
}

function DashboardHome({ totalAdmins, pendingCount, approvedCount, rejectedCount, pending, loadingPending, actionLoadingId, onApprove, onReject, householdUsers, loadingHouseholds }) {
  return (
    <>
      <SectionTitle text="System Overview" eyebrow="Admin Console" />
      <div style={layoutStyles.statGrid}>
        {loadingPending ? (
          [0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} className="sa-stat-card" />)
        ) : (
          <>
            <AnimatedCard index={0}><StatCard label="Total Apartment Admins" value={totalAdmins} color="purple" icon="🏢" /></AnimatedCard>
            <AnimatedCard index={1}><StatCard label="Pending Approvals" value={pendingCount} highlight={pendingCount > 0} color="amber" icon="⏳" /></AnimatedCard>
            <AnimatedCard index={2}><StatCard label="Approved" value={approvedCount} color="green" icon="✅" /></AnimatedCard>
            <AnimatedCard index={3}><StatCard label="Rejected" value={rejectedCount} color="blue" icon="🚫" /></AnimatedCard>
          </>
        )}
      </div>

      <Panel title="Households by Apartment">
        {loadingHouseholds ? <EmptyState text="Loading..." /> : <HouseholdsByApartmentChart households={householdUsers} />}
      </Panel>

      <Panel title="Pending Apartment Admin Requests">
        <RequestsTable data={pending} loading={loadingPending} actionLoadingId={actionLoadingId} onApprove={onApprove} onReject={onReject} />
      </Panel>
    </>
  );
}

function HouseholdsByApartmentChart({ households }) {
  const map = {};
  (households || []).forEach((h) => {
    map[h.apartmentName] = (map[h.apartmentName] || 0) + 1;
  });
  const data = Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .reverse();

  if (data.length === 0) return <EmptyState text="No household data yet." />;

  return (
    <GlowTrendChart
      data={data} xKey="name" yKey="count"
      unit=" households" height={280} highlightCount={3}
      gradientId="householdsByApartment"
    />
  );
}

function PendingRequestsSection({ pending, loading, actionLoadingId, onApprove, onReject }) {
  return (
    <>
      <SectionTitle text="Pending Apartment Admin Requests" eyebrow="Approvals Queue" />
      <Panel title="Awaiting Approval">
        <RequestsTable data={pending} loading={loading} actionLoadingId={actionLoadingId} onApprove={onApprove} onReject={onReject} />
      </Panel>
    </>
  );
}

function UserManagementSection({
  allAdmins, loadingAll, onDelete, deletingId, households, loadingHouseholds, readingsCount,
  selectedApartmentId, onSelectApartment, apartmentHouseholds, loadingApartmentHouseholds,
}) {
  const [subTab, setSubTab] = useState("apartmentAdmins");
  return (
    <>
   <SectionTitle text="User Management" eyebrow="Access Control" />
      <div style={styles.subTabRow}>
        <button onClick={() => setSubTab("apartmentAdmins")} style={subTab === "apartmentAdmins" ? styles.subTabActive : styles.subTabInactive}>
          Apartment Admins
        </button>
        <button onClick={() => setSubTab("households")} style={subTab === "households" ? styles.subTabActive : styles.subTabInactive}>
          Household Users
        </button>
        <button onClick={() => setSubTab("apartmentWise")} style={subTab === "apartmentWise" ? styles.subTabActive : styles.subTabInactive}>
          Apartment-wise Residents
        </button>
      </div>
      {subTab === "apartmentAdmins" && (
        <AllAdminsSection allAdmins={allAdmins} loading={loadingAll} onDelete={onDelete} deletingId={deletingId} />
      )}
      {subTab === "households" && (
        <HouseholdsSection households={households} loading={loadingHouseholds} readingsCount={readingsCount} />
      )}
      {subTab === "apartmentWise" && (
        <ApartmentWiseSection
          allAdmins={allAdmins} loadingAll={loadingAll}
          selectedApartmentId={selectedApartmentId} onSelectApartment={onSelectApartment}
          apartmentHouseholds={apartmentHouseholds} loadingApartmentHouseholds={loadingApartmentHouseholds}
        />
      )}
    </>
  );
}

function AllAdminsSection({ allAdmins, loading, onDelete, deletingId }) {
  return (
    <Panel title="Registry">
      {loading ? (
        <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={3} columns={7} /></tbody></table>
      ) : allAdmins.length === 0 ? (
        <EmptyState text="No apartment admins registered yet." />
      ) : (
        <table style={layoutStyles.table} className="sa-table">
          <thead><tr><Th>Name</Th><Th>Email</Th><Th>Apartment</Th><Th>City</Th><Th>Status</Th><Th>Registered</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {allAdmins.map((a, i) => (
              <AnimatedRow key={a.id} index={i}>
                <Td>{a.fullName}</Td><Td>{a.email}</Td><Td>{a.apartmentName}</Td><Td>{a.city}</Td>
                <Td><Badge status={a.status} /></Td><Td>{new Date(a.createdAt).toLocaleDateString()}</Td>
                <Td><button disabled={deletingId === a.id} onClick={() => onDelete(a.id, a.fullName)} style={layoutStyles.btnDanger} className="sa-btn-danger">
                  {deletingId === a.id ? "Deleting..." : "Delete"}
                </button></Td>
              </AnimatedRow>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function HouseholdsSection({ households, loading, readingsCount }) {
  return (
    <>
      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="Total Households" value={households.length} /></AnimatedCard>
        <AnimatedCard index={1}><StatCard label="Active" value={households.filter((h) => h.status === "ACTIVE").length} /></AnimatedCard>
        <AnimatedCard index={2}><StatCard label="Apartments Covered" value={new Set(households.map((h) => h.apartmentName)).size} /></AnimatedCard>
        <AnimatedCard index={3}><StatCard label="Households With Readings Recorded" value={readingsCount} /></AnimatedCard>
      </div>
      <Panel title="All Households">
        {loading ? (
          <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={3} columns={6} /></tbody></table>
        ) : households.length === 0 ? (
          <EmptyState text="No household users registered yet." />
        ) : (
          <table style={layoutStyles.table} className="sa-table">
            <thead><tr><Th>Full Name</Th><Th>Email</Th><Th>Phone</Th><Th>Flat No.</Th><Th>Status</Th><Th>Registered</Th></tr></thead>
            <tbody>
              {households.map((h, i) => (
                <AnimatedRow key={h.id} index={i}>
                  <Td>{h.fullName}</Td><Td>{h.email}</Td><Td>{h.phoneNumber}</Td><Td>{h.flatNumber}</Td>
                  <Td><Badge status={h.status} /></Td><Td>{new Date(h.createdAt).toLocaleDateString()}</Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function ApartmentWiseSection({ allAdmins, loadingAll, selectedApartmentId, onSelectApartment, apartmentHouseholds, loadingApartmentHouseholds }) {
  const selectedAdmin = allAdmins.find((a) => a.apartmentId === selectedApartmentId);

  return (
    <>
      <Panel title="Select an Apartment">
        {loadingAll ? (
          <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={3} columns={4} /></tbody></table>
        ) : allAdmins.length === 0 ? (
          <EmptyState text="No apartments registered yet." />
        ) : (
          <table style={layoutStyles.table} className="sa-table">
            <thead><tr><Th>Apartment</Th><Th>Admin</Th><Th>City</Th><Th>Status</Th></tr></thead>
            <tbody>
              {allAdmins.map((a, i) => (
                <AnimatedRow key={a.id} index={i}>
                  <Td>
                    <button
                      onClick={() => onSelectApartment(a.apartmentId)}
                      style={{
                        ...layoutStyles.btnSecondary,
                        background: selectedApartmentId === a.apartmentId ? theme.colors.primary : layoutStyles.btnSecondary.background,
                        color: selectedApartmentId === a.apartmentId ? "#fff" : layoutStyles.btnSecondary.color,
                      }} className="sa-btn-secondary"
                    >
                      {a.apartmentName}
                    </button>
                  </Td>
                  <Td>{a.fullName}</Td><Td>{a.city}</Td><Td><Badge status={a.status} /></Td>
                </AnimatedRow>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {selectedApartmentId && (
        <Panel title={`Residents — ${selectedAdmin ? selectedAdmin.apartmentName : ""}`}>
          {loadingApartmentHouseholds ? (
            <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={3} columns={6} /></tbody></table>
          ) : apartmentHouseholds.length === 0 ? (
            <EmptyState text="No residents registered under this apartment yet." />
          ) : (
            <table style={layoutStyles.table} className="sa-table">
              <thead><tr><Th>Full Name</Th><Th>Email</Th><Th>Phone</Th><Th>Flat No.</Th><Th>Status</Th><Th>Registered</Th></tr></thead>
              <tbody>
                {apartmentHouseholds.map((h, i) => (
                  <AnimatedRow key={h.id} index={i}>
                    <Td>{h.fullName}</Td><Td>{h.email}</Td><Td>{h.phoneNumber}</Td><Td>{h.flatNumber}</Td>
                    <Td><Badge status={h.status} /></Td><Td>{new Date(h.createdAt).toLocaleDateString()}</Td>
                  </AnimatedRow>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}
    </>
  );
}

function DeletedLogsSection({ logs, loading }) {
  return (
    <>
      <SectionTitle text="Deleted Apartments Log" eyebrow="Audit Trail" />
      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="Total Deletions" value={logs.length} /></AnimatedCard>
      </div>
      <Panel title="Deletion History">
        {loading ? (
          <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={2} columns={5} /></tbody></table>
        ) : logs.length === 0 ? (
          <EmptyState text="No apartments have been deleted yet." />
        ) : (
          <table style={layoutStyles.table} className="sa-table">
            <thead><tr><Th>Admin Name</Th><Th>Admin Email</Th><Th>Apartment</Th><Th>City</Th><Th>Deleted On</Th></tr></thead>
            <tbody>
              {logs.map((l, i) => (
                <AnimatedRow key={l.id} index={i}>
                  <Td>{l.adminFullName}</Td><Td>{l.adminEmail}</Td><Td>{l.apartmentName}</Td><Td>{l.city}</Td>
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

function SuperAdminSupportSection() {
  const [view, setView] = useState("list");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/support");
      setTickets(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  if (view === "detail" && selectedTicketId) {
    return (
      <SuperAdminTicketDetailView
        ticketId={selectedTicketId}
        onBack={() => { setView("list"); fetchTickets(); }}
      />
    );
  }

  return (
    <>
      <SectionTitle text="Escalated Support Tickets" />

      <div style={layoutStyles.statGrid}>
        <AnimatedCard index={0}><StatCard label="Escalated Tickets" value={tickets.length} /></AnimatedCard>
      </div>

      <Panel title="Escalated Tickets">
        {loading ? (
          <EmptyState text="Loading..." />
        ) : tickets.length === 0 ? (
          <EmptyState text="No escalated tickets." />
        ) : (
          <table style={layoutStyles.table} className="sa-table">
            <thead><tr><Th>Ticket No.</Th><Th>Household</Th><Th>Category</Th><Th>Title</Th><Th>Created</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {tickets.map((t, i) => (
                <AnimatedRow key={t.id} index={i}>
                  <Td>{t.ticketNumber}</Td>
                  <Td>{t.householdName || (t.raisedByAdminName ? `${t.raisedByAdminName} (Apartment Admin)` : "—")}</Td>
                  <Td>{t.category}</Td>
                  <Td>{t.title}</Td>
                  <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <button onClick={() => { setSelectedTicketId(t.id); setView("detail"); }} style={layoutStyles.btnSecondary} className="sa-btn-secondary">Open</button>
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

function SuperAdminTicketDetailView({ ticketId, onBack }) {
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/support/${ticketId}`);
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
      await api.post(`/super-admin/support/${ticketId}/messages`, { message: newMessage });
      setNewMessage("");
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

const handleResolveAndForward = async () => {
    const confirmed = window.confirm("Mark as solved and forward to Apartment Admin?");
    if (!confirmed) return;
    setProcessing(true);
    try {
      await api.put(`/super-admin/support/${ticketId}/resolve-and-forward`);
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to forward resolution.");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdminTicketStatusChange = async (status) => {
    const confirmed = window.confirm(`Mark this ticket as ${status.replace(/_/g, " ")}?`);
    if (!confirmed) return;
    setProcessing(true);
    try {
      await api.put(`/super-admin/support/${ticketId}/status`, { status });
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Loading..." /></>;
  if (!ticket) return <><SectionTitle text="Ticket Detail" /><EmptyState text="Ticket not found." /></>;

  return (
    <>
      <SectionTitle text={ticket.ticketNumber} />
      <button onClick={onBack} style={{ ...layoutStyles.btnSecondary, marginBottom: 16 }} className="sa-btn-secondary">← Back to Escalated Tickets</button>

      <Panel title="Ticket Info">
        <div style={layoutStyles.statGrid}>
          <ProfileField label="Household" value={ticket.householdName || (ticket.raisedByAdminName ? `${ticket.raisedByAdminName} (Apartment Admin)` : "—")} />
          <ProfileField label="Category" value={ticket.category} />
          <ProfileField label="Status" value={ticket.status.replace(/_/g, " ")} />
          <ProfileField label="Assigned Admin" value={ticket.assignedAdminName || "—"} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textFaint, textTransform: "uppercase", marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 13.5, color: theme.colors.text, whiteSpace: "pre-line" }}>{ticket.description}</div>
        </div>

       {ticket.raisedByAdminName ? (
          // Apartment Admin -> Super Admin ticket: Super Admin has full resolution control.
          !["RESOLVED", "CLOSED"].includes(ticket.status) && (
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              <button onClick={() => handleAdminTicketStatusChange("IN_PROGRESS")} disabled={processing} style={layoutStyles.btnSecondary} className="sa-btn-secondary">
                Mark In Progress
              </button>
              <button onClick={() => handleAdminTicketStatusChange("RESOLVED")} disabled={processing} style={layoutStyles.btnSuccess} className="sa-btn-success">
                Mark Resolved
              </button>
              <button onClick={() => handleAdminTicketStatusChange("CLOSED")} disabled={processing} style={layoutStyles.btnSecondary} className="sa-btn-secondary">
                Close Ticket
              </button>
            </div>
          )
        ) : (
          ticket.status === "ESCALATED" && (
            <div style={{ marginTop: 20 }}>
              <button onClick={handleResolveAndForward} disabled={processing} style={layoutStyles.btnSuccess} className="sa-btn-success">
                Mark Solved & Forward to Apartment Admin
              </button>
            </div>
          )
        )}
      </Panel>

      <Panel title="Conversation">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {ticket.messages.length === 0 ? (
            <EmptyState text="No messages yet." />
          ) : (
            ticket.messages.map((m) => (
              <div key={m.id} style={{
                alignSelf: m.senderRole === "SUPER_ADMIN" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                background: m.senderRole === "SUPER_ADMIN" ? theme.colors.primaryLight : theme.colors.bg,
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

        <form onSubmit={handleSendMessage}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ ...layoutStyles.input, flex: 1 }} className="sa-input"
              placeholder="Reply to Apartment Admin / request more info..."
            />
            <button type="submit" disabled={sending} style={layoutStyles.btnPrimary} className="sa-btn-primary">
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </Panel>
    </>
  );
}

function ReportsSection() {
  return (
    <>
      <SectionTitle text="Reports" />

      <Panel title="Organization Analytics Report">
        <SuperAdminOrgReport />
      </Panel>
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
      const res = await api.get("/super-admin/profile");
      setProfile(res.data.data);
      setFullName(res.data.data.fullName);
      setEmail(res.data.data.email);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/super-admin/profile", { fullName, email });
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
      const res = await api.put("/super-admin/profile/change-password", { currentPassword, newPassword });
      setPwSuccess(res.data.message);
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setShowChangePassword(false);
    } catch (err) { setPwError(err.response?.data?.message || "Failed to change password."); }
    finally { setSubmittingPw(false); }
  };

  return (
    <>
      <SectionTitle text="My Profile" eyebrow="Account" />
      <Panel title="Account Details">
        {loading ? (
          <div style={layoutStyles.statGrid}>{[0,1,2,3].map((i) => <SkeletonStatCard key={i} style={layoutStyles.statCard} className="sa-stat-card" />)}</div>
        ) : !profile ? (
          <EmptyState text="Unable to load profile." />
        ) : !editMode ? (
          <>
            <div className="sa-profile-avatar">{getSaInitials(profile.fullName)}</div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.colors.text }} className="sa-heading">{profile.fullName}</div>
              <div style={{ fontSize: 12.5, color: theme.colors.textMuted, marginTop: 2 }}>Super Admin</div>
            </div>
            <div style={layoutStyles.statGrid}>
              <AnimatedCard index={0}><ProfileField label="Full Name" value={profile.fullName} /></AnimatedCard>
              <AnimatedCard index={1}><ProfileField label="Email" value={profile.email} /></AnimatedCard>
              <AnimatedCard index={2}><ProfileField label="Role" value={profile.role} /></AnimatedCard>
              <AnimatedCard index={3}><ProfileField label="Account ID" value={`#${profile.id}`} /></AnimatedCard>
            </div>
            <button onClick={() => setEditMode(true)} style={{ ...layoutStyles.btnPrimary, marginTop: 20 }} className="sa-btn-primary">Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ maxWidth: 400 }}>
            <div className="sa-profile-avatar">{getSaInitials(profile.fullName)}</div>
            <label style={layoutStyles.label}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={layoutStyles.input} className="sa-input" required />
            <label style={layoutStyles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={layoutStyles.input} className="sa-input" required />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={layoutStyles.btnPrimary} className="sa-btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditMode(false)} style={layoutStyles.btnSecondary} className="sa-btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Panel>
      <Panel title="Security">
        {!showChangePassword ? (
          <button onClick={() => setShowChangePassword(true)} style={layoutStyles.btnPrimary} className="sa-btn-primary">Change Password</button>
        ) : (
          <form onSubmit={handleChangePassword} style={{ maxWidth: 360 }}>
            <label style={layoutStyles.label}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={layoutStyles.input} className="sa-input" required />
            <label style={layoutStyles.label}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={layoutStyles.input} className="sa-input" required />
            <label style={layoutStyles.label}>Confirm New Password</label>
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={layoutStyles.input} className="sa-input" required />
            {pwError && <div style={{ color: theme.colors.danger, fontSize: 12, marginTop: 10 }}>{pwError}</div>}
            {pwSuccess && <div style={{ color: theme.colors.success, fontSize: 12, marginTop: 10 }}>{pwSuccess}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="submit" disabled={submittingPw} style={layoutStyles.btnPrimary} className="sa-btn-primary">{submittingPw ? "Updating..." : "Update Password"}</button>
              <button type="button" onClick={() => setShowChangePassword(false)} style={layoutStyles.btnSecondary} className="sa-btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Panel>
    </>
  );
}

function getSaInitials(name) {
  if (!name) return "SA";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function ProfileField({ label, value }) {
  return (
    <div style={{ ...layoutStyles.statCard, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.22)", borderLeft: "3.5px solid #2563eb" }} className="sa-stat-card">
      <div style={layoutStyles.statLabel}>{label}</div>
      <div style={{ color: theme.colors.text, fontSize: 14.5, fontWeight: 700, marginTop: 4, wordBreak: "break-word", overflowWrap: "break-word", fontFamily: theme.mono }}>{value}</div>
    </div>
  );
}

function RequestsTable({ data, loading, actionLoadingId, onApprove, onReject }) {
  if (loading) return <table style={layoutStyles.table} className="sa-table"><tbody><SkeletonRows rows={2} columns={8} /></tbody></table>;
  if (data.length === 0) return <EmptyState text="No pending requests." />;
  return (
    <table style={layoutStyles.table} className="sa-table">
      <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Apartment</Th><Th>City</Th><Th>State</Th><Th>Requested</Th><Th>Actions</Th></tr></thead>
      <tbody>
        {data.map((a, i) => (
          <AnimatedRow key={a.id} index={i}>
            <Td>{a.fullName}</Td><Td>{a.email}</Td><Td>{a.phoneNumber}</Td><Td>{a.apartmentName}</Td>
            <Td>{a.city}</Td><Td>{a.state}</Td><Td>{new Date(a.createdAt).toLocaleString()}</Td>
            <Td>
              <button disabled={actionLoadingId === a.id} onClick={() => onApprove(a.id)} style={{ ...layoutStyles.btnSuccess, marginRight: 6 }} className="sa-btn-success">Approve</button>
              <button disabled={actionLoadingId === a.id} onClick={() => onReject(a.id)} style={layoutStyles.btnDanger} className="sa-btn-danger">Reject</button>
            </Td>
          </AnimatedRow>
        ))}
      </tbody>
    </table>
  );
}

function PlaceholderSection({ title, eyebrow }) {
  return (<><SectionTitle text={title} eyebrow={eyebrow} /><Panel title={title}><EmptyState text={`${title} module coming soon.`} /></Panel></>);
}
function SectionTitle({ text, eyebrow }) {
  return (
    <div style={layoutStyles.sectionTitleWrap}>
      <div>
        {eyebrow && <div style={layoutStyles.sectionEyebrow} className="sa-eyebrow">{eyebrow}</div>}
        <h1 style={layoutStyles.sectionTitle} className="sa-heading">{text}</h1>
      </div>
    </div>
  );
}
const SA_STAT_COLOR_CLASS = { purple: "sa-stat-purple", blue: "sa-stat-blue", amber: "sa-stat-amber", green: "sa-stat-green" };
function StatCard({ label, value, highlight, color, icon }) {
  const colorClass = color ? SA_STAT_COLOR_CLASS[color] : "";
  return (
    <div style={layoutStyles.statCard} className={`sa-stat-card ${colorClass}`}>
      {icon && <div className="sa-stat-icon">{icon}</div>}
      <div style={layoutStyles.statLabel} className="sa-stat-label">{label}</div>
      <div style={{ ...layoutStyles.statValue, color: highlight && !color ? theme.colors.warning : undefined }} className="sa-heading sa-stat-value">
        <CountUp value={value} />
      </div>
    </div>
  );
}
function Panel({ title, children }) {
  return (<div style={layoutStyles.panel} className="anim-card sa-panel"><div style={layoutStyles.panelHeader} className="sa-panel-header">{title}</div><div style={layoutStyles.panelBody}>{children}</div></div>);
}
function EmptyState({ text }) { return <div style={layoutStyles.emptyState}>{text}</div>; }
function Th({ children }) { return <th style={layoutStyles.th}>{children}</th>; }
function Td({ children }) { return <td style={layoutStyles.td}>{children}</td>; }
function Badge({ status }) {
  return <span style={{ padding: "3px 10px", borderRadius: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, fontFamily: theme.mono, ...StatusBadge({ status }) }}>{status}</span>;
}
function HydroLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke="#ffffff" strokeWidth="2" />
      <path d="M24 12 C24 12 14 25 14 32 A10 10 0 0 0 34 32 C34 25 24 12 24 12Z" fill="#ffffff" />
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

const styles = {
  subTabRow: { display: "flex", gap: 4, marginBottom: 22, borderBottom: `1px solid ${theme.colors.border}` },
  subTabActive: {
    background: "transparent", border: "none", borderBottom: `2px solid ${theme.colors.primary}`,
    color: theme.colors.primary, fontWeight: 700, fontSize: 13, padding: "10px 14px",
    cursor: "pointer", fontFamily: "inherit",
  },
  subTabInactive: {
    background: "transparent", border: "none", borderBottom: "2px solid transparent",
    color: theme.colors.textMuted, fontWeight: 600, fontSize: 13, padding: "10px 14px",
    cursor: "pointer", fontFamily: "inherit",
  },
};