import WorkspaceLayout from "../components/WorkspaceLayout";

const teamMembers = [
  {
    name: "Sarah Ahmed",
    email: "sarah@stockly.com",
    role: "Owner",
    status: "Active",
  },
  {
    name: "Ravi Mehta",
    email: "ravi@stockly.com",
    role: "Stock Manager",
    status: "Active",
  },
  {
    name: "Noah Clark",
    email: "noah@stockly.com",
    role: "Cashier",
    status: "Pending",
  },
  {
    name: "Aisha Khan",
    email: "aisha@stockly.com",
    role: "Analyst",
    status: "Active",
  },
];

function Users() {
  const actions = (
    <>
      <input
        className="search-input compact"
        type="search"
        placeholder="Search users"
        aria-label="Search users"
      />
      <button className="subtle-btn" type="button">
        Invite User
      </button>
      <button className="primary-btn" type="button">
        + Add User
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Users" actions={actions}>
      <section className="user-stats-grid">
        <article className="panel-surface user-stat-card">
          <p>Total Users</p>
          <h3>24</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Active Today</p>
          <h3>17</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Admins</p>
          <h3>3</h3>
        </article>
        <article className="panel-surface user-stat-card">
          <p>Pending Invites</p>
          <h3>2</h3>
        </article>
      </section>

      <section className="user-content-grid">
        <article className="panel-surface user-table-panel">
          <header className="panel-head">
            <h4>Team Members</h4>
            <button type="button">Manage Roles</button>
          </header>

          <div className="user-table">
            <div className="user-row user-head-row">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
            </div>

            {teamMembers.map((member) => (
              <div key={member.email} className="user-row">
                <span>{member.name}</span>
                <span>{member.email}</span>
                <span>{member.role}</span>
                <span
                  className={member.status === "Pending" ? "pending" : "active"}
                >
                  {member.status}
                </span>
              </div>
            ))}
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
            <li>
              <strong>Analyst</strong>
              <span>Can view dashboards and export reports.</span>
            </li>
          </ul>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Users;
