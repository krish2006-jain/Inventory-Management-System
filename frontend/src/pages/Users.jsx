import { useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import api from "../services/api";

const newUser = {
  username: "",
  email: "",
  password: "",
  phone: "",
  role: "cashier",
  status: "Active",
};

const roleLabels = {
  owner: "Owner",
  stockmgr: "Stock Manager",
  cashier: "Cashier",
};

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(newUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const key = search.toLowerCase();
    return users.filter((user) =>
      [user.username, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(key)),
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(
      (user) => user.status !== "Pending",
    ).length;
    const adminUsers = users.filter((user) => user.role === "owner").length;
    const pendingUsers = users.filter(
      (user) => user.status === "Pending",
    ).length;
    return { totalUsers, activeUsers, adminUsers, pendingUsers };
  }, [users]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/users", form);
      setForm(newUser);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      <input
        className="search-input compact"
        type="search"
        placeholder="Search users"
        aria-label="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="subtle-btn" type="button" onClick={loadUsers}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Close" : "+ Add User"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Users" actions={actions}>
      {showForm ? (
        <section className="panel-surface" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create Team Member</h4>
          <form
            onSubmit={handleCreate}
            className="settings-form-grid"
            style={{ marginTop: 12 }}
          >
            <label className="settings-field">
              Name
              <input
                required
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Phone
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Role
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="owner">Owner</option>
                <option value="stockmgr">Stock Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </label>
            <label className="settings-field">
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create User"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="user-stats-grid">
        <article className="panel-surface user-stat-card">
          <p>Total Users</p>
          <h3>{stats.totalUsers}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Active Today</p>
          <h3>{stats.activeUsers}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Admins</p>
          <h3>{stats.adminUsers}</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Pending Invites</p>
          <h3>{stats.pendingUsers}</h3>
        </article>
      </section>

      <section className="user-content-grid">
        <article className="panel-surface user-table-panel">
          <header className="panel-head">
            <h4>Team Members</h4>
            <span className="text-chip">Total {filteredUsers.length}</span>
          </header>
          <div className="user-table">
            <div className="user-row user-head-row">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
            </div>
            {loading ? (
              <div className="user-row">
                <span>Loading...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="user-row">
                <span>No users found</span>
              </div>
            ) : (
              filteredUsers.map((member) => (
                <div key={member._id} className="user-row">
                  <span>{member.username}</span>
                  <span>{member.email}</span>
                  <span>{roleLabels[member.role] || member.role}</span>
                  <span
                    className={
                      member.status === "Pending" ? "pending" : "active"
                    }
                  >
                    {member.status || "Active"}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel-surface user-role-panel">
          <h4>Access Overview</h4>
          <ul>
            <li>
              <strong>Owner</strong>
              <span>Full access to inventory, users, and reports.</span>
            </li>
            <li>
              <strong>Stock Manager</strong>
              <span>Can edit products, categories, and stock alerts.</span>
            </li>
            <li>
              <strong>Cashier</strong>
              <span>Can process sales and view product stock.</span>
            </li>
          </ul>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Users;
