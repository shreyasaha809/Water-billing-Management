import { theme } from "../../theme";

export default function ChartTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 12px 32px rgba(var(--shadow-color),0.18)",
        fontSize: 12.5,
        minWidth: 120,
      }}
    >
      {label && (
        <div style={{ color: theme.colors.textMuted, fontWeight: 600, marginBottom: 6, fontSize: 11 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: i === 0 ? 0 : 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: theme.colors.text }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.fill, display: "inline-block" }} />
            {p.name}
          </span>
          <span style={{ fontWeight: 700, color: theme.colors.text, fontFamily: theme.mono }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}
