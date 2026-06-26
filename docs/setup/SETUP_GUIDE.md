# KeelWorks Volunteer App — Setup Guide
## All 4 Changes Applied

---

## ✅ What Was Changed

| # | Change | Status |
|---|--------|--------|
| 1 | Sign In / Sign Up page (admin + applicant roles) | ✅ Done |
| 2 | MySQL connected with your credentials | ✅ Done |
| 3 | Country → State → City selection fixed | ✅ Done |
| 4 | Confirmation email on submission | ✅ Done |

---

## 🗄️ STEP 1: Run the Database Migration

Open **MySQL Workbench**, connect to your database, and run this file:
`apps/api/docs/sql/create_users_table.sql`

Or paste this SQL directly:

```sql
USE volunteer_management;

CREATE TABLE IF NOT EXISTS users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'applicant') NOT NULL DEFAULT 'applicant',
  full_name   VARCHAR(100) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📧 STEP 2: Set Up Gmail for Confirmation Emails

1. Go to your Google Account → **Security** → **2-Step Verification** (enable if not on)
2. Then go to: https://myaccount.google.com/apppasswords
3. Select **App: Mail**, **Device: Other** → type "KeelWorks" → click **Generate**
4. Copy the **16-character password** shown

Then open:
`apps/api/.env`

And update these two lines:
```
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← the 16-char password (spaces are fine)
```

---

## ⚙️ STEP 3: Install New Dependencies

Open terminal in the backend folder and run:

```bash
cd apps/api
npm install
cd src
npm install bcryptjs nodemailer
```

---

## 🚀 STEP 4: Start the Backend

```bash
cd apps/api
npm start
```

You should see:
```
Database connection has been established successfully.
Server listening on http://localhost:3000/
```

---

## 🌐 STEP 5: Start the Frontend

```bash
cd apps/applicant-portal
npm install
npm start
```

Frontend runs on: http://localhost:3001

---

## 👤 STEP 6: Create Your Admin Account

Go to http://localhost:3001 → click **Sign Up** → choose **Admin** role.

The admin secret key is: `keelworks-admin-2024`

(You can change this in the backend `.env` by adding: `ADMIN_SIGNUP_SECRET=your_secret`)

---

## 🔐 How It Works

### Sign In / Sign Up
- **Applicants** sign up normally → see the volunteer application form
- **Admins** sign up with the admin secret → see the Admin Dashboard
- Sessions persist via localStorage (8-hour JWT token)

### Admin Dashboard
- View all submitted applications with pagination
- Click **View** to see full details of any application
- See status: Pending / Reviewing / Approved / Rejected

### Country → State → City Fix
- **Select country first** → State dropdown populates automatically
- **Select state** → City field enables with autocomplete
- Correct order: Country → State → City (was broken before)

### Confirmation Email
- Automatically sent to the applicant's email after successful submission
- Professional HTML email with KeelWorks branding
- If email is not configured in `.env`, it skips gracefully (no crash)

---

## 📁 New Files Added

**Backend:**
- `src/data/models/userModel.js` — User database model
- `src/controllers/authController.js` — Signup / Signin / GetMe
- `src/routes/authRoutes.js` — Auth API routes
- `src/utils/emailService.js` — Gmail confirmation email
- `src/.env` — Updated with your MySQL credentials
- `docs/sql/create_users_table.sql` — SQL to create users table

**Frontend:**
- `src/components/AuthPage.js` — Sign In / Sign Up UI
- `src/components/AdminDashboard.js` — Admin view of all applications
- `src/components/PersonalInformation.js` — Fixed country/state/city order
- `src/App.js` — Updated to route between auth / admin / applicant views

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Database connection failed" | Check MySQL is running on port 3306, password is Manish@12 |
| States not loading | Make sure backend is running and CORS_ORIGIN matches frontend URL |
| Email not sending | Double-check Gmail app password, make sure 2FA is enabled on Google account |
| "Admin access required" | Make sure you're signed in as admin (role = admin in users table) |
| Cities not showing | Select country first, then state — city field is disabled until state is chosen |
