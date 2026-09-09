import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ mode: "light", toggleMode: () => {}, setMode: () => {} });

function getInitialMode() {
  try {
    const stored = localStorage.getItem("hh-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {
    /* localStorage unavailable — fall back to light */
  }
  // Default is always Light Mode. We intentionally do NOT read the
  // OS/browser `prefers-color-scheme` setting here — theme only changes
  // when the user explicitly toggles it (see ThemeToggle).
  return "light";
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("hh-theme", mode);
    } catch (e) {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((next) => setModeState(next), []);
  const toggleMode = useCallback(() => setModeState((m) => (m === "dark" ? "light" : "dark")), []);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
