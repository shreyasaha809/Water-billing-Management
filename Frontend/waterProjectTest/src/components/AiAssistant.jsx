import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useLottie } from "lottie-react";
import api from "../api/axiosInstance";
import { theme } from "../theme";
import { useToast } from "../context/ToastContext";
import robotAnimation from "../assets/robot.json";

const ROLE_ENDPOINTS = {
  HOUSEHOLD_USER: "/household-user/ai-assistant/chat",
  APARTMENT_ADMIN: "/apartment-admin/ai-assistant/chat",
  SUPER_ADMIN: "/super-admin/ai-assistant/chat",
  PUBLIC: "/public/ai-assistant/chat",
};

const NAV_PATH_MAP = {
  dashboard: "dashboard", billing: "waterBilling", waterUsage: "waterBilling",
  invoices: "invoices", tariffPlans: "tariffPlans", waterPurchase: "waterPurchase",
  alerts: "alerts", support: "support", announcements: "announcements",
  reports: "reports", profile: "profile",
};

const SUGGESTIONS_BY_ROLE = {
  HOUSEHOLD_USER: [
    { text: "Show my latest bill", icon: "🧾", color: "#6d5efc" },
    { text: "My water usage this month", icon: "📊", color: "#22c1a4" },
    { text: "Do I have unpaid bills?", icon: "💳", color: "#2563eb" },
    { text: "Latest announcements", icon: "📢", color: "#f59e0b" },
    { text: "Open support", icon: "🛟", color: "#ec4899" },
  ],
  APARTMENT_ADMIN: [
    { text: "Show all unpaid bills", icon: "💳", color: "#6d5efc" },
    { text: "Highest water consumer", icon: "💧", color: "#22c1a4" },
    { text: "Pending support tickets", icon: "🛟", color: "#2563eb" },
    { text: "Total billing this month", icon: "📈", color: "#f59e0b" },
    { text: "Households with leakage", icon: "⚠️", color: "#ec4899" },
  ],
  SUPER_ADMIN: [
    { text: "Total apartments", icon: "🏢", color: "#6d5efc" },
    { text: "Total monthly revenue", icon: "📈", color: "#22c1a4" },
    { text: "Apartments with most complaints", icon: "⚠️", color: "#2563eb" },
    { text: "Overall analytics", icon: "📊", color: "#f59e0b" },
  ],
  PUBLIC: [
    { text: "What is HydroHome?", icon: "💧", color: "#6d5efc" },
    { text: "What are the user roles?", icon: "☺", color: "#22c1a4" },
    { text: "How do I register?", icon: "📝", color: "#2563eb" },
    { text: "What features are available?", icon: "✨", color: "#f59e0b" },
  ],
};

const ASSISTANT_NAME_BY_ROLE = {
  HOUSEHOLD_USER: "Buddy",
  APARTMENT_ADMIN: "Buddy",
  SUPER_ADMIN: "Buddy",
  PUBLIC: "Buddy",
};

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AiAssistant({ role, onNavigate }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  // Free-drag position. null = docked bottom-right (default CSS position).
  const [pos, setPos] = useState(null);
  const dragState = useRef(null);
  const windowRef = useRef(null);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const endpoint = ROLE_ENDPOINTS[role];
  const suggestions = SUGGESTIONS_BY_ROLE[role] || [];
  const assistantName = ASSISTANT_NAME_BY_ROLE[role] || "Buddy";

  useEffect(() => {
    if (!minimized) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, minimized]);

  const getCurrentPageName = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("billing")) return "billing";
    if (path.includes("support")) return "support";
    if (path.includes("announcement")) return "announcements";
    if (path.includes("report")) return "reports";
    if (path.includes("profile")) return "profile";
    return "dashboard";
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), sender: "user", text, time: timeNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post(endpoint, { message: text, currentPage: getCurrentPageName() });
      const { reply, suggestedNavigation } = res.data.data;

      const aiMsg = { id: Date.now() + 1, sender: "ai", text: reply, time: timeNow() };
      setMessages((prev) => [...prev, aiMsg]);

      if (suggestedNavigation && NAV_PATH_MAP[suggestedNavigation] && onNavigate) {
        setTimeout(() => onNavigate(NAV_PATH_MAP[suggestedNavigation]), 600);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: "Sorry, I couldn't process that. Please try again.", time: timeNow() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.warning("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeak = (msg) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  };

  const handleClearChat = () => setMessages([]);

  // ---------- Dragging (grab the header, move the whole window) ----------
  const onDragStart = useCallback((e) => {
    if (maximized) return;
    if (e.target.closest("button")) return; // don't start a drag when the click is on a header icon button
    const isTouch = e.type === "touchstart";
    const point = isTouch ? e.touches[0] : e;
    const rect = windowRef.current.getBoundingClientRect();
    dragState.current = {
      offsetX: point.clientX - rect.left,
      offsetY: point.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", onDragMove, { passive: false });
    window.addEventListener(isTouch ? "touchend" : "mouseup", onDragEnd);
  }, [maximized]);

  const onDragMove = useCallback((e) => {
    if (!dragState.current) return;
    e.preventDefault();
    const isTouch = e.type === "touchmove";
    const point = isTouch ? e.touches[0] : e;
    const { offsetX, offsetY, width, height } = dragState.current;
    let left = point.clientX - offsetX;
    let top = point.clientY - offsetY;
    left = Math.max(8, Math.min(window.innerWidth - width - 8, left));
    top = Math.max(8, Math.min(window.innerHeight - height - 8, top));
    setPos({ left, top });
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    window.removeEventListener("touchmove", onDragMove);
    window.removeEventListener("touchend", onDragEnd);
  }, [onDragMove]);

  useEffect(() => () => {
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  }, [onDragMove, onDragEnd]);

  // ---------- Window geometry ----------
  // Maximize/restore always resets any custom drag position, so the toggle
  // is 100% deterministic — it always centers on maximize and always docks
  // to the bottom-right corner on restore, regardless of prior drag state.
  const toggleMaximize = () => {
    setPos(null);
    setMinimized(false);
    setMaximized((m) => !m);
  };
  const toggleMinimize = () => {
    setMaximized(false);
    setMinimized((m) => !m);
  };

  const baseSize = maximized
    ? { width: "min(640px, 94vw)", height: "min(760px, 90vh)" }
    : { width: 380, height: minimized ? 64 : 600 };

  let windowStyle;
  if (maximized) {
    // inset + margin:auto centers without `transform` — the chat-window-anim
    // entrance animation holds its own `transform` value indefinitely (fill: both),
    // which would silently cancel out a transform-based centering trick.
    windowStyle = { position: "fixed", inset: 0, margin: "auto", ...baseSize };
  } else if (pos) {
    windowStyle = { position: "fixed", left: pos.left, top: pos.top, transform: "none", ...baseSize };
  } else {
    windowStyle = { position: "fixed", right: 24, bottom: 100, left: "auto", top: "auto", transform: "none", ...baseSize };
  }

  return createPortal(
    <>
     {!open && (
  <button
    onClick={() => { setOpen(true); setMinimized(false); }}
    aria-label="Open AI assistant"
    className="float-slow"
style={{
  position: "fixed", bottom: 24, right: 24, width: 120, height: 100,
  background: "transparent", border: "none",
  color: "#fff", fontSize: 24, cursor: "pointer",
  zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
  transition: "transform 0.2s cubic-bezier(0.22,1,0.36,1)",
}}
  >
    <BotIcon size={96} />
  </button>
)}

      {open && (
        <div
          ref={windowRef}
          className="chat-window-anim glass-panel"
          style={{
            ...windowStyle,
            zIndex: 2000,
            borderRadius: 22,
            boxShadow: "0 30px 80px rgba(var(--shadow-color),0.4)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            transition: "width 0.28s cubic-bezier(0.22,1,0.36,1), height 0.28s cubic-bezier(0.22,1,0.36,1), top 0.28s cubic-bezier(0.22,1,0.36,1), left 0.28s cubic-bezier(0.22,1,0.36,1), right 0.28s cubic-bezier(0.22,1,0.36,1), bottom 0.28s cubic-bezier(0.22,1,0.36,1), transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* ===== Header (drag handle) ===== */}
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            style={{
              background: `linear-gradient(120deg, #241f5c 0%, #6d5efc 60%, ${theme.colors.accent} 140%)`,
              padding: "14px 14px 14px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
              cursor: maximized ? "default" : "grab", userSelect: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, position: "relative",
              }}>
                <div style={{ width: 26, height: 26 }}><BotIcon size={26} /></div>
                <span style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "#4ade80", border: "2px solid #241f5c" }} />
              </div>
              {!minimized && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {assistantName}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 10.5, whiteSpace: "nowrap" }}>Your AI Water Assistant</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <HeaderIconBtn title="Read last reply aloud" onClick={(e) => { e.stopPropagation(); const last = [...messages].reverse().find((m) => m.sender === "ai"); if (last) handleSpeak(last); }}>
                🔊
              </HeaderIconBtn>
              <HeaderIconBtn title="Clear chat" onClick={(e) => { e.stopPropagation(); handleClearChat(); }}>
                ↻
              </HeaderIconBtn>
              <HeaderIconBtn title={minimized ? "Expand" : "Minimize"} onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}>
                {minimized ? "▲" : "▾"}
              </HeaderIconBtn>
              <HeaderIconBtn title={maximized ? "Restore" : "Maximize"} onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}>
                {maximized ? "⤡" : "⤢"}
              </HeaderIconBtn>
              <HeaderIconBtn title="Close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
                ✕
              </HeaderIconBtn>
            </div>
          </div>

          {!minimized && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: theme.colors.bg }}>
                {messages.length === 0 && (
                  <div className="anim-page">
                    <div style={{
                      background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 14,
                      padding: 14, fontSize: 12.5, color: theme.colors.text, marginBottom: 14, lineHeight: 1.55,
                    }}>
                      I'm specifically tuned for <b>HydroHome Water Management</b>! I can help you check unpaid bills, usage trends, tariff rates, and support tickets.
                    </div>
                    <div style={{ fontSize: 11, color: theme.colors.textFaint, marginBottom: 8, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>Quick actions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {suggestions.map((s, i) => (
                        <button
                          key={s.text}
                          onClick={() => sendMessage(s.text)}
                          className="hover-lift"
                          style={{
                            display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                            padding: "11px 14px", borderRadius: 12, border: "none",
                            background: `${s.color}18`, color: s.color, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                            animationDelay: `${i * 0.05}s`,
                          }}
                        >
                          <span style={{ fontSize: 15 }}>{s.icon}</span>
                          <span style={{ flex: 1 }}>{s.text}</span>
                          <span style={{ opacity: 0.6 }}>→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div key={m.id} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }} className="anim-row">
                    <div style={{
                      background: m.sender === "user" ? `linear-gradient(135deg, #6d5efc, ${theme.colors.accent})` : theme.colors.surface,
                      color: m.sender === "user" ? "#fff" : theme.colors.text,
                      border: m.sender === "user" ? "none" : `1px solid ${theme.colors.border}`,
                      borderRadius: m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "11px 15px", fontSize: 13, whiteSpace: "pre-line", boxShadow: theme.shadow.sm, lineHeight: 1.5,
                    }}>
                      {m.text}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, padding: "0 2px" }}>
                      <span style={{ fontSize: 9.5, color: theme.colors.textFaint }}>{m.time}</span>
                      {m.sender === "ai" && (
                        speakingId === m.id ? (
                          <button onClick={() => handleStopSpeaking()} style={{ fontSize: 10, background: "none", border: "none", color: theme.colors.danger, cursor: "pointer", fontWeight: 700, padding: 0 }}>⏹ Stop</button>
                        ) : (
                          <button onClick={() => handleSpeak(m)} style={{ fontSize: 10, background: "none", border: "none", color: "#6d5efc", cursor: "pointer", fontWeight: 700, padding: 0 }}>🔊 Listen</button>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "12px 16px", background: theme.colors.surface, borderRadius: "16px 16px 16px 4px", border: `1px solid ${theme.colors.border}` }}>
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textFaint, animationDelay: "0s" }} />
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textFaint, animationDelay: "0.15s" }} />
                    <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: theme.colors.textFaint, animationDelay: "0.3s" }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 14px 0 14px", flexShrink: 0 }}>
                  {suggestions.slice(0, 3).map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text)}
                      style={{
                        flexShrink: 0, whiteSpace: "nowrap", padding: "7px 13px", borderRadius: 999,
                        border: `1px solid ${theme.colors.border}`, background: theme.colors.surface,
                        color: theme.colors.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {s.icon} {s.text}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ padding: 12, borderTop: `1px solid ${theme.colors.border}`, display: "flex", gap: 8, background: theme.colors.surface, flexShrink: 0 }}>
                <button
                  onClick={handleVoiceInput}
                  title="Voice input"
                  style={{
                    width: 40, height: 40, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: listening ? theme.colors.danger : theme.colors.bg, color: listening ? "#fff" : theme.colors.text,
                    fontSize: 15, flexShrink: 0, transition: "background 0.15s ease",
                  }}
                  className={listening ? "chat-fab-pulse" : ""}
                >
                  🎤
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={`Ask ${assistantName} a question...`}
                  style={{ flex: 1, border: `1px solid ${theme.colors.border}`, borderRadius: 999, padding: "0 16px", fontSize: 13, background: theme.colors.bg, color: theme.colors.text }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  style={{
                    width: 40, height: 40, borderRadius: "50%", border: "none",
                    background: `linear-gradient(135deg, #6d5efc, ${theme.colors.accent})`, color: "#fff",
                    cursor: "pointer", fontSize: 15, fontWeight: 700, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>,
    document.body
  );
}

function HeaderIconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 26, height: 26, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.14)",
        color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
    >
      {children}
    </button>
  );
}

function BotIcon({ size = 34 }) {
  const options = {
    animationData: robotAnimation,
    loop: true,
    autoplay: true,
  };
  const style = { width: "100%", height: "100%" };
  // useLottie is a plain named export, unlike lottie-react's default-exported
  // <Lottie/> component — which some Vite dev-server CJS/ESM interop setups
  // fail to unwrap correctly. This hook-based API sidesteps that entirely.
  const { View } = useLottie(options, style);

return (
  <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <div style={{ width: "100%", height: "100%", transform: "scale(1.7)" }}>
      {View}
    </div>
  </div>
);
}
