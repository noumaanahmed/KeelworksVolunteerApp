# Netlify + Railway Deployment Guide

This project is designed to run in two modes:

1. **Local development**
   - Applicant portal: `http://localhost:3001`
   - Admin portal: `http://localhost:3002`
   - API: `http://localhost:3000`
   - MySQL: local MySQL

2. **Public deployment**
   - Applicant portal: Netlify site 1
   - Admin portal: Netlify site 2
   - API: Railway Node/Express service
   - Database: Railway MySQL service

Use one shared API and one shared MySQL database for both portals. The applicant portal writes applications, and the admin portal reads/manages those same applications.

---

## 1. Local development

Create local environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/applicant-portal/.env.example apps/applicant-portal/.env
cp apps/admin-portal/.env.example apps/admin-portal/.env
```

Install dependencies:

```bash
npm install
```

Run the local SQL setup script in MySQL Workbench:

```text
docs/setup/00_RUN_ALL_IN_ORDER.sql
```

Start local services:

```bash
npm run dev:api
npm run dev:applicant
npm run dev:admin
```

---

## 2. Railway MySQL setup

Create a Railway project and add a MySQL database.

In Railway, open the MySQL service and copy the connection details. You can connect from MySQL Workbench using the public TCP proxy values shown in Railway.

For a hosted Railway database, use this SQL file:

```text
docs/setup/SQL_STARTUP_SCRIPT_HOSTED.sql
```

Before running it, select the Railway database/schema as the default schema in MySQL Workbench. You usually do not need to create a separate `volunteer_management` database on Railway.

Run the script once during setup. Run it again only if you intentionally want to wipe the hosted data and reset the schema.

---

## 3. Railway API setup

Create a Railway service from this GitHub repo.

Use these settings:

```text
Build command: npm install
Start command: npm run start:api
Root directory: /
```

This repo also includes `railway.json`, which tells Railway to start the backend with:

```bash
npm run start:api
```

Set the API service variables using `deploy/railway-api.env.example` as the template.

Minimum required API variables:

```env
NODE_ENV=production
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
ADMIN_SIGNUP_SECRET=replace_with_a_private_admin_signup_key
CORS_ORIGIN=https://your-applicant-site.netlify.app,https://your-admin-site.netlify.app
```

The API also supports Railway's individual MySQL variables:

```env
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=...
MYSQLHOST=...
MYSQLPORT=3306
```

Test the deployed API:

```bash
curl https://your-railway-api.up.railway.app/health
curl https://your-railway-api.up.railway.app/api/v1/locations/countries
```

---

## 4. Applicant Netlify site

Create a Netlify site from this same GitHub repo.

Settings:

```text
Base directory: leave blank
Build command: npm run build:applicant
Publish directory: apps/applicant-portal/build
```

Set this Netlify environment variable:

```env
REACT_APP_API_BASE_URL=https://your-railway-api.up.railway.app
```

Deploy. Rename the site if desired, for example:

```text
https://keelworks-applicant.netlify.app
```

---

## 5. Admin Netlify site

Create a second Netlify site from the same GitHub repo.

Settings:

```text
Base directory: leave blank
Build command: npm run build:admin
Publish directory: apps/admin-portal/build
```

Set this Netlify environment variable:

```env
REACT_APP_API_BASE_URL=https://your-railway-api.up.railway.app
```

Deploy. Rename the site if desired, for example:

```text
https://keelworks-admin.netlify.app
```

---

## 6. Update Railway CORS after Netlify URLs are final

After both Netlify sites exist, update the Railway API service variable:

```env
CORS_ORIGIN=https://keelworks-applicant.netlify.app,https://keelworks-admin.netlify.app
```

Redeploy/restart the Railway API.

---

## 7. Production test checklist

1. Open applicant Netlify URL.
2. Create applicant account.
3. Submit an application.
4. Confirm applicant dashboard shows the application.
5. Open admin Netlify URL.
6. Create admin account using the production `ADMIN_SIGNUP_SECRET`.
7. View the application.
8. Use `View & Act` to update status.
9. Confirm status history is recorded.
10. Connect to Railway MySQL from Workbench and verify rows in `users`, `Employee`, and `ApplicationStatusHistory`.

---

## 8. Important notes

- Do not commit real `.env` files.
- Do not share `MYSQLPASSWORD`, `DATABASE_URL`, `JWT_SECRET`, or `ADMIN_SIGNUP_SECRET`.
- The SQL setup script is not run automatically on deploy. Run it manually once in MySQL Workbench.
- Future code pushes redeploy the Netlify sites and Railway API, but they do not wipe the database.
