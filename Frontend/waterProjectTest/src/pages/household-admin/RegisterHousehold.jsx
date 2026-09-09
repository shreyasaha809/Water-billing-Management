import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { theme, layoutStyles } from "../../theme";
import { useToast } from "../../context/ToastContext";
import "../dashboards/apartmentAdminDashboard.css";

const IDENTITY_FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", icon: "👤", placeholder: "e.g. John Doe" },
  { name: "email", label: "Email Address", type: "email", icon: "✉️", placeholder: "resident@example.com" },
  { name: "phoneNumber", label: "Phone Number", type: "text", icon: "📞", placeholder: "10-digit mobile number" },
];

const HOUSEHOLD_FIELDS = [
  { name: "flatNumber", label: "Flat / House Number", type: "text", icon: "🏠", placeholder: "e.g. B-204" },
];

const SECURITY_FIELDS = [
  { name: "password", label: "Temporary Password", type: "password", icon: "🔒", placeholder: "Resident can change this later" },
];

export default function RegisterHousehold() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phoneNumber: "", flatNumber: "", password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/apartment-admin/households", form);
      toast.success(res.data.message);
      navigate("/dashboard/apartment-admin/households/list");
    } catch (err) {
      if (err.response?.data?.fieldErrors) setErrors(err.response.data.fieldErrors);
      else toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => (
    <div key={field.name} className="aa-field-highlight" style={{ marginBottom: 14 }}>
      <label style={layoutStyles.label}>{field.icon} {field.label}</label>
      <input
        type={field.type}
        name={field.name}
        value={form[field.name]}
        onChange={handleChange}
        style={layoutStyles.input}
        className="aa-input"
        placeholder={field.placeholder}
        required
      />
      {errors[field.name] && (
        <div style={{ color: theme.colors.danger, fontSize: 11, marginTop: 6, fontWeight: 600 }}>
          {errors[field.name]}
        </div>
      )}
    </div>
  );

  return (
    <div style={layoutStyles.page}>
      <div style={styles.topBar}>
        <button onClick={() => navigate("/dashboard/apartment-admin")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <div style={styles.logoBlock}>
          <span style={styles.brandText}>HydroHome</span>
          <HydroLogo />
        </div>
      </div>

      <div style={styles.body}>
        <h1 style={styles.pageTitle}>Register Household User</h1>
        <p style={styles.pageSubtitle}>Add a new resident to your apartment</p>

        <div style={styles.card} className="aa-panel">
          <form onSubmit={handleSubmit}>
            <div style={styles.sectionLabel}>Resident Information</div>
            {IDENTITY_FIELDS.map(renderField)}

            <div style={styles.sectionLabel}>Household Details</div>
            {HOUSEHOLD_FIELDS.map(renderField)}

            <div style={styles.sectionLabel}>Account Security</div>
            {SECURITY_FIELDS.map(renderField)}

            <button
              type="submit"
              disabled={loading}
              style={{ ...layoutStyles.btnPrimary, width: "100%", marginTop: 22, padding: "13px 0", fontSize: 14.5 }}
              className="aa-btn-primary"
            >
              {loading ? "Registering..." : "Register Household User →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function HydroLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke="#ffffff" strokeWidth="2" />
      <path d="M24 12 C24 12 14 25 14 32 A10 10 0 0 0 34 32 C34 25 24 12 24 12Z" fill="#ffffff" />
    </svg>
  );
}

const styles = {
 topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    background: theme.colors.headerBg,
    boxShadow: "0 2px 8px rgba(30,58,138,0.2)",
  },
  backBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  logoBlock: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  body: {
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.colors.text,
    margin: 0,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
  },
  card: {
    width: 480,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(8,145,178,0.08)",
    padding: "32px 32px 36px 32px",
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: 800,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 12,
  },
};