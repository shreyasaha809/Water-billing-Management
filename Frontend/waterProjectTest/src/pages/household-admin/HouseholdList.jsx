import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { theme, layoutStyles, StatusBadge } from "../../theme";
import { useToast } from "../../context/ToastContext";

export default function HouseholdList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await api.get("/apartment-admin/households");
      setHouseholds(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load households.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this household user?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/apartment-admin/households/${id}`);
      fetchHouseholds();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={layoutStyles.page}>
      <div style={layoutStyles.topBar}>
        <div style={layoutStyles.logoBlock}>
          <div>
            <div style={layoutStyles.brand}>Household List</div>
            <div style={layoutStyles.tagline}>All residents in your apartment</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/dashboard/apartment-admin/households/register")}
            style={layoutStyles.btnPrimary}
          >
            + Register Household
          </button>
          <button onClick={() => navigate("/dashboard/apartment-admin")} style={layoutStyles.btnSecondary}>
            ← Back
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={layoutStyles.panel}>
          <div style={layoutStyles.panelHeader}>All Households</div>
          <div style={layoutStyles.panelBody}>
            {loading ? (
              <div style={layoutStyles.emptyState}>Loading...</div>
            ) : households.length === 0 ? (
              <div style={layoutStyles.emptyState}>No household users registered yet.</div>
            ) : (
              <table style={layoutStyles.table}>
                <thead>
                  <tr>
                    <th style={layoutStyles.th}>FULL NAME</th>
                    <th style={layoutStyles.th}>EMAIL</th>
                    <th style={layoutStyles.th}>PHONE</th>
                    <th style={layoutStyles.th}>FLAT NO.</th>
                    <th style={layoutStyles.th}>STATUS</th>
                    <th style={layoutStyles.th}>REGISTERED</th>
                    <th style={layoutStyles.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((h) => (
                    <tr key={h.id}>
                      <td style={layoutStyles.td}>{h.fullName}</td>
                      <td style={layoutStyles.td}>{h.email}</td>
                      <td style={layoutStyles.td}>{h.phoneNumber}</td>
                      <td style={layoutStyles.td}>{h.flatNumber}</td>
                      <td style={layoutStyles.td}>
                        <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, ...StatusBadge({ status: h.status }) }}>
                          {h.status}
                        </span>
                      </td>
                      <td style={layoutStyles.td}>{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td style={layoutStyles.td}>
                        <button
                          disabled={deletingId === h.id}
                          onClick={() => handleDelete(h.id)}
                          style={layoutStyles.btnDanger}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    padding: "28px 32px",
  },
};