import WorkspaceLayout from "../components/WorkspaceLayout";

function Settings() {
  const actions = (
    <>
      <span className="text-chip">Profile preferences</span>
    </>
  );

  return (
    <WorkspaceLayout title="Settings" actions={actions}>
      <section className="settings-grid">
        <article className="panel-surface settings-card settings-main-card">
          <h4>Business Profile</h4>
          <div className="settings-form-grid">
            <label className="settings-field" htmlFor="business-name">
              Business Name
              <input
                id="business-name"
                type="text"
                defaultValue="Stockly Ventures"
              />
            </label>
            <label className="settings-field" htmlFor="business-email">
              Contact Email
              <input
                id="business-email"
                type="email"
                defaultValue="ops@stockly.com"
              />
            </label>
            <label className="settings-field" htmlFor="business-phone">
              Phone
              <input
                id="business-phone"
                type="text"
                defaultValue="+91 98765 43210"
              />
            </label>
            <label className="settings-field" htmlFor="business-address">
              Address
              <input
                id="business-address"
                type="text"
                defaultValue="18 Market Street, Mumbai"
              />
            </label>
          </div>
        </article>

        <article className="panel-surface settings-card">
          <h4>Notifications</h4>
          <label className="setting-toggle" htmlFor="notify-stock-alert">
            <span>Low stock alerts</span>
            <input id="notify-stock-alert" type="checkbox" defaultChecked />
          </label>
          <label className="setting-toggle" htmlFor="notify-purchase">
            <span>Purchase update emails</span>
            <input id="notify-purchase" type="checkbox" defaultChecked />
          </label>
          <label className="setting-toggle" htmlFor="notify-weekly">
            <span>Weekly summary digest</span>
            <input id="notify-weekly" type="checkbox" />
          </label>
        </article>

        <article className="panel-surface settings-card">
          <h4>Security</h4>
          <div className="settings-security-list">
            <span className="text-chip">Change Password</span>
            <span className="text-chip">Enable 2FA</span>
            <span className="text-chip">Session Timeout: 30 min</span>
          </div>
        </article>

        <article className="panel-surface settings-card">
          <h4>Regional</h4>
          <div className="settings-security-list">
            <span className="text-chip">Currency: INR (₹)</span>
            <span className="text-chip">Timezone: IST (UTC+5:30)</span>
            <span className="text-chip">Date format: DD/MM/YYYY</span>
          </div>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Settings;
