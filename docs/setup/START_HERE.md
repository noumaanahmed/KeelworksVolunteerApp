# KeelWorks — Final Setup Guide

## ✅ What's included in this version
1. Sign In / Sign Up with Admin + Applicant roles
2. MySQL connected with your credentials
3. Country (195 countries) → State → free-text City
4. Confirmation email on submission
5. **NEW:** Fixed frontend/backend field-name mismatches that were blocking submission:
   - Replaced "Birth Date" requirement with a simple "Are you 18+?" Yes/No question
   - Made LinkedIn URL optional
   - Hours/week is now a number field
   - Visa status now accepts any value (F1, H1B, OPT, etc.) not just 5 fixed options
   - Fixed a backend bug where the new application wasn't actually being saved before responding (missing `await`)

---

## STEP 1 — Run the SQL setup file

Open MySQL Workbench → File → Open SQL Script → select:
```
apps/api/docs/sql/00_RUN_ALL_IN_ORDER.sql
```
Click ⚡ Execute. This is safe to re-run — it won't delete any existing data.

---

## STEP 2 — Start the Backend

```
cd apps/api\src
npm install
npm start
```
Wait for: `✅ Server running on http://localhost:3000/`

---

## STEP 3 — Start the Frontend (new terminal window)

```
cd apps/applicant-portal
npm install
npm start
```
Opens at `http://localhost:3001`

---

## STEP 4 — Test it

1. Sign Up as **Admin** (secret: `keelworks-admin-2024`)
2. Sign out, Sign Up as **Applicant**
3. Fill out the 5-step form:
   - Country → State → type your City freely
   - Step 5 now asks "Are you 18+?" first
4. Submit — you should see "Application submitted successfully!"
5. Sign back in as Admin → see the new application in the dashboard

---

## Email setup (optional)
Edit `apps/api/.env`:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```
Get an app password at: https://myaccount.google.com/apppasswords

---

## Ports
| Service  | Port |
|----------|------|
| Backend  | 3000 |
| Frontend | 3001 |

## If submission still fails
Watch the **backend terminal** when you click Submit — it will now print the exact validation error (e.g. "Visa status is required" or "Please provide valid hours commitment"). Paste that error and we can fix the specific field.
