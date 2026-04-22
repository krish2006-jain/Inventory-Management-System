import WorkspaceLayout from "../components/WorkspaceLayout";

function Reports() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">
        Print
      </button>
      <button className="subtle-btn" type="button">
        Export CSV
      </button>
      <button className="subtle-btn" type="button">
        Download PDF
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Sales Report" actions={actions}>
      <section className="panel-surface report-filter-panel">
        Category Filter
      </section>

      <section className="report-kpi-grid">
        <article className="panel-surface report-kpi-card">
          Total Revenues
        </article>
        <article className="panel-surface report-kpi-card">
          Total Invoices
        </article>
        <article className="panel-surface report-kpi-card">
          Return Products
        </article>
        <article className="panel-surface report-kpi-card">
          Damage Product Loss
        </article>
      </section>

      <section className="report-chart-grid">
        <article className="panel-surface report-chart">Income Trends</article>
        <article className="panel-surface report-chart">
          Sales by Category
        </article>
      </section>

      <section className="panel-surface report-log">Transaction Log</section>
    </WorkspaceLayout>
  );
}

export default Reports;
