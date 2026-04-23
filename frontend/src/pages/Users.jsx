import { useEffect, useMemo, useState, useCallback } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

const roleLabels = { owner: "Owner", stockmgr: "Stock Manager", cashier: "Cashier" };

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", role: "cashier", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const toast = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const key = search.toLowerCase();
    return users.filter((u) =>
      [u.username, u.email, u.role].some((v) => v?.toLowerCase().includes(key))
    );
  }, [users, search]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    suspended: users.filter((u) => u.status === "Suspended").length,
    owners: users.filter((u) => u.role === "owner").length,
  }), [users]);

  // Create employee (auto-gen password, show credentials)
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/users", form);
      setCredentials({ email: form.email, password: res.data.tempPassword, name: form.username });
      setForm({ username: "", email: "", role: "cashier", phone: "" });
      await loadUsers();
      toast.success(`Account created for ${res.data.username}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  // Suspend / Reactivate
  const toggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    setConfirmModal({
      title: newStatus === "Suspended" ? "Suspend Account" : "Reactivate Account",
      message: `Are you sure you want to ${newStatus === "Suspended" ? "suspend" : "reactivate"} ${user.username}'s account?`,
      danger: newStatus === "Suspended",
      onConfirm: async () => {
        try {
          await api.patch(`/users/${user._id}/status`, { status: newStatus });
          await loadUsers();
          toast.success(`${user.username} ${newStatus === "Suspended" ? "suspended" : "reactivated"}`);
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to update status");
        }
        setConfirmModal(null);
      },
    });
  };

  // Change role
  const changeRole = async (user) => {
    const newRole = user.role === "stockmgr" ? "cashier" : "stockmgr";
    setConfirmModal({
      title: "Change Role",
      message: `Change ${user.username}'s role from ${roleLabels[user.role]} to ${roleLabels[newRole]}?`,
      onConfirm: async () => {
        try {
          await api.patch(`/users/${user._id}/role`, { role: newRole });
          await loadUsers();
          toast.success(`Role changed to ${roleLabels[newRole]}`);
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to change role");
        }
        setConfirmModal(null);
      },
    });
  };

  // Reset password
  const resetPassword = async (user) => {
    setConfirmModal({
      title: "Reset Password",
      message: `Generate a new temporary password for ${user.username}?`,
      onConfirm: async () => {
        try {
          const res = await api.patch(`/users/${user._id}/reset-password`);
          setCredentials({ email: user.email, password: res.data.tempPassword, name: user.username });
          toast.success("Password reset successfully");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to reset password");
        }
        setConfirmModal(null);
      },
    });
  };

  // Delete user
  const deleteUser = async (user) => {
    setConfirmModal({
      title: "Delete Account",
      message: `Permanently delete ${user.username}'s account? This action cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user._id}`);
          await loadUsers();
          toast.success("User deleted");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete");
        }
        setConfirmModal(null);
      },
    });
  };

  const timeAgo = (date) => {
    if (!date) return "—";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.info("Copied to clipboard"));
  };

  return (
    <WorkspaceLayout>
      {/* Stats cards */}
      <section className="user-stats-grid">
        <article className="panel-surface user-stat-card">
          <p>Total Users</p>
          <h3>{stats.total}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Active</p>
          <h3>{stats.active}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Suspended</p>
          <h3 style={{ color: stats.suspended > 0 ? "#ef4444" : undefined }}>{stats.suspended}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Owners</p>
          <h3>{stats.owners}</h3>
        </article>
      </section>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: "flex", gap: 10, margin: "16px 0", alignItems: "center" }}>
        <input
          className="search-input compact"
          type="search"
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 340 }}
        />
        <button className="subtle-btn" onClick={loadUsers}>Refresh</button>
        <button className="primary-btn" onClick={() => { setShowForm(true); setCredentials(null); }}>
          + Add Employee
        </button>
      </div>

      {/* Users table */}
      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1.5fr" }}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last Active</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            <>
              {[1,2,3].map((i) => <div key={i} className="skeleton-row"></div>)}
            </>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try adjusting your search or add a new employee.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u._id} className="table-data-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1.5fr" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: "0.7rem" }}>
                    {u.username?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="product-name">{u.username}</span>
                </div>
                <div>{u.email}</div>
                <div>
                  <span className={`status-pill status-${u.role}`}>
                    {roleLabels[u.role]}
                  </span>
                </div>
                <div>
                  <span className={`status-pill ${u.status === "Active" ? "status-Received" : u.status === "Suspended" ? "status-Cancelled" : "status-Pending"}`}>
                    {u.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{timeAgo(u.lastActive || u.updatedAt)}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {u.role !== "owner" && (
                    <>
                      <button className="text-action" onClick={() => toggleStatus(u)} title={u.status === "Active" ? "Suspend" : "Reactivate"}>
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      <button className="text-action" onClick={() => changeRole(u)} title="Change role">
                        Role
                      </button>
                      <button className="text-action" onClick={() => resetPassword(u)} title="Reset password">
                        Reset
                      </button>
                      <button className="text-action text-danger" onClick={() => deleteUser(u)} title="Delete">
                        Delete
                      </button>
                    </>
                  )}
                  {u.role === "owner" && (
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Protected</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Access overview panel */}
      <section className="panel-surface" style={{ marginTop: 20, padding: 20 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600 }}>Access Overview</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <strong style={{ fontSize: "0.8rem" }}>Owner</strong>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>Full access to inventory, financial data, users, reports, and settings.</p>
          </div>
          <div>
            <strong style={{ fontSize: "0.8rem" }}>Stock Manager</strong>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>Can receive, adjust, and view stock. No access to cost prices, revenue, or users.</p>
          </div>
          <div>
            <strong style={{ fontSize: "0.8rem" }}>Cashier</strong>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>Can process sales via POS and view daily summary. No inventory or financial access.</p>
          </div>
        </div>
      </section>

      {/* ── Add Employee Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setCredentials(null); } }}>
          <div className="modal-box modal-form-large">
            <h3>{credentials ? "Account Created" : "Add Employee"}</h3>

            {credentials ? (
              <>
                <p>Share these credentials with {credentials.name}. The password is shown once — copy it now.</p>
                <div className="credential-box">
                  <h4>Login Credentials</h4>
                  <div className="credential-row">
                    <span>Email</span>
                    <span>
                      {credentials.email}
                      <button className="copy-btn" onClick={() => copyToClipboard(credentials.email)}>Copy</button>
                    </span>
                  </div>
                  <div className="credential-row">
                    <span>Password</span>
                    <span>
                      {credentials.password}
                      <button className="copy-btn" onClick={() => copyToClipboard(credentials.password)}>Copy</button>
                    </span>
                  </div>
                  <div className="credential-row">
                    <span>Login URL</span>
                    <span>
                      {window.location.origin}/login
                      <button className="copy-btn" onClick={() => copyToClipboard(`${window.location.origin}/login`)}>Copy</button>
                    </span>
                  </div>
                </div>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button className="modal-btn-confirm" onClick={() => { setShowForm(false); setCredentials(null); }}>Done</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. Suresh Patel" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="suresh@company.com" />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="stockmgr">Stock Manager</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "12px 0 0" }}>
                  A temporary password will be auto-generated. You can share it with the employee.
                </p>
                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button type="button" className="modal-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="modal-btn-confirm" disabled={saving}>
                    {saving ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmModal(null); }}>
          <div className="modal-box">
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className={`modal-btn-confirm ${confirmModal.danger ? "modal-btn-danger" : ""}`} onClick={confirmModal.onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default Users;
