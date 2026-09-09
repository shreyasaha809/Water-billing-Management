import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { theme } from "../theme";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelector from "../components/LanguageSelector";
import { FacebookIcon, TwitterIcon, GoogleIcon } from "./socialIcons";
import authBg from "../assets/auth-water-bg.png";
import { useToast } from "../context/ToastContext";

const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "apartmentName", label: "Apartment Name", type: "text" },
  { name: "apartmentAddress", label: "Apartment Address", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "pinCode", label: "PIN Code", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phoneNumber", label: "Phone Number", type: "text" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
];

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const styles = buildStyles(isDark);

  const [form, setForm] = useState({
    fullName: "", apartmentName: "", apartmentAddress: "",
    city: "", state: "", pinCode: "", email: "",
    phoneNumber: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/register/apartment-admin", form);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.fieldErrors) setErrors(err.response.data.fieldErrors);
      else toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = (e) => {
    e.preventDefault();
    setFadeOut(true);
    setTimeout(() => navigate("/login"), 220);
  };

  return (
    <div style={{ ...styles.authPage, opacity: fadeOut ? 0 : 1, transition: "opacity 0.2s ease" }}>
      <div style={styles.pageBg} />
      <div style={styles.pageOverlay} />

      <div style={styles.card}>
        {/* Left — brand panel (same water image, darkened) */}
        <div style={styles.left}>
          <div style={styles.leftBg} />
          <div style={styles.leftOverlay} />
          <div style={styles.leftContent}>
            <div style={styles.brandRow}>
              <div style={styles.logoCircle}>
                <DropIcon />
              </div>
              <span style={styles.brandText}>HydroHome</span>
            </div>

            <h1 style={styles.headline}>Turning Every Drop<br />into Smart Decisions.</h1>
            <p style={styles.subheadline}>
              Experience effortless water management with real-time monitoring and transparent billing.
            </p>

            <div style={styles.statsRow}>
              <div style={styles.miniStat}>
                <div style={styles.miniStatValue}>Real-time</div>
                <div style={styles.miniStatLabel}>Usage Tracking</div>
              </div>
              <div style={styles.miniStatDivider} />
              <div style={styles.miniStat}>
                <div style={styles.miniStatValue}>Automated</div>
                <div style={styles.miniStatLabel}>Bill Generation</div>
              </div>
            </div>
          </div>
          <div style={styles.themeToggleDock}>
            <LanguageSelector variant="dark" />
            <ThemeToggle />
          </div>
        </div>

        {/* Right — sign up form */}
        <div style={styles.right}>
          <div style={styles.panelInner}>
            <div style={styles.formCard} className="anim-page">
              <h2 style={styles.formTitle}>Create Your Account</h2>
              <p style={styles.formSubtitle}>Register as an Apartment Admin</p>

              <form onSubmit={handleSubmit}>
                <div style={styles.grid}>
                  {FIELDS.map((field) => (
                    <div key={field.name} style={{ marginBottom: 2 }}>
                      <label style={styles.label}>{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        style={styles.input}
                        className="auth-input-underline"
                      />
                      {errors[field.name] && (
                        <div style={styles.fieldError}>{errors[field.name]}</div>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Submitting..." : "Register"}
                </button>
              </form>

              <p style={styles.footerText}>
                Already have an account?{" "}
                <a href="/login" onClick={goToLogin} style={styles.link}>Login</a>
              </p>
            </div>

            {/* Divider */}
            <div style={styles.dividerCol}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerLabel}>OR</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Social sign-up (visual only — no social login configured yet) */}
            <div style={styles.socialCol}>
              <button type="button" title="Coming soon" style={{ ...styles.socialBtn, background: "#1877F2" }}>
                <FacebookIcon />
              </button>
              <button type="button" title="Coming soon" style={{ ...styles.socialBtn, background: "#1DA1F2" }}>
                <TwitterIcon />
              </button>
              <button type="button" title="Coming soon" style={{ ...styles.socialBtn, background: isDark ? "#1c2333" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${theme.colors.border}` }}>
                <GoogleIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.brandBadge}>
        <DropIcon size={13} />
        <span>HydroHome · Secure Access</span>
      </div>
    </div>
  );
}

function DropIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z" />
    </svg>
  );
}

function buildStyles(isDark) {
  return {
    authPage: {
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: theme.font, padding: 28, boxSizing: "border-box",
      position: "relative", overflow: "hidden",
    },
    pageBg: {
      position: "absolute", inset: 0,
      backgroundImage: `url(${authBg})`, backgroundSize: "cover", backgroundPosition: "center",
      filter: "brightness(1.05) saturate(0.95)",
      zIndex: 0,
    },
    pageOverlay: {
      position: "absolute", inset: 0,
      background: "linear-gradient(135deg, rgba(4,12,24,0.5) 0%, rgba(4,12,24,0.62) 100%)",
      zIndex: 0,
    },
    card: {
      display: "flex", width: "100%", maxWidth: 1220, maxHeight: "92vh",
      borderRadius: 28, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
      position: "relative", zIndex: 2,
    },

    left: {
      flex: 1, position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 60,
    },
    leftBg: {
      position: "absolute", inset: 0,
      backgroundImage: `url(${authBg})`, backgroundSize: "cover", backgroundPosition: "left center",
      filter: "brightness(1.0) saturate(0.95)",
    },
    leftOverlay: {
      position: "absolute", inset: 0,
      background: "linear-gradient(165deg, rgba(10,26,46,0.4) 0%, rgba(5,16,30,0.62) 100%)",
    },
    leftContent: { position: "relative", zIndex: 2, maxWidth: 420 },
    brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 48 },
    logoCircle: {
      width: 50, height: 50, borderRadius: 14,
      background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    brandText: { fontSize: 25, fontWeight: 800, color: "#fff", letterSpacing: -0.4 },
    headline: { fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5, margin: 0, textShadow: "0 2px 18px rgba(0,0,0,0.35)" },
    subheadline: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginTop: 20, maxWidth: 380, textShadow: "0 1px 12px rgba(0,0,0,0.3)" },
    statsRow: { display: "flex", alignItems: "center", gap: 24, marginTop: 48 },
    miniStat: {},
    miniStatValue: { fontSize: 20, fontWeight: 800, color: "#fff" },
    miniStatLabel: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, fontWeight: 500 },
    miniStatDivider: { width: 1, height: 36, background: "rgba(255,255,255,0.22)" },

    right: {
      flex: 1.5,
      background: isDark ? "rgba(7,12,22,0.97)" : "#f8f6f1",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 32px", overflowY: "auto", position: "relative",
    },
    themeToggleDock: { position: "absolute", top: 24, right: 24, zIndex: 5, display: "flex", alignItems: "center", gap: 10 },

    panelInner: { display: "flex", alignItems: "flex-start", gap: 24, width: "100%", maxWidth: 600 },
    formCard: { flex: 1, minWidth: 0 },
    formTitle: { fontSize: 26, fontWeight: 800, color: isDark ? "#fff" : theme.colors.text, margin: 0, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.55)" : theme.colors.textMuted, marginTop: 8, marginBottom: 8 },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0 18px",
    },
    label: {
      display: "block", fontSize: 11.5, fontWeight: 600, marginBottom: 8, marginTop: 22,
      textTransform: "uppercase", letterSpacing: 0.5,
      color: isDark ? "rgba(255,255,255,0.55)" : theme.colors.textMuted,
    },
    input: {
      width: "100%", padding: "10px 2px", borderRadius: 0,
      border: "none",
      borderBottom: isDark ? "1px solid rgba(255,255,255,0.22)" : `1px solid ${theme.colors.borderStrong}`,
      fontSize: 14.5, outline: "none",
      boxSizing: "border-box",
      color: isDark ? "#fff" : theme.colors.text,
      background: "transparent",
      transition: "border-color 0.15s ease",
    },
    fieldError: { color: isDark ? "#fca5a5" : theme.colors.danger, fontSize: 11.5, marginTop: 5, fontWeight: 500 },
    submitBtn: {
      width: "100%", marginTop: 32, padding: "13px 0", borderRadius: 10, border: "none",
      background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#04101f", fontWeight: 700, fontSize: 14.5,
      cursor: "pointer", boxShadow: "0 12px 28px rgba(14,165,233,0.35)",
      transition: "transform 0.15s ease, filter 0.15s ease",
    },
    footerText: { marginTop: 24, fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.5)" : theme.colors.textMuted, textAlign: "center" },
    link: { color: isDark ? "#7dd3fc" : theme.colors.primary, fontWeight: 600, textDecoration: "none" },

    dividerCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, alignSelf: "stretch", minHeight: 380 },
    dividerLine: { flex: 1, width: 1, background: isDark ? "rgba(255,255,255,0.16)" : theme.colors.border },
    dividerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: isDark ? "rgba(255,255,255,0.4)" : theme.colors.textFaint },

    socialCol: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 },
    socialBtn: {
      width: 40, height: 40, borderRadius: "50%", border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    },

    brandBadge: {
      position: "fixed", left: 28, bottom: 22, zIndex: 5,
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(5,10,20,0.55)", backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999,
      padding: "8px 14px", color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 600,
    },
  };
}
