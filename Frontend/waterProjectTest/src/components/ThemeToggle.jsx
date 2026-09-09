import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ style }) {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle"
      style={style}
    >
      <span className="knob">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}
