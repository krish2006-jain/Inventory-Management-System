# Stockly - Inventory Management System 📦✨

Stockly is a modern, full-stack, Next-Generation Inventory Management System designed to give businesses total control over their supply chain operations. Built with a robust MERN (MongoDB, Express, React, Node.js) tech stack and utilizing an elegant custom-built "Workspace" design system, Stockly offers a premium, business-ready interface out-of-the-box.

---

## 🌟 Tech Stack

### Frontend (React & Vite)
- **Framework:** React 19 with Vite for ultra-fast Hot Module Replacement (HMR).
- **Styling:** Custom "Workspace" UI built using TailwindCSS v4 and bespoke vanilla CSS (`index.css` & `App.css`). Features include glassmorphism elements, dynamic micro-animations (like `riseIn` and `fade-in`), and a sleek indigo/purple professional color scheme.
- **Routing:** React Router v7 (`react-router-dom`) with intelligent Role-Based Access Control and Protected Routes.
- **State Management:** React Context API (`AuthContext`) for centralized and persistent authentication.

### Backend (Node.js & Express)
- **Runtime:** Node.js powered by Express.js 5 API engine.
- **Database:** MongoDB via `mongoose` ODM for flexible, document-based data modeling.
- **Security:** `bcryptjs` for robust password hashing and `jsonwebtoken` for secure, stateless Session Management.
- **Utilities:** `cors` for safe cross-origin resource sharing and `morgan` for detailed backend HTTP request logging.

---

## 👥 Role-Based Access Architecture

Stockly intrinsically supports three distinct tiers of operational roles, enabling scalable operations for growing businesses:

### 1. 👑 Owner (Administrator)
The highest level of access. Owners gain full oversight over every aspect of the business metrics, finances, and user provisioning.
- **Dashboard (`/dashboard`):** Real-time analytics, revenue tracking, and KPI summaries.
- **Reports (`/reports`):** Comprehensive historical reporting with PDF export capabilities.
- **Inventory Control:** Full CRUD operations across **Products (`/products`)** and **Categories (`/categories`)**.
- **Logistics:** Deep insights into **Purchases (`/purchases`)** and **Suppliers (`/suppliers`)**.
- **Management:** Track diminishing items via **Stock Alerts (`/stock-alerts`)**, handle employee **Users (`/users`)**, and configure global **Settings (`/settings`)**.

### 2. 🚛 Stock Manager
Designed for the warehouse floor. They operate the day-to-day incoming and outgoing logistics without having access to sensitive financial metrics.
- **Dashboard (`/sm/dashboard`):** Focused view highlighting immediate tasks and daily shipment quotas.
- **Stock Tracking:** Browse the **Stock List (`/sm/stock-list`)** and view granular **Item Details (`/sm/item-details/:id`)**.
- **Logistics Engine:** Perform active operational workflows such as **Receive Stock (`/sm/receive-stock`)** for inbound deliveries and **Dispatch (`/sm/dispatch`)** for outbound goods.
- **Corrections:** Execute precise manual audits using **Adjust Stock (`/sm/adjust-stock`)** and maintain accountability via the **Activity Log (`/sm/activity-log`)**.

### 3. 💳 Cashier (Point of Sale)
Built for speed. A streamlined, distraction-free Point of Sale (POS) environment for customer-facing representatives.
- **Cashier POS (`/cashier`):** Designed for rapid checkout, barcode scanning considerations, receipt generation, and real-time inventory deduction syncing.

---

## 🚀 Key Implemented Features

1. **Intelligent Auth Flow:**
   Smart routing architecture inside `App.jsx` handles redirection based on exactly who logs in (`<RedirectByRole />`). Authentication seamlessly directs an Owner to the primary dashboard, a Stock Manager to the operational dashboard, and a Cashier strictly to the POS register.

2. **Secure JWT Sessions:**
   Passwords are cryptographically hashed using `bcrypt` and users are administered encrypted JSON Web Tokens (JWT) ensuring the session remains inherently secure.

3. **Bespoke Animated Landing Page:**
   A stunning, dynamic landing page featuring a pulsating visual background and interactive UI tiles that educates end-users on platform capabilities before logging in.

4. **"Workspace" Design System:**
   An overarching, scalable CSS aesthetic combining `subtle-btn`, `primary-btn`, and `panel-surface` implementations globally.

5. **Advanced Dashboard Visuals:**
   CSS-drawn lightweight charts and donut rings for rapid rendering (in lieu of heavy chart libraries) ensuring the application remains blazing fast while delivering the insights the owners need manually styled within the grid templates.
