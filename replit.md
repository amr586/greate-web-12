# إسكنك - Real Estate Platform (Great Society)

## Project Overview
A fullstack React + Node.js real estate platform for the Egyptian market. Features property browsing, search, AI-powered property assistant, image uploads, and multi-role dashboards. UI is primarily in Arabic (RTL).

## Demo Accounts (password: Admin@2024)
- **Super Admin**: superadmin@iskantek.com — full control
- **Data Entry**: dataentry@iskantek.com — add, edit, delete properties
- **Property Manager**: propmanager@iskantek.com — approve/reject user-submitted properties
- **Analytics**: analytics@iskantek.com — view reports, revenue, and case stats
- **Support**: support@iskantek.com — manage support tickets, see user phone numbers

## Role System
- `superadmin`: Full access (users, properties, payments, analytics)
- `admin` + `sub_role`:
  - `data_entry`: Add, edit, delete any property
  - `property_manager`: Approve/reject pending properties, view user name & phone
  - `analytics`: Analytics charts, revenue, property stats by month
  - `support`: Manage user tickets, see user phone number for direct contact
- `user`: Browse properties, submit properties (phone required), create support inquiries

## Key Feature: User Inquiry
When a user inquires, they see the company phone (01100111618) and can open a support ticket. Support team sees user's phone number to contact them directly.

## Tech Stack
### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6 (port 5000)
- **Styling:** Tailwind CSS 4 + Radix UI components
- **Routing:** React Router 7
- **State:** React Context API (AuthContext, AppContext)
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)

### Backend
- **Runtime:** Node.js + Express (port 3001)
- **Language:** TypeScript (tsx)
- **Database:** PostgreSQL (via pg pool)
- **Auth:** JWT + bcrypt
- **File Uploads:** Multer → /uploads directory
- **AI:** OpenAI API (gpt-4o-mini) via Replit integration

## Project Structure
```
src/app/
  components/   # Reusable UI (AIChat, Navbar, etc.)
  pages/        # AddProperty, Properties, Home, Login, etc.
  context/      # AuthContext, AppContext
  lib/api.ts    # API client + streamChat

server/
  index.ts      # Express entry point
  db.ts         # PostgreSQL pool
  setup-db.ts   # DB schema creation + seed data
  routes/
    properties.ts   # CRUD + search + save
    auth.ts         # Login, register, JWT
    ai-chat.ts      # OpenAI streaming chat + recommend
    upload.ts       # Multer image upload
    admin.ts        # Admin/superadmin routes
    support.ts      # Support tickets
    payments.ts     # Payment requests

uploads/        # Uploaded property images
```

## Database Tables
- users, properties, property_images, saved_properties
- payment_requests, support_tickets, support_messages
- ai_conversations, ai_messages
- property_chat_messages (direct chat between admin/superadmin and property owners)

## Development
```bash
pnpm install
# Start frontend (port 5000)
pnpm run dev
# Start backend (port 3001)
npx tsx server/index.ts
# Setup DB (first time only)
npx tsx server/setup-db.ts
```

## Default Test Accounts
- Super Admin: superadmin@iskantek.com (Admin@2024)
- Data Entry: dataentry@iskantek.com (Admin@2024)
- Property Manager: propmanager@iskantek.com (Admin@2024)
- Analytics: analytics@iskantek.com (Admin@2024)
- Support: support@iskantek.com (Admin@2024)
- User: user@example.com (User@2024)

## Key Features
- Property listing with image upload from device (up to 5 images)
- AI chat assistant trained on real DB properties - gives recommendations by category (family, students, investors, etc.)
- Admin approval workflow for properties
- Saved/favorite properties
- Multi-role system (user, admin, superadmin with sub-roles)
- **Admin notifications**: When any user submits a property, all admins/superadmins get an in-dashboard notification with the user's full name, email, and phone number
- **16 seeded properties** covering Cairo and Alexandria markets (طريق السويس, التجمع الخامس, جولدن سكوير, العاصمة الإدارية, التجمع السادس, and Alexandria)
- **Property Chat**: Direct chat between superadmin/property_manager and the user who submitted the property. Accessible from SuperAdmin & SubAdmin (property_manager) dashboards. Users can chat from their dashboard "محادثاتي" tab. NOT accessible to data_entry or support roles.
- **Password Security**: Registration requires password with min 8 chars, at least 1 capital letter (A-Z), and 1 special symbol. Enforced on both frontend and backend.
- **OTP Verification**: New user registration requires email/phone OTP verification before account creation.
- **OTP Login**: Login is 2-step — credentials first, then a 6-digit OTP sent to email. In dev mode (no SMTP), `devOtp` auto-fills the boxes. Production requires `SMTP_USER` + `SMTP_PASS` env vars.
- **Purchase Request Notifications**: When a user submits a payment/purchase request, all superadmin users AND all admin users with `sub_role='property_manager'` automatically receive a dashboard notification with full purchase details.
- **SubAdmin Dashboard**: Property manager sub-role has full property management (edit, delete, add), purchase requests tab (with approve action), and buyer/owner communication chat. Data entry sub-role has listings + add property tabs only.
- **Footer Links**: Privacy policy and terms of service links open Google Drive PDFs in a new tab.

## Notifications System
- Route: `server/routes/notifications.ts` registered at `/api/notifications`
- When property added → auto-notifies all admins + superadmins in DB
- Admin dashboard at `/admin/notifications` shows user info (name/email/phone) + property details
- `GET /api/notifications/admin` — returns all notifications (requires admin auth)
- `PATCH /api/notifications/mark-read/:id` — marks read

## DB Migration Scripts
- `server/migrate.ts` — adds missing columns (rooms, views, description_ar, city, order_index)
- `server/seed-new-properties.ts` — seeds the 10 new Cairo properties
- Run with: `npx tsx server/migrate.ts` and `npx tsx server/seed-new-properties.ts`
