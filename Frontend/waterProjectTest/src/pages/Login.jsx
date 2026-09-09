import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { theme } from "../theme";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelector from "../components/LanguageSelector";
import { FacebookIcon, TwitterIcon, GoogleIcon } from "./socialIcons";
import authBg from "../assets/auth-water-bg.png";

export default function Login() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const styles = buildStyles(isDark);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const goToRegister = (e) => {
    e.preventDefault();
    setFadeOut(true);
    setTimeout(() => navigate("/register"), 220);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { token, role, fullName, userId } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("userId", userId);

      if (role === "SUPER_ADMIN") navigate("/dashboard/super-admin");
      else if (role === "APARTMENT_ADMIN") navigate("/dashboard/apartment-admin");
      else navigate("/dashboard/household-user");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.authPage, opacity: fadeOut ? 0 : 1, transition: "opacity 0.2s ease" }} className="anim-page">
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

        {/* Right — sign in form */}
        <div style={styles.right}>
          <div style={styles.panelInner}>
            <div className="anim-page" style={{ ...styles.formCard, animationDelay: "0.1s" }}>
              <h2 style={styles.formTitle}>Welcome back</h2>
              <p style={styles.formSubtitle}>Sign in to manage your water account</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                  className="auth-input-underline"
                  required
                />

                <label style={styles.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...styles.input, paddingRight: 30 }}
                    className="auth-input-underline"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                    {showPw ? <EyeOffIcon isDark={isDark} /> : <EyeIcon isDark={isDark} />}
                  </button>
                </div>

                {error && (
                  <div style={styles.errorBox}>
                    <AlertIcon />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p style={styles.footerText}>
                New Apartment Admin?{" "}
                <a href="/register" onClick={goToRegister} style={styles.link}>Create an account</a>
              </p>
            </div>

            {/* Divider */}
            <div style={styles.dividerCol}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerLabel}>OR</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Social sign-in (visual only — no social login configured yet) */}
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
function EyeIcon({ isDark }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.55)" : theme.colors.textFaint} strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon({ isDark }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.55)" : theme.colors.textFaint} strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a18.5 18.5 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 7 11 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
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
      display: "flex", width: "100%", maxWidth: 1140, minHeight: 620,
      borderRadius: 28, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.38)",
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
      width: 36, height: 36, borderRadius: 10,
      background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    brandText: { fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: -0.3 },
    headline: { fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5, margin: 0, textShadow: "0 2px 18px rgba(0,0,0,0.35)" },
    subheadline: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginTop: 20, maxWidth: 380, textShadow: "0 1px 12px rgba(0,0,0,0.3)" },
    statsRow: { display: "flex", alignItems: "center", gap: 24, marginTop: 48 },
    miniStat: {},
    miniStatValue: { fontSize: 20, fontWeight: 800, color: "#fff" },
    miniStatLabel: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, fontWeight: 500 },
    miniStatDivider: { width: 1, height: 36, background: "rgba(255,255,255,0.22)" },

    right: {
      flex: 1.15,
      background: isDark ? "rgba(18,25,40,0.97)" : "#fbfaf7",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
      position: "relative",
    },
    themeToggleDock: { position: "absolute", top: 24, right: 24, zIndex: 5, display: "flex", alignItems: "center", gap: 10 },

    panelInner: { display: "flex", alignItems: "center", gap: 24, width: "100%", maxWidth: 460 },
    formCard: { flex: 1, minWidth: 0 },
    formTitle: { fontSize: 26, fontWeight: 800, color: isDark ? "#fff" : theme.colors.text, margin: 0, letterSpacing: -0.5 },
    formSubtitle: { fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.55)" : theme.colors.textMuted, marginTop: 8, marginBottom: 8 },
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
    eyeBtn: {
      position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
      background: "transparent", border: "none", cursor: "pointer", padding: 4,
      display: "flex", alignItems: "center",
    },
    errorBox: {
      display: "flex", alignItems: "center", gap: 8,
      background: isDark ? "rgba(239,68,68,0.12)" : theme.colors.dangerLight,
      border: isDark ? "1px solid rgba(239,68,68,0.35)" : "1px solid #fecaca",
      borderRadius: 8, padding: "10px 12px", marginTop: 18,
      color: isDark ? "#fca5a5" : theme.colors.danger, fontSize: 12.5, fontWeight: 500,
    },
    submitBtn: {
      width: "100%", marginTop: 30, padding: "13px 0", borderRadius: 10, border: "none",
      background: "linear-gradient(135deg, #38bdf8, #0284c7)", color: "#04101f", fontWeight: 700, fontSize: 14.5,
      cursor: "pointer", boxShadow: "0 12px 28px rgba(14,165,233,0.35)",
      transition: "transform 0.15s ease, filter 0.15s ease",
    },
    footerText: { marginTop: 26, fontSize: 13.5, color: isDark ? "rgba(255,255,255,0.5)" : theme.colors.textMuted, textAlign: "center" },
    link: { color: isDark ? "#7dd3fc" : theme.colors.primary, fontWeight: 600, textDecoration: "none" },

    dividerCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, alignSelf: "stretch" },
    dividerLine: { flex: 1, width: 1, background: isDark ? "rgba(255,255,255,0.16)" : theme.colors.border },
    dividerLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: isDark ? "rgba(255,255,255,0.4)" : theme.colors.textFaint },

    socialCol: { display: "flex", flexDirection: "column", gap: 14 },
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
