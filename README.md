# KeelWorks Volunteer Management Platform

A full-stack volunteer management application built for KeelWorks. The platform allows volunteers/applicants to create accounts, submit profile/application details, and allows admins to review submitted applications.

The current version includes both applicant and admin flows in one application. The long-term plan is to separate this into two applications:

1. Volunteer Portal — for volunteers/applicants to sign up and submit applications.
2. Admin Portal — for admins to sign up, review applications, and manage volunteer records.

## Features

### Volunteer / Applicant Features

* Create an applicant account
* Sign in with email and password
* Fill out a multi-step volunteer application form
* Select country, state, and city
* Add personal information
* Add role and availability details
* Add employment history
* Submit volunteer application
* View submitted applications

### Admin Features

* Create an admin account using an admin secret key
* Sign in as admin
* View submitted volunteer applications
* See application status such as pending/reviewing/approved/rejected

### Backend Features

* REST API built with Express.js
* MySQL database integration using Sequelize
* JWT-based authentication
* Role-based access control for applicant/admin users
* Database migrations/setup scripts
* Applicant data stored across normalized tables such as users, Employee, Address, City, State, Country, Employment, and EEOData
* Optional confirmation email support through Gmail app password

## Tech Stack

### Frontend

* React
* JavaScript
* CSS
* localStorage for session persistence

### Backend

* Node.js
* Express.js
* Sequelize ORM
* MySQL
* JWT authentication
* bcrypt password hashing
* nodemailer for optional email confirmation

### Database

* MySQL
* MySQL Workbench recommended for local setup

## Project Structure

```text
keelworks-volunteer-platform/
  apps/api/
    docs/
      sql/
        00_RUN_ALL_IN_ORDER.sql
        01_add_user_name_columns.sql
        02_fix_remaining_gaps.sql
        03_add_interested_role.sql
    src/
      config/
      controllers/
      data/
      docs/
      dtos/
      middleware/
      routes/
      test/
      utils/
      .env.example
      index.js
      package.json

  apps/applicant-portal/
    src/
      components/
      App.js
      index.js
    package.json
```

## Local Setup Guide

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MySQL Server
* MySQL Workbench
* Git

## 1. Clone the Repository

```bash
git clone <repo-url>
cd <repo-folder>
```

## 2. Set Up the MySQL Database

Open MySQL Workbench and connect to your local MySQL server.

First, create the database manually:

```sql
CREATE DATABASE IF NOT EXISTS volunteer_management;
USE volunteer_management;
```

Then run the SQL setup scripts in this order:

```text
00_RUN_ALL_IN_ORDER.sql
01_add_user_name_columns.sql
02_fix_remaining_gaps.sql
03_add_interested_role.sql
```

If MySQL Workbench gives a safe update error, temporarily disable safe updates by running:

```sql
SET SQL_SAFE_UPDATES = 0;
```

After running the scripts, you can turn it back on:

```sql
SET SQL_SAFE_UPDATES = 1;
```

To confirm the setup worked, run:

```sql
USE volunteer_management;
SHOW TABLES;
```

You should see tables such as:

```text
users
Employee
Address
Country
State
City
Employment
Education
EEOData
Resume
```

## 3. Configure Backend Environment Variables

Go to the backend `src` folder:

```bash
cd apps/api
```

Create a `.env` file:

```bash
touch .env
```

Use this template:

```env
MYSQL_DB_NAME=volunteer_management
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306

JWT_SECRET=keelworks_jwt_secret_2024
ADMIN_SIGNUP_SECRET=keelworks-admin-2024

CORS_ORIGIN=http://localhost:3001

EMAIL_USER=
EMAIL_APP_PASSWORD=

GOOGLE_DRIVE_KEY=
```

Replace:

```env
MYSQL_PASSWORD=your_mysql_password
```

with your actual local MySQL password.

For local testing, email and Google Drive values can be left blank:

```env
EMAIL_USER=
EMAIL_APP_PASSWORD=
GOOGLE_DRIVE_KEY=
```

Do not commit your real `.env` file to GitHub.

## 4. Start the Backend

From the backend `src` folder:

```bash
npm install
npm start
```

The backend should run on:

```text
http://localhost:3000
```

Expected successful output:

```text
Database connection has been established successfully.
Server running on http://localhost:3000/
```

## 5. Start the Frontend

Open a new terminal window.

Go to the frontend folder:

```bash
cd apps/applicant-portal
npm install
npm start
```

The frontend should run on:

```text
http://localhost:3001
```

## 6. Clear Browser Local Storage

Before testing a fresh login session, open the browser console and run:

```js
localStorage.clear();
location.reload();
```

This clears old login/session data.

## 7. Test the Application

### Applicant Test

1. Open `http://localhost:3001`
2. Create a new applicant account
3. Fill out the volunteer application form
4. Submit the application
5. Confirm that the backend logs show a successful transaction with `COMMIT`

To verify in MySQL Workbench:

```sql
USE volunteer_management;

SELECT *
FROM users;

SELECT *
FROM Employee;
```

### Admin Test

1. Sign up as an admin
2. Use the admin secret key:

```text
keelworks-admin-2024
```

3. Sign in as admin
4. View submitted applications in the admin dashboard

## Useful Database Queries

Check a user account:

```sql
SELECT *
FROM users
WHERE email = 'test@example.com';
```

Check a submitted application:

```sql
SELECT *
FROM Employee
WHERE personal_email = 'test@example.com';
```

Check application with address details:

```sql
SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  e.personal_email,
  e.interested_role,
  e.application_status,
  a.address1,
  a.address2,
  a.zip_code,
  c.city_name,
  s.state_name,
  co.country_name
FROM Employee e
LEFT JOIN Address a ON e.address_id = a.address_id
LEFT JOIN City c ON a.city_id = c.city_id
LEFT JOIN State s ON c.state_id = s.state_id
LEFT JOIN Country co ON e.country_id = co.country_id
WHERE e.personal_email = 'test@example.com';
```

## Common Issues

### MySQL Error: Unknown database `volunteer_management`

Create the database first:

```sql
CREATE DATABASE IF NOT EXISTS volunteer_management;
USE volunteer_management;
```

Then rerun the setup scripts.

### MySQL Error: Access denied for user

Check your backend `.env` file:

```env
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_actual_mysql_password
```

Make sure the password matches the password used in MySQL Workbench.

### React Error: `react-scripts: Permission denied`

Reinstall frontend dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

If needed:

```bash
chmod +x node_modules/.bin/react-scripts
npm start
```

### Email not configured

This message is expected if email credentials are blank:

```text
Email not configured — skipping confirmation email.
```

To enable confirmation emails, configure:

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_character_gmail_app_password
```

## Current Architecture

The current application has one frontend and one backend:

```text
React Frontend
  ↓
Express Backend API
  ↓
MySQL Database
```

Main flow:

```text
User signs up
  ↓
Backend stores account in users table
  ↓
Applicant submits application
  ↓
Backend stores application in Employee, Address, Employment, EEOData, and related tables
  ↓
Admin can view submitted applications
```

## Planned Architecture

The recommended future architecture is:

```text
Volunteer Frontend
  ↓
Shared Backend API
  ↓
Shared MySQL Database
  ↑
Admin Frontend
```

This would separate the user experience into:

1. Volunteer Portal

   * Applicant signup
   * Application submission
   * Application status view

2. Admin Portal

   * Admin signup/signin
   * Application review
   * Approve/reject/review actions
   * Search/filter/export applications

## Security Notes

* Do not commit `.env` files.
* Do not commit database passwords.
* Do not commit Gmail app passwords.
* Do not commit JWT secrets.
* Use `.env.example` for placeholder values only.
* Admin signup should always require the admin secret key.
* Admin-only routes should remain protected by JWT and role checks.

## Git Ignore Recommendation

Add a `.gitignore` file with:

```gitignore
node_modules/
.env
.env.local
.env.production
.DS_Store
npm-debug.log
dist/
build/
```

## License

Internal project for KeelWorks volunteer management workflows.
