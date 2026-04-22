import WorkspaceLayout from "../../components/WorkspaceLayout";

const items = [
  { name: "Wireless Scanner", sku: "WS-001", category: "Electronics", stock: 45, price: "₹2,400", status: "In Stock" },
  { name: "Barcode Labels (500)", sku: "BL-500", category: "Accessories", stock: 12, price: "₹350", status: "Low Stock" },
  { name: "Storage Bin XL", sku: "SB-XL1", category: "Storage", stock: 8, price: "₹1,200", status: "Low Stock" },
  { name: "QR Scanner Pro", sku: "QR-PRO", category: "Electronics", stock: 120, price: "₹4,500", status: "In Stock" },
  { name: "Label Printer Mini", sku: "LP-M01", category: "Electronics", stock: 67, price: "₹3,200", status: "In Stock" },
  { name: "Smart Shelving Kit", sku: "SK-001", category: "Storage", stock: 0, price: "₹8,900", status: "Out of Stock" },
  { name: "RFID Tags (100)", sku: "RF-100", category: "Accessories", stock: 340, price: "₹450", status: "In Stock" },
  { name: "Inventory Tablet", sku: "IT-TAB", category: "Electronics", stock: 23, price: "₹15,000", status: "In Stock" },
];

function StockList() {
  const actions = (
    <>
      <button className="icon-btn" type="button" aria-label="Notifications">🔔</button>
      <button className="subtle-btn" type="button">Export Reports</button>
      <button className="primary-btn" type="button">Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Product" actions={actions}>
      <section className="products-toolbar">
        <input className="search-input" type="search" placeholder="Search product" aria-label="Search products" />
        <button className="chip-btn" type="button">All Categories</button>
        <button className="chip-btn" type="button">Stock Status</button>
      </section>

      <section className="table-shell">
        <header className="table-head-row">
          <span>Product Details</span>
          <span>SKU</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Status</span>
        </header>

        <div className="table-body">
          {items.map((p) => (
            <div key={p.sku} className="table-data-row">
              <span className="product-name">{p.name}</span>
              <span>{p.sku}</span>
              <span>{p.category}</span>
              <span>{p.stock}</span>
              <span>{p.price}</span>
              <span className={`status-badge ${p.status === "In Stock" ? "badge-green" : p.status === "Low Stock" ? "badge-yellow" : "badge-red"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>

        <footer className="table-footer">
          <span>Showing 1-8 of 240 products</span>
          <span className="pagination">
            <button>1</button><button>2</button><button>3</button><button>4</button><button>5</button>
          </span>
        </footer>
      </section>
    </WorkspaceLayout>
  );
}

export default StockList;
