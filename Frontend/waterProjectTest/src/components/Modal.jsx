export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  return (
    <div
      className="anim-modal-overlay"
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        className="anim-modal"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <div style={headerStyle}>{title}</div>}
        <div style={bodyStyle}>{children}</div>
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalStyle = {
  background: "#ffffff",
  borderRadius: 16,
  width: 420,
  maxWidth: "90vw",
  boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
};
const headerStyle = {
  padding: "18px 22px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
};
const bodyStyle = { padding: 22, fontSize: 13.5, color: "#334155" };
const footerStyle = {
  padding: "16px 22px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};