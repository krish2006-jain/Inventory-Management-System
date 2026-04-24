# Stockly - Inventory Management System

Stockly is a modern, multi-tenant SaaS application designed to help businesses manage their inventory, sales, and staff efficiently. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it provides strict data isolation, role-based access control, and a suite of tools for daily operations.

## ✨ Features

*   **Multi-Tenancy Architecture**: Complete data isolation. Each business (tenant) operates in its own secure environment.
*   **Role-Based Access Control (RBAC)**:
    *   **Owner**: Full access to dashboard, inventory, POS, settings, staff management, and financial overviews.
    *   **Stock Manager**: Access to manage inventory, product categories, and stock adjustments.
    *   **Cashier**: Access limited strictly to the Point of Sale (POS) system for processing transactions.
*   **Inventory Management**: Real-time stock tracking, categorization, and low-stock alerts.
*   **Point of Sale (POS)**: Streamlined interface for processing sales, applying discounts, and generating receipts.
*   **QR Code & Barcode Integration**: Use your device's camera to scan products quickly into the POS or during inventory intake.
*   **Automated Email Notifications**: Powered by Nodemailer for low stock alerts and user communications.
*   **Advanced Reporting**: Export professional PDF invoices and stock reports.
*   **Modern UI/UX**: Responsive, business-professional design built with Tailwind CSS.

##Live Deploy 
`https://inventory-management-system-1-ud6w.onrender.com`
## 🛠️ Technology Stack

**Frontend:**
*   React 19 (Vite)
*   React Router v7
*   Tailwind CSS v4
*   Axios for API communication
*   HTML5-QRCode for scanning
*   React Barcode

**Backend:**
*   Node.js & Express v5
*   MongoDB & Mongoose
*   JSON Web Tokens (JWT) & bcryptjs for Authentication
*   Nodemailer for Emails
*   PDFKit for document generation

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   MongoDB (Local instance or MongoDB Atlas)
*   An Email account (e.g., Gmail) for configuring Nodemailer

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd stockly
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file based on the provided sample below
```

**Backend `.env` sample:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_specific_password
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend development server
npm run dev
```
The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file based on the provided sample below
```

**Frontend `.env` sample:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the frontend development server
npm run dev
```
The frontend should now be running on `http://localhost:5173`.

## 📂 Project Structure

```
stockly/
├── backend/
│   ├── config/         # Database and third-party configurations
│   ├── controllers/    # Request handlers and business logic
│   ├── middleware/     # Auth, error handling, tenant identification
│   ├── models/         # Mongoose schemas (User, Product, Sale, Tenant, etc.)
│   ├── routes/         # Express API routes
│   └── server.js       # Backend entry point
│
└── frontend/
    ├── src/
    │   ├── assets/     # Images, icons
    │   ├── components/ # Reusable UI components (Sidebar, Navbar, Modals)
    │   ├── context/    # React Context (Auth, Tenant state)
    │   ├── pages/      # Route components (Dashboard, Inventory, POS, etc.)
    │   ├── services/   # API call abstractions (Axios instances)
    │   ├── App.jsx     # Main React application
    │   └── index.css   # Global Tailwind styles
    ├── index.html
    └── vite.config.js
```

## 🔒 Security & Data Isolation

Stockly employs a rigorous approach to data security:
*   **Passwords** are hashed using `bcryptjs`.
*   **Authentication** is handled via stateless HTTP-only JWTs (or secure local storage depending on implementation).
*   **Multi-Tenancy** is enforced at the database level. Every schema contains a `tenantId`, and backend middleware intercepts all requests to inject the active user's `tenantId` into queries, preventing cross-tenant data leakage.

## 📄 License

This project is licensed under the MIT License.
