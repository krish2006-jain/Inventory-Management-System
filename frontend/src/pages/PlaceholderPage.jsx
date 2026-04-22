import WorkspaceLayout from "../components/WorkspaceLayout";

function PlaceholderPage({ title, description }) {
  return (
    <WorkspaceLayout title={title}>
      <section className="panel-surface placeholder-panel">
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
    </WorkspaceLayout>
  );
}

export default PlaceholderPage;
