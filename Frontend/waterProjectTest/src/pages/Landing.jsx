import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { theme } from "../theme";
import AiAssistant from "../components/AiAssistant";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";
import heroDropPhoto from "../assets/hero-water-drop.png";
import { useToast } from "../context/ToastContext";
import { FacebookIcon, TwitterIcon, LinkedInIcon, GithubIcon, InstagramIcon, XIcon } from "./socialIcons";

// Scoped to the Landing Page only — premium display font + hover/motion
// states that inline styles can't express (button hovers, nav-link hovers,
// the flowing-water background animation, glass header on scroll).
// Nothing here touches index.css or any other page/component.
const LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.hh-landing { font-family: 'Plus Jakarta Sans', ${theme.font}; }
.hh-landing h1, .hh-landing h2, .hh-landing .hh-display { font-family: 'Sora', 'Plus Jakarta Sans', sans-serif; }

.hh-navbar-glass {
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.hh-nav-link { position: relative; transition: color 0.2s ease; }
.hh-nav-link::after {
  content: ""; position: absolute; left: 0; bottom: -4px; width: 0; height: 2px;
  background: #1d4ed8; transition: width 0.25s ease;
}
.hh-nav-link:hover { color: #0b2c40 !important; }
.hh-nav-link:hover::after { width: 100%; }

.hh-btn-primary { transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease; }
.hh-btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 34px rgba(29,78,216,0.32); }
.hh-btn-primary:active { transform: translateY(0) scale(0.99); }

.hh-btn-ghost { transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), background 0.22s ease, border-color 0.22s ease; }
.hh-btn-ghost:hover { transform: translateY(-2px); background: rgba(29,78,216,0.08); border-color: rgba(11,44,64,0.4); }
.hh-btn-ghost:active { transform: translateY(0); }

.hh-feature-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
.hh-feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(29,78,216,0.14); border-color: rgba(29,78,216,0.3); }

.hh-social-btn { transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease; }
.hh-social-btn:hover { transform: translateY(-2px) scale(1.06); box-shadow: 0 10px 22px rgba(29,78,216,0.3); filter: brightness(1.08); }

.hh-contact-input { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
.hh-contact-input:focus { outline: none; border-color: #1d4ed8 !important; box-shadow: 0 0 0 3.5px rgba(29,78,216,0.14); }

@media (max-width: 760px) {
  .hh-contact-grid { grid-template-columns: 1fr !important; }
}

/* Flowing water background — three slow-drifting radial layers */
@keyframes hhFlowA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%, -4%) scale(1.08); } }
@keyframes hhFlowB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-4%, 3%) scale(1.1); } }
@keyframes hhFlowC { 0%,100% { opacity: 0.5; } 50% { opacity: 0.9; } }
.hh-flow-a { animation: hhFlowA 16s ease-in-out infinite; }
.hh-flow-b { animation: hhFlowB 20s ease-in-out infinite; }
.hh-flow-c { animation: hhFlowC 10s ease-in-out infinite; }

/* Diagonal reflection sweep across the hero, like light on water */
@keyframes hhReflectionSweep {
  0% { transform: translateX(-40%) skewX(-12deg); opacity: 0; }
  15% { opacity: 0.35; }
  50% { opacity: 0.15; }
  100% { transform: translateX(140%) skewX(-12deg); opacity: 0; }
}
.hh-reflection {
  position: absolute; top: -20%; left: 0; width: 22%; height: 140%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.16), transparent);
  animation: hhReflectionSweep 7s ease-in-out infinite;
  pointer-events: none;
}

@keyframes hhDriftUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-90vh) translateX(12px); opacity: 0; }
}
.hh-drift { position: absolute; bottom: -20px; border-radius: 50%; pointer-events: none; animation: hhDriftUp linear infinite; }
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.page} className="hh-landing">
      <style>{LANDING_CSS}</style>

      {/* ===== Fixed glassmorphic navbar — never moves on scroll ===== */}
      <nav style={styles.navbar} className="hh-navbar-glass">
        <div style={styles.navBrand}>
          <DropIcon color="#1d4ed8" />
          <span style={styles.navBrandText} className="hh-display">HydroHome</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink} className="hh-nav-link">Features</a>
          <a href="#how-it-works" style={styles.navLink} className="hh-nav-link">How It Works</a>
          <a href="#services" style={styles.navLink} className="hh-nav-link">Services</a>
          <a href="#contact" style={styles.navLink} className="hh-nav-link">Contact</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <LanguageSelector variant="light" />
          <button onClick={() => navigate("/login")} style={styles.navBtnGhost} className="hh-btn-ghost">Login</button>
          <button onClick={() => navigate("/register")} style={styles.navBtnFilled} className="hh-btn-primary">Register</button>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section style={styles.hero}>
        {/* layered flowing-water backdrop */}
        <span className="hh-flow-a" style={styles.flowLayerA} />
        <span className="hh-flow-b" style={styles.flowLayerB} />
        <span className="hh-flow-c" style={styles.flowLayerC} />
        <div className="hh-reflection" />
        <WaterParticles />
        <FloatingBubbles />

        {/* Two-column hero: copy on the left, live water-drop visual on the right */}
        <div style={styles.heroCenter}>
          <div style={styles.heroLeft}>
            <div className="float-slower" style={styles.heroOrbDock}>
              <LiveWaterOrb small />
            </div>
            <h1 style={styles.heroWordmark} className="hh-display">HydroHome</h1>
            <p style={styles.heroKicker}>Smart water infrastructure for modern apartments</p>
            <h2 style={styles.heroTagline} className="hh-display">
              Clean, transparent, and always on —<br />water you can finally see.
            </h2>
            <p style={styles.heroSubtext}>
              Track daily usage, generate transparent bills, and keep every household
              connected — all from one intelligent platform built for apartments.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")} style={styles.heroBtnPrimary} className="hh-btn-primary">Get Started →</button>
              <button onClick={() => navigate("/login")} style={styles.heroBtnGhost} className="hh-btn-ghost">Resident Login</button>
            </div>
          </div>

         <div style={styles.heroRight}>
            <img src={heroDropPhoto} alt="Water droplet falling into still water" style={styles.heroPhoto} />
          </div>
           </div>

        {/* Bottom scroll cue */}
        <div style={styles.heroBottomDock}>
          <div style={styles.scrollCue}><ChevronDownIcon /></div>
        </div>

        <HeroWaves />
      </section>

      {/* Curved white transition, overlapping the hero like the reference */}
      <div style={styles.heroCurve} />

      {/* Stats / Trust bar */}
      <section style={styles.statsSection}>
        <div style={styles.statsHeading}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.colors.text, margin: 0 }}>
            Built for Apartments,<br />Trusted by Residents
          </h2>
        </div>
        <div style={styles.statsGrid}>
          <StatFeature icon={<DropletIcon />} title="Real-Time Tracking" />
          <StatFeature icon={<GaugeSmallIcon />} title="Automated Billing" />
          <StatFeature icon={<ShieldIcon />} title="24/7 Monitoring" />
          <StatFeature icon={<BellIcon />} title="Smart Leak Alerts" />
        </div>
      </section>

      {/* Feature deep-dive */}
      <section id="features" style={styles.featureSection}>
        <div style={styles.featureVisual}>
          <WaterGlassIllustration />
        </div>
        <div style={styles.featureText}>
          <span style={styles.eyebrow}>— Real Insights, Real Fast!</span>
          <h2 style={styles.featureTitle}>
            Complete Visibility Into Your Water Consumption
          </h2>
          <p style={styles.featureBody}>
            HydroHome connects meter readings, tiered tariffs, and household billing
            into one seamless system — giving apartment admins full control and
            residents complete transparency.
          </p>
          <div style={{ display: "flex", gap: 32, marginTop: 24 }}>
            <MiniFeature icon="📊" title="Usage Trends" desc="Daily & monthly charts" />
            <MiniFeature icon="🧾" title="Instant Invoices" desc="Downloadable PDF bills" />
          </div>
          <button onClick={() => navigate("/register")} style={{ ...styles.heroBtnPrimary, marginTop: 28 }}>
            Learn More →
          </button>
        </div>
      </section>

      {/* Full feature grid */}
      <section style={styles.featureGridSection}>
        <span style={styles.eyebrowCenter}>— Platform Capabilities —</span>
        <h2 style={styles.servicesTitle}>Everything You Need, Built In</h2>
        <div style={styles.featureGrid}>
          <FeatureCard icon="💧" title="Real-Time Water Usage Monitoring" desc="Track meter readings as they're logged, per household or across the whole community." />
          <FeatureCard icon="💳" title="Smart Billing System" desc="Tiered tariffs, automated invoice generation, and clear, itemized bills every cycle." />
          <FeatureCard icon="📈" title="Consumption Analytics" desc="Interactive charts reveal usage trends, peaks, and seasonal patterns at a glance." />
          <FeatureCard icon="🚨" title="Leak Detection Alerts" desc="Unusual consumption spikes trigger instant alerts before they become costly problems." />
          <FeatureCard icon="⚖️" title="Household Usage Comparison" desc="See how each household stacks up against the community average, fairly and transparently." />
          <FeatureCard icon="🤖" title="AI Chatbot Assistance" desc="An always-on assistant answers billing and usage questions instantly, day or night." />
          <FeatureCard icon="🌐" title="Multilingual Support" desc="Switch languages instantly so every resident can use the platform comfortably." />
          <FeatureCard icon="🔒" title="Secure Login" desc="Role-based access keeps admin, resident, and management data properly protected." />
          <FeatureCard icon="🔔" title="Notifications & Alerts" desc="Timely updates on bills, tickets, and announcements — never miss what matters." />
          <FeatureCard icon="🌱" title="Water Conservation Insights" desc="Personalized tips and seasonal recommendations help every household save more." />
        </div>
      </section>

      {/* Counters */}
      <section style={styles.countersSection}>
        <Counter icon="🏢" value="120+" label="Apartments Onboarded" />
        <Counter icon="👨‍👩‍👧" value="4,500+" label="Households Served" />
        <Counter icon="💧" value="2.1M L" label="Water Tracked Monthly" />
        <Counter icon="⚡" value="99.9%" label="Uptime" />
      </section>

      {/* Services */}
      <section id="services" style={styles.servicesSection}>
        <span style={styles.eyebrowCenter}>— Our Services —</span>
        <h2 style={styles.servicesTitle}>Everything Your Apartment Needs</h2>
        <div style={styles.servicesGrid}>
          <ServiceCard icon="💧" title="Usage Tracking" desc="Daily meter readings tracked per household with full history." />
          <ServiceCard icon="💳" title="Smart Billing" desc="Tiered tariffs, automated invoices, and online/cash payments." />
          <ServiceCard icon="🚛" title="Purchase Records" desc="Track municipal supply and tanker deliveries with cost breakdown." />
        </div>
      </section>

      {/* CTA footer */}
      <section style={styles.ctaSection}>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>
          Ready to modernize your apartment's water management?
        </h2>
        <button onClick={() => navigate("/register")} style={styles.ctaBtn}>
          Register Your Apartment →
        </button>
      </section>

      {/* Contact */}
      <ContactSection />

      <footer style={styles.footer}>
        <span>© 2026 HydroHome. All rights reserved.</span>
      </footer>

      <AiAssistant role="PUBLIC" onNavigate={null} />
    </div>
  );
}

/* Rising water-particle drift, layered behind the hero content */
function WaterParticles() {
  const particles = [
    { left: "8%", size: 6, delay: "0s", dur: "9s" },
    { left: "18%", size: 4, delay: "2s", dur: "11s" },
    { left: "30%", size: 8, delay: "1s", dur: "13s" },
    { left: "48%", size: 5, delay: "3.5s", dur: "10s" },
    { left: "62%", size: 7, delay: "0.5s", dur: "12s" },
    { left: "76%", size: 4, delay: "4s", dur: "9.5s" },
    { left: "88%", size: 6, delay: "2.5s", dur: "14s" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="hh-drift"
          style={{
            left: p.left, width: p.size, height: p.size,
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(160,220,255,0.15))",
            animationDelay: p.delay, animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Small components ---------- */

function StatFeature({ icon, title }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {icon}
      <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text, textAlign: "center" }}>{title}</span>
    </div>
  );
}

function MiniFeature({ icon, title, desc }) {
  return (
    <div>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text, marginTop: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{desc}</div>
    </div>
  );
}

function Counter({ icon, value, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.colors.primary }}>{value}</div>
        <div style={{ fontSize: 11.5, color: theme.colors.textMuted }}>{label}</div>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <div style={styles.serviceCard}>
      <div style={{ fontSize: 30 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: theme.colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={styles.featureCard} className="hh-feature-card">
      <div style={styles.featureCardIcon}>{icon}</div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: theme.colors.text, marginTop: 14 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: theme.colors.textMuted, marginTop: 8, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

const SOCIAL_LINKS = [
  { icon: <GithubIcon size={17} />, label: "GitHub", href: "https://github.com" },
  { icon: <LinkedInIcon size={17} />, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: <XIcon size={16} />, label: "X (Twitter)", href: "https://x.com" },
  { icon: <FacebookIcon size={17} />, label: "Facebook", href: "https://facebook.com" },
  { icon: <InstagramIcon size={17} />, label: "Instagram", href: "https://instagram.com" },
];

function ContactSection() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warning("Please fill in all fields before sending.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    }, 600);
  };

  return (
    <section id="contact" style={styles.contactSection}>
      <span style={styles.eyebrowCenter}>— Get In Touch —</span>
      <h2 style={styles.servicesTitle}>Contact Us</h2>
      <p style={styles.contactIntro}>
        Questions about HydroHome, onboarding your apartment, or just want to say hello?
        We'd love to hear from you.
      </p>

      <div style={styles.contactGrid} className="hh-contact-grid">
        <div style={styles.contactInfoCol}>
          <ContactInfoCard icon="📞" label="Phone" value="+91 33 400 1234" />
          <ContactInfoCard icon="✉️" label="Email" value="support@hydrohome.app" />
          <ContactInfoCard icon="📍" label="Office" value="221B Sector V,Salt Lake,Kolkata,India" />
          <ContactInfoCard icon="🌐" label="Website" value="www.hydrohome.app" />

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textMuted, marginBottom: 12 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={styles.socialBtn} className="hh-social-btn" aria-label={s.label} title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.contactForm}>
          <label style={styles.contactLabel}>Name</label>
          <input name="name" value={form.name} onChange={handleChange} style={styles.contactInput} className="hh-contact-input" placeholder="Your name" />
          <label style={styles.contactLabel}>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} style={styles.contactInput} className="hh-contact-input" placeholder="you@example.com" />
          <label style={styles.contactLabel}>Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} style={{ ...styles.contactInput, minHeight: 100, fontFamily: "inherit", resize: "vertical" }} className="hh-contact-input" placeholder="How can we help?" />
          <button type="submit" disabled={sending} style={{ ...styles.heroBtnPrimary, marginTop: 6, alignSelf: "flex-start" }} className="hh-btn-primary">
            {sending ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </div>
    </section>
  );
}

function ContactInfoCard({ icon, label, value }) {
  return (
    <div style={styles.contactInfoCard}>
      <div style={styles.contactInfoIcon}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.colors.text, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

/* ---------- Icons (original, inline SVG) ---------- */

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DropIcon({ color = "#fff", size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z" />
    </svg>
  );
}
function DropletIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2"><path d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z" /></svg>;
}
function GaugeSmallIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 12L16 8" /></svg>;
}
function ShieldIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /></svg>;
}
function BellIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2"><path d="M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 21a2 2 0 004 0" /></svg>;
}

/* Original illustration — layered droplet, no stock imagery */
function WaterGlassIllustration() {
  return (
    <svg width="100%" viewBox="0 0 320 320" style={{ maxWidth: 320 }}>
      <circle cx="160" cy="160" r="150" fill={theme.colors.primaryLight} />
      <circle cx="160" cy="160" r="110" fill="#dbeafe" />
      <path d="M160 70 C160 70 100 160 100 210 A60 60 0 0 0 220 210 C220 160 160 70 160 70Z" fill={theme.colors.primary} />
      <path d="M160 100 C160 100 130 155 130 190 A30 30 0 0 0 190 190 C190 155 160 100 160 100Z" fill="#60a5fa" opacity="0.6" />
      <circle cx="110" cy="90" r="8" fill={theme.colors.primary} opacity="0.4" />
      <circle cx="230" cy="120" r="6" fill={theme.colors.primary} opacity="0.3" />
      <circle cx="220" cy="240" r="5" fill={theme.colors.primary} opacity="0.4" />
    </svg>
  );
}

/* Animated floating bubbles for hero background */
function FloatingBubbles() {
  const bubbles = [
    { size: 60, left: "8%", delay: "0s", duration: "6s" },
    { size: 30, left: "20%", delay: "1.2s", duration: "8s" },
    { size: 45, left: "80%", delay: "0.5s", duration: "7s" },
    { size: 22, left: "90%", delay: "2s", duration: "5s" },
    { size: 35, left: "60%", delay: "1.5s", duration: "9s" },
    { size: 18, left: "40%", delay: "0.8s", duration: "6.5s" },
  ];
  return (
    <div style={styles.bubbleContainer}>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="hh-bubble"
          style={{
            width: b.size, height: b.size, left: b.left,
            animationDelay: b.delay, animationDuration: b.duration,
          }}
        />
      ))}
    </div>
  );
}

/* Central hero water-drop pulse animation */
function WaterDropAnimation() {
  return (
    <div style={styles.dropWrap}>
      <div className="hh-ripple" style={{ ...styles.ripple, animationDelay: "0s" }} />
      <div className="hh-ripple" style={{ ...styles.ripple, animationDelay: "1s" }} />
      <div className="hh-ripple" style={{ ...styles.ripple, animationDelay: "2s" }} />
      <div style={styles.dropCore}>
        <DropIcon color="#ffffff" size={48} />
      </div>
    </div>
  );
}

/* Layered animated wave strip along the bottom of the hero — pure CSS/SVG,
   no stock imagery. Three staggered wave layers drift at different speeds
   to give the water surface real depth and motion. */
function HeroWaves() {
  const waveSvg = (fill) => (
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'><path d='M0,40 C150,90 350,0 600,45 C850,90 1050,10 1200,50 L1200,120 L0,120 Z' fill='${fill}'/></svg>`
    )}`
  );
  return (
    <div style={styles.wavesWrap} aria-hidden="true">
      <div className="wave-layer" style={{ backgroundImage: `url("${waveSvg("rgba(255,255,255,0.10)")}")`, backgroundRepeat: "repeat-x", backgroundSize: "1200px 100%" }} />
      <div className="wave-layer wave-2" style={{ backgroundImage: `url("${waveSvg("rgba(255,255,255,0.16)")}")`, backgroundRepeat: "repeat-x", backgroundSize: "1200px 100%" }} />
      <div className="wave-layer wave-3" style={{ backgroundImage: `url("${waveSvg("rgba(255,255,255,0.24)")}")`, backgroundRepeat: "repeat-x", backgroundSize: "1200px 100%" }} />
    </div>
  );
}

/* Signature hero visual: a glass water-drop "orb" with a live liquid fill,
   concentric pulse rings, orbiting droplets and a glass shimmer sweep.
   Everything here is generated SVG/CSS — an "alive", moving water effect
   rather than a static picture. */
function LiveWaterOrb({ small = false }) {
  const scale = small ? 0.4 : 1;
  return (
    <div style={{ ...styles.orbWrap, transform: `scale(${scale})`, transformOrigin: "top left" }}>
      {/* concentric pulse rings */}
      <span className="water-ring" style={{ ...styles.orbRing, animationDelay: "0s" }} />
      <span className="water-ring" style={{ ...styles.orbRing, animationDelay: "1.1s" }} />
      <span className="water-ring" style={{ ...styles.orbRing, animationDelay: "2.2s" }} />

      {/* orbiting droplet particles */}
      <span className="float-slow" style={{ ...styles.orbParticle, width: 14, height: 14, top: "6%", left: "12%" }} />
      <span className="float-slower" style={{ ...styles.orbParticle, width: 9, height: 9, top: "18%", right: "8%" }} />
      <span className="float-slow" style={{ ...styles.orbParticle, width: 11, height: 11, bottom: "10%", left: "4%" }} />
      <span className="float-slower" style={{ ...styles.orbParticle, width: 7, height: 7, bottom: "22%", right: "14%" }} />

      {/* the glass droplet itself */}
      <div style={styles.orbGlass} className="glass-shimmer">
        <svg width="180" height="180" viewBox="0 0 200 200">
          <defs>
            <clipPath id="dropClip">
              <path d="M100 14C100 14 42 96 42 132a58 58 0 00116 0C158 96 100 14 100 14z" />
            </clipPath>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfe3ff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <path d="M100 14C100 14 42 96 42 132a58 58 0 00116 0C158 96 100 14 100 14z"
            fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
          <g clipPath="url(#dropClip)">
            <rect x="0" y="86" width="200" height="120" fill="url(#liquidGrad)" opacity="0.9">
              <animate attributeName="y" values="96;84;96" dur="4.5s" repeatCount="indefinite" />
            </rect>
            <path d="M0 90 Q 25 78 50 90 T 100 90 T 150 90 T 200 90 V200 H0 Z" fill="rgba(255,255,255,0.55)">
              <animate attributeName="d" dur="3.2s" repeatCount="indefinite"
                values="M0 90 Q 25 78 50 90 T 100 90 T 150 90 T 200 90 V200 H0 Z;
                        M0 96 Q 25 106 50 96 T 100 96 T 150 96 T 200 96 V200 H0 Z;
                        M0 90 Q 25 78 50 90 T 100 90 T 150 90 T 200 90 V200 H0 Z" />
            </path>
          </g>
        </svg>
      </div>
      <span style={styles.orbRippleLine} />
    </div>
  );
}

/* ---------- Styles ---------- */

const NAVBAR_HEIGHT = 90;

const styles = {
  page: { fontFamily: theme.font, background: theme.colors.bg, overflowX: "hidden" },

  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 22px", background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(15,23,42,0.08)", borderRadius: 20,
    position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)",
    width: "calc(100% - 48px)", maxWidth: 1180, zIndex: 1000, boxSizing: "border-box",
    boxShadow: "0 16px 44px rgba(15,23,42,0.16)",
  },
  navBrand: { display: "flex", alignItems: "center", gap: 8 },
  navBrandText: { fontSize: 18, fontWeight: 700, color: "#0b2c40", letterSpacing: 0.2 },
  navLinks: { display: "flex", gap: 30 },
  navLink: { fontSize: 12.5, fontWeight: 600, color: "rgba(11,44,64,0.68)", textDecoration: "none", letterSpacing: 0.3 },
  navBtnGhost: {
    background: "transparent", border: "1px solid rgba(11,44,64,0.25)", color: "#0b2c40",
    borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  navBtnFilled: {
    background: "linear-gradient(135deg, #1d4ed8, #0891b2)", border: "none", color: "#fff",
    borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },

  hero: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    background: "radial-gradient(ellipse at 50% 0%, #15597a 0%, #0d3c58 42%, #061520 100%)",
    overflow: "hidden",
    minHeight: "100vh",
    height: "100vh",
    boxSizing: "border-box",
    paddingTop: NAVBAR_HEIGHT,
  },
  flowLayerA: {
    position: "absolute", top: "-10%", left: "-10%", width: "60%", height: "70%", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(34,180,220,0.28), transparent 70%)", filter: "blur(10px)", zIndex: 0,
  },
  flowLayerB: {
    position: "absolute", bottom: "-15%", right: "-10%", width: "55%", height: "65%", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(60,120,255,0.22), transparent 70%)", filter: "blur(10px)", zIndex: 0,
  },
  flowLayerC: {
    position: "absolute", top: "20%", right: "15%", width: "35%", height: "40%", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(120,220,255,0.16), transparent 70%)", filter: "blur(14px)", zIndex: 0,
  },
  bubbleContainer: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" },

wavesWrap: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: "-32px",
  height: 96,
  overflow: "hidden",
  pointerEvents: "none",
  zIndex: 5, // raised above heroCenter (3) and heroRight (1) so it always overlays the image
},

  heroCenter: {
    position: "relative",
    zIndex: 3,
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "60px 40px 100px 64px",
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
    flexWrap: "wrap",
  },

  heroLeft: { flex: "1 1 440px", textAlign: "left", maxWidth: 600 },
 heroRight: {
  position: "absolute",
  top: "-79px",
  right: "-5%",      // was "-8%" — more buffer so the right fade isn't cut short
  width: "40%",       // was "50%" — wider to accommodate the extra buffer
  height: "106%",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "stretch",
  overflow: "hidden",
  zIndex: 1,
},
  // Tight-cropped dock: the icon is rendered at full size then cropped down
  // to exactly this box (top-left transform-origin), so it lands precisely
  // above the "H" instead of floating centered over the whole wordmark.
  heroOrbDock: { width: 72, height: 72, overflow: "hidden", marginBottom: -6 },
  heroWordmark: {
    fontSize: "clamp(36px, 4.8vw, 60px)", fontWeight: 800, letterSpacing: 3, color: "transparent",
    WebkitTextStroke: "1.2px rgba(255,255,255,0.8)", textTransform: "uppercase", margin: "0",
    textShadow: "0 0 30px rgba(103,196,255,0.3)",
  },
  heroKicker: { fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.6, marginTop: 6 },
  heroTagline: { fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 700, color: "#ffffff", lineHeight: 1.3, marginTop: 12, letterSpacing: -0.3 },
  heroSubtext: { fontSize: 16.5, color: "rgba(255,255,255,0.72)", marginTop: 10, lineHeight: 1.6, maxWidth: 520 },

  // Left-to-right fade instead of a circular vignette — the photo reads as
  // one continuous surface with the dark hero background, exactly like the
  // reference, rather than an inserted circular cutout.
heroPhoto: {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
  objectPosition: "center center",
  marginRight: 0,

  maskImage:
    "linear-gradient(90deg, transparent 0%, black 45%, black 88%, transparent 100%), linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent 0%, black 45%, black 88%, transparent 100%), linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",

  opacity: 1,
},

  heroBtnPrimary: {
    background: "#fff", color: "#0b2c40", border: "none", borderRadius: 10,
    padding: "13px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
  heroBtnGhost: {
    background: "rgba(8,22,40,0.55)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: 10, padding: "13px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },

  heroBottomDock: {
    position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center",
    gap: 14, paddingBottom: 26,
  },
  scrollCue: {
    width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.8)",
  },

  heroCurve: {
    position: "relative",
    marginTop: 0,
    height: 10,
    borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
    background: theme.colors.bg,
    zIndex: 4,
  },

  heroIllustration: { position: "relative", zIndex: 2 },
  dropWrap: { position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" },
  ripple: {
    position: "absolute", width: 220, height: 220, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
  },
  dropCore: {
    position: "relative", zIndex: 2, width: 110, height: 110, borderRadius: "50%",
    background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
  },

  orbWrap: { position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" },
  orbRing: {
    position: "absolute", width: 140, height: 140, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
  },
  orbParticle: {
    position: "absolute", borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.2))",
    boxShadow: "0 0 10px rgba(255,255,255,0.5)",
  },
  orbGlass: {
    position: "relative", width: 130, height: 130, borderRadius: "50%",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", backdropFilter: "blur(2px)",
    boxShadow: "0 20px 60px rgba(8,20,50,0.45), inset 0 0 40px rgba(255,255,255,0.08)",
  },
  orbRippleLine: {
    position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
    width: 60, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.55)",
  },

  statsSection: {
    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 30,
    padding: "50px 60px", background: theme.colors.surface,
  },
  statsHeading: { maxWidth: 260 },
  statsGrid: { display: "flex", gap: 44, flexWrap: "wrap" },

  featureSection: {
    display: "flex", alignItems: "center", gap: 60, padding: "70px 60px", flexWrap: "wrap",
  },
  featureVisual: { flex: "0 0 320px", display: "flex", justifyContent: "center" },
  featureText: { flex: "1 1 400px", maxWidth: 520 },
  eyebrow: { fontSize: 12.5, fontWeight: 700, color: theme.colors.accent, letterSpacing: 0.5 },
  featureTitle: { fontSize: 28, fontWeight: 800, color: theme.colors.text, marginTop: 10, lineHeight: 1.3 },
  featureBody: { fontSize: 13.5, color: theme.colors.textMuted, marginTop: 16, lineHeight: 1.7 },

  countersSection: {
    display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap",
    padding: "40px 60px", background: theme.colors.primaryLight,
  },

  servicesSection: { textAlign: "center", padding: "70px 60px" },
  eyebrowCenter: { fontSize: 12.5, fontWeight: 700, color: theme.colors.accent, letterSpacing: 0.5 },
  servicesTitle: { fontSize: 26, fontWeight: 800, color: theme.colors.text, marginTop: 10, marginBottom: 40 },
  servicesGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto",
  },
  serviceCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 16,
    padding: "32px 24px", boxShadow: theme.shadow?.sm || "0 1px 3px rgba(0,0,0,0.05)",
  },

  ctaSection: {
    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
    padding: "50px 60px", background: `linear-gradient(135deg, ${theme.colors.primary}, #1e3a8a)`,
  },
  ctaBtn: {
    background: "#fff", color: theme.colors.primary, border: "none", borderRadius: 10,
    padding: "13px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },

  footer: {
    textAlign: "center", padding: "24px 60px", fontSize: 12, color: theme.colors.textMuted,
    background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`,
  },

  featureGridSection: { textAlign: "center", padding: "70px 60px", background: theme.colors.bg },
  featureGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20,
    maxWidth: 1100, margin: "0 auto",
  },
  featureCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 16,
    padding: "26px 22px", textAlign: "left", boxShadow: theme.shadow?.sm || "0 1px 3px rgba(0,0,0,0.05)",
  },
  featureCardIcon: {
    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 21, background: "rgba(29,78,216,0.08)",
  },

  contactSection: { padding: "70px 60px", background: theme.colors.surface, textAlign: "center" },
  contactIntro: { fontSize: 13.5, color: theme.colors.textMuted, maxWidth: 520, margin: "10px auto 40px auto", lineHeight: 1.6 },
  contactGrid: {
    display: "grid", gridTemplateColumns: "minmax(240px, 1fr) minmax(280px, 1.2fr)", gap: 40,
    maxWidth: 900, margin: "0 auto", textAlign: "left",
  },
  contactInfoCol: { display: "flex", flexDirection: "column", gap: 14 },
  contactInfoCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14,
    background: theme.colors.bg, border: `1px solid ${theme.colors.border}`,
  },
  contactInfoIcon: {
    width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 17, background: "rgba(29,78,216,0.1)", flexShrink: 0,
  },
  socialBtn: {
    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    background: theme.colors.primary, textDecoration: "none",
  },
  contactForm: { display: "flex", flexDirection: "column", gap: 4, background: theme.colors.bg, border: `1px solid ${theme.colors.border}`, borderRadius: 16, padding: "26px 24px" },
  contactLabel: { fontSize: 11.5, fontWeight: 700, color: theme.colors.textMuted, marginTop: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  contactInput: {
    padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.colors.border}`,
    fontSize: 13.5, background: theme.colors.surface, color: theme.colors.text, fontFamily: "inherit",
  },
};