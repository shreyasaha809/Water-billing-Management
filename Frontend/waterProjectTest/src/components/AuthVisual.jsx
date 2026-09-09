/* Animated glass-water illustration shared by Login & Register left panels.
   Built from layered SVG + CSS keyframes — no stock imagery. */
export default function AuthVisual() {
  return (
    <div style={styles.wrap} aria-hidden="true">
      <span className="float-slow" style={{ ...styles.particle, width: 16, height: 16, top: "10%", left: "16%" }} />
      <span className="float-slower" style={{ ...styles.particle, width: 10, height: 10, top: "26%", right: "12%" }} />
      <span className="float-slow" style={{ ...styles.particle, width: 8, height: 8, bottom: "18%", left: "10%" }} />

      <span className="water-ring" style={{ ...styles.ring, animationDelay: "0s" }} />
      <span className="water-ring" style={{ ...styles.ring, animationDelay: "1.1s" }} />

      <div style={styles.glass} className="glass-shimmer">
        <svg width="150" height="150" viewBox="0 0 200 200">
          <defs>
            <clipPath id="authDropClip">
              <path d="M100 14C100 14 42 96 42 132a58 58 0 00116 0C158 96 100 14 100 14z" />
            </clipPath>
          </defs>
          <path d="M100 14C100 14 42 96 42 132a58 58 0 00116 0C158 96 100 14 100 14z"
            fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
          <g clipPath="url(#authDropClip)">
            <rect x="0" y="90" width="200" height="120" fill="#ffffff" opacity="0.9">
              <animate attributeName="y" values="100;88;100" dur="4s" repeatCount="indefinite" />
            </rect>
            <path d="M0 94 Q 25 82 50 94 T 100 94 T 150 94 T 200 94 V200 H0 Z" fill="rgba(255,255,255,0.55)">
              <animate attributeName="d" dur="3s" repeatCount="indefinite"
                values="M0 94 Q 25 82 50 94 T 100 94 T 150 94 T 200 94 V200 H0 Z;
                        M0 100 Q 25 110 50 100 T 100 100 T 150 100 T 200 100 V200 H0 Z;
                        M0 94 Q 25 82 50 94 T 100 94 T 150 94 T 200 94 V200 H0 Z" />
            </path>
          </g>
        </svg>
      </div>

      {/* bottom wave strip */}
      <div style={styles.wavesWrap}>
        <div className="wave-layer" style={{ ...styles.waveImg, backgroundImage: waveUrl("rgba(255,255,255,0.10)") }} />
        <div className="wave-layer wave-2" style={{ ...styles.waveImg, backgroundImage: waveUrl("rgba(255,255,255,0.18)") }} />
      </div>
    </div>
  );
}

function waveUrl(fill) {
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'><path d='M0,40 C150,90 350,0 600,45 C850,90 1050,10 1200,50 L1200,120 L0,120 Z' fill='${fill}'/></svg>`
  )}")`;
}

const styles = {
  wrap: { position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" },
  particle: {
    position: "absolute", borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.2))",
    boxShadow: "0 0 10px rgba(255,255,255,0.5)",
  },
  ring: { position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)" },
  glass: {
    position: "relative", width: 150, height: 150, borderRadius: "50%",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    boxShadow: "0 20px 50px rgba(8,20,50,0.4), inset 0 0 30px rgba(255,255,255,0.08)",
  },
  wavesWrap: { position: "absolute", left: "-60px", right: "-60px", bottom: "-140px", height: 120, overflow: "hidden", pointerEvents: "none" },
  waveImg: { backgroundRepeat: "repeat-x", backgroundSize: "1200px 100%" },
};
