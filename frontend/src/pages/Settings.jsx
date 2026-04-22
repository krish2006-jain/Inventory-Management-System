import WorkspaceLayout from "../components/WorkspaceLayout";

function Settings() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">
        Reset Changes
      </button>
      <button className="primary-btn" type="button">
        Save Settings
      </button>
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
                value="Stockly Ventures"
                readOnly
              />
            </label>
            <label className="settings-field" htmlFor="business-email">
              Contact Email
              <input
                id="business-email"
                type="email"
                value="ops@stockly.com"
                readOnly
              />
            </label>
            <label className="settings-field" htmlFor="business-phone">
              Phone
              <input
                id="business-phone"
                type="text"
                value="+1 555 010 239"
                readOnly
              />
            </label>
            <label className="settings-field" htmlFor="business-address">
              Address
              <input
                id="business-address"
                type="text"
                value="18 Market Street, New York"
                readOnly
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
            <button type="button" className="text-chip">
              Change Password
            </button>
            <button type="button" className="text-chip">
              Enable 2FA
            </button>
            <button type="button" className="text-chip">
              Session Timeout: 30 min
            </button>
          </div>
        </article>

        <article className="panel-surface settings-card">
          <h4>Regional</h4>
          <div className="settings-security-list">
            <button type="button" className="text-chip">
              Currency: USD
            </button>
            <button type="button" className="text-chip">
              Timezone: UTC-5
            </button>
            <button type="button" className="text-chip">
              Date format: DD/MM/YYYY
            </button>
          </div>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Settings;
