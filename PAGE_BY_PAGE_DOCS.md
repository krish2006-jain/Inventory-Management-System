# Stockly - Page-by-Page Feature & Field Documentation 📄📈

This document provides an exhaustive, page-by-page breakdown of the Stockly Inventory Management System. It details the precise features, interactive elements, and data fields implemented across the entire application interface.

---

## 🌎 1. Global & Authentication Pages

### `Home.jsx` (Landing Page)
- **Features:** Landing point for all unauthenticated users. Features a dynamic animated background (`pulse`, `riseIn`), brand messaging, and a prominently displayed login icon in the top right.
- **Dynamic Element:** If a user is actively authenticated, the login button dynamically changes to "Go to Dashboard".

### `Login.jsx`
- **Purpose:** Secure point of entry.
- **Fields:**
  - `Email`: Text input validated for standard email format.
  - `Password`: Masked text input for security.
- **Features:** Form submission triggers a login request. On success, it receives a secure JWT token and redirects based on the user's role layer (Owner, Stock Manager, Cashier).

### `Register.jsx`
- **Purpose:** Registration for new employees.
- **Fields:**
  - `Full Name`: String input.
  - `Email`: Text input validated.
  - `Password`: Masked text input.
  - `Role`: Dropdown selection (Stock Manager, Cashier). *Note: Owner creation is usually restricted.*
- **Features:** Validates the presence of all fields. Passes credentials to the backend to create a new user profile.

---

## 👑 2. Owner Pages
*(Located in `/src/pages/` - Accessible ONLY to the `'owner'` role via protected routes.)*

### `Dashboard.jsx` (Owner Overview)
- **Features:** The primary control center featuring a suite of KPI (Key Performance Indicator) metric cards.
- **Data Visualizations:** Utilizes custom CSS grid charts (`.bar-col`) and Donut Rings (`.donut-ring`).
- **Fields / Metrics Present:**
  - Total Revenue 
  - Active Orders 
  - Total Products in Stock
  - Low Stock Warning Count

### `Products.jsx` (Product Master List)
- **Features:** Full CRUD (Create, Read, Update, Delete) hub for inventory. Pagination enabled.
- **Interactive Elements:** Omni-search bar for quick lookup, "Add Product" button.
- **Table Fields:**
  - `SKU / ID`: Unique product identifier.
  - `Name`: String.
  - `Category`: Relational link to standard categories.
  - `Price`: Retail value.
  - `Cost`: Wholesale value.
  - `Quantity`: Current available stock.

### `Categories.jsx`
- **Features:** Grid visualization of product types. Allows creation of new taxonomy branches.
- **Fields (in Cards/Modals):**
  - `Category Name`
  - `Icon / Identifier`
  - `Item Count` (Dynamically calculated based on associated products).

### `StockAlerts.jsx`
- **Features:** Intelligently filters all products where `Quantity <= Reorder Threshold`.
- **Fields:**
  - `Product Name`
  - `Current Stock`
  - `Threshold`
  - `Action required`: E.g., a shortcut link prompting a new Purchase Order.

### `Purchases.jsx` (Procurement)
- **Features:** Overview of inbound B2B transactions. Status tracking (e.g., Pending, Completed).
- **Fields:**
  - `PO Number`
  - `Date Raised`
  - `Supplier`
  - `Total Cost`
  - `Delivery Status`

### `Suppliers.jsx`
- **Features:** A CRM (Customer/Vendor Relationship Management) view natively for your stock suppliers.
- **Fields:**
  - `Company Name`
  - `Contact Person`
  - `Phone / Email`
  - `Address`

### `Users.jsx` (Employee Roster)
- **Features:** Manage system access. Deactivate users or elevate permissions.
- **Fields:**
  - `Avatar/Name`
  - `Email Address`
  - `Role` (Owner, Cashier, Stock Manager)
  - `Account Status` (Active / Suspended)

### `Settings.jsx`
- **Features:** Global application constants.
- **Fields:**
  - `Store Name`
  - `Tax Rate (%)`: Applied at the POS.
  - `Default Currency`: Toggles system-wide formatting.

### `Reports.jsx`
- **Features:** Advanced financial/inventory analytics with **PDF Generation capabilities**.
- **Interactive Elements:**
  - `Report Type Selector` (Sales, Valuation, Shrinkage).
  - `Date Range Picker` (Start Date, End Date).
  - "Export as PDF" button.

---

## 🚛 3. Stock Manager Pages
*(Located in `/src/pages/stockmgr/` - Accessible to the `'stockmgr'` role.)*

### `SmDashboard.jsx` (Logistics Overview)
- **Features:** A focused dashboard removing financial data (revenue), leaving only physical movement data.
- **Elements:** Lists of "Pending Incoming Deliveries" and "Urgent Low Stock items".

### `StockList.jsx`
- **Features:** A rapid search and visual interface for verifying physical shelf locations and quantities. Similar to the Owner's Product page but without cost/financial editing capabilities.

### `ItemDetails.jsx` (or `/:id`)
- **Features:** Deep-dive into a single SKU's history.
- **Displayed Data:** Total sold, total received, variant information.

### `ReceiveStock.jsx`
- **Purpose:** Used when a delivery truck arrives. Increases database integer quantities.
- **Fields:**
  - `Supplier / PO Reference`: Auto-fills expected items if selected.
  - `Product ID` (Scanned or searched).
  - `Quantity Received`.
  - `Notes`: Condition of goods (e.g., "Received intact").

### `Dispatch.jsx`
- **Purpose:** Decreasing stock for valid reasons *other* than retail sales (e.g., wholesale fulfillment, moving to a different site).
- **Fields:**
  - `Reason/Destination`.
  - `Items list`.

### `AdjustStock.jsx` (Auditing & Corrections)
- **Purpose:** Used during physical stock-takes/inventory.
- **Fields:**
  - `Product`.
  - `Expected Quantity` (from DB, read-only).
  - `Actual Counted Quantity`.
  - `Reason for Discrepancy`: Dropdown (Theft, Damage, Misplaced).

### `ActivityLog.jsx`
- **Purpose:** A chronological, tamper-proof ledger of all movement actions (Received, Adjusted, Sold).
- **Fields:** `Timestamp`, `User ID` (who did it), `Action Type`, `Product Affected`, `Delta (+/- Quantity)`.

---

## 💳 4. Cashier Pages
*(Located in `/src/pages/cashier/` - Accessible to the `'cashier'` role.)*

### `CashierPOS.jsx` (Point of Sale Environment)
- **Purpose:** High-speed checkout processor. Optimized layout minimizing clicks.
- **1. Search / Barcode Area:**
  - `Query Field`: Accepts Keyboard typing or Barcode Scanner input to rapidly add to cart.
- **2. The Current Cart (Left/Center Panel):**
  - Displays `Item Name`, `Qty`, `Unit Price`, `Subtotal` per line item.
  - Buttons to quickly adjust qty (`+`, `-`) or remove an item (`x`).
- **3. Calculator / Checkout Panel (Right Side):**
  - **Metrics:** `Gross Subtotal`, System-Calculated `Tax`, `Final Total`.
  - **Payment UI:** `Payment Method` Dropdown (Cash, Card, Digital Wallet).
  - **Action Target:** "Complete Sale" button.
- **Background Logic:** Processing the sale simultaneously generates a Sales record, calculates revenue, and immediately deducts the sold quantities from the centralized database preventing stock-outs.
