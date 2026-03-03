🏢 Slooze – Commodities Management System

A role-based Commodities Management System built as part of the Slooze Front-End Take-Home Challenge.

This application enables Managers and Store Keepers to manage inventory efficiently with proper role-based access control, dynamic dashboard insights, and theme customization.

🚀 Live Demo

(Add your deployed Vercel link here if available)

🔐 Demo Credentials
👩‍💼 Manager
Email: manager@slooze.com  
Password: 123456
🏬 Store Keeper
Email: store@slooze.com  
Password: 123456
📌 Features
1️⃣ Authentication & Access Control

Secure login with role-based redirection

Persistent session using localStorage

Route protection for restricted pages

Logout with confirmation modal

2️⃣ Role-Based Access (RBAC)
Feature	Manager	Store Keeper
Dashboard	✅	❌
View Products	✅	✅
Add Product	✅	✅
Edit Product	✅	✅
Delete Product	✅	❌
Sidebar Dashboard Link	✅	❌

✔ Store Keeper cannot access dashboard (even via manual URL entry)
✔ Delete button visible only to Manager
✔ Sidebar dynamically renders based on role

3️⃣ Dashboard (Manager Only)

Operational overview including:

Total Products

Low Stock Items

Critical Stock Items

Total Inventory Units

Real-time sync with product state

📊 Dashboard statistics dynamically update when:

Products are added

Products are edited

Stock levels change

Products are deleted

All data is computed from global product state.

4️⃣ Products Management

View all commodities in a structured table

Add new product (modal form)

Edit product details

Delete product (Manager only)

Category dropdown selection

Emoji selector dropdown

Stock status badges:

🟢 In Stock

🟡 Low Stock

🔴 Critical

All changes persist after refresh.

5️⃣ Global State Architecture

Implemented using Context API:

AuthContext → Authentication & user role

ProductContext → Global products state

ThemeContext → Light/Dark mode state

This ensures:

Centralized state management

Real-time dashboard synchronization

Persistence across page refresh

Clean separation of concerns

6️⃣ Light / Dark Mode

Full application theme toggle

Persistent theme preference

Smooth transitions

Applied globally across all pages

--------------------------------------------------------------------------- Architecture Overview -----------------------------------------------------------
app/
 ├── login/
 ├── (protected)/
 │     ├── layout.tsx   → Sidebar layout
 │     ├── dashboard/
 │     ├── products/
context/
 ├── AuthContext.tsx
 ├── ProductContext.tsx
 ├── ThemeContext.tsx
components/
 ├── Sidebar.tsx
 ├── ProductModal.tsx
Design Principles:

Component reusability

Context-driven architecture

Role-based UI rendering

Persistent global state

Clean SaaS-style layout

------------------------------------------------------------------------------- UI/UX Design ------------------------------------------------------------

Professional internal SaaS interface

Sidebar-driven navigation

Status indicators for inventory health

Modal-based Add/Edit forms

Smooth theme transitions

Clean and minimal styling using Tailwind CSS

  -----------------------------------------------------------------------------Tech Stack -------------------------------------------------------------------

Frontend: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: React Context API

Routing: Next.js file-based routing

Persistence: localStorage

 --------------------------------------------------------------------------How To Run Locally -------------------------------------------------------------------
# Clone the repository
git clone <your-repo-link>

# Navigate to project
cd slooze-frontend

# Install dependencies
npm install

# Start development server
npm run dev

Open:

http://localhost:3000
-----------------------------------------------------------------------Implementation Highlights -----------------------------------------------------------------

Fully functional RBAC system

Dynamic dashboard synchronization

Persistent product state

Route protection

Conditional UI rendering

Clean architecture separation

Light/Dark theme system

---------------------------------------------------------------------------------Assignment Alignment---------------------------------------------------------------

This implementation satisfies:

✅ Authentication & role-based access

✅ Manager-only dashboard

✅ Products view for both roles

✅ Add/Edit functionality

✅ Delete restricted to Manager

✅ Role-based sidebar rendering

✅ Light/Dark mode toggle

✅ Clean, professional UI

💡 Future Improvements (Optional Enhancements)

Backend integration (GraphQL / Apollo)

Advanced filtering & sorting

Export inventory reports

Analytics visualization (charts)
-----------------------------------------------------------------------------Conclusion----------------------------------------------------------------

This project demonstrates:

Understanding of role-based systems

Clean architectural thinking

Dynamic state synchronization

Real-world SaaS UI implementation

Attention to access control and UX
