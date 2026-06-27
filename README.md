# KeelWorks Volunteer Management Platform

A full-stack volunteer management platform for KeelWorks.

This project contains three main applications:

1. **Applicant Portal** — for volunteers/applicants to sign up, sign in, and submit volunteer applications.
2. **Admin Portal** — for admins to sign in and review submitted volunteer applications.
3. **Backend API** — shared Express/MySQL API used by both frontends.

The project is organized as a monorepo using **npm workspaces**.

---

## Project Structure

```text
KeelworksVolunteerApp/
  apps/
    applicant-portal/        # React frontend for volunteer applicants
    admin-portal/            # React frontend for admins
    api/                     # Express + MySQL backend API

  database/
    sql/                     # SQL setup and database migration scripts

  docs/
    setup/                   # Extra setup notes and project documentation

  scripts/
    manual-tests/            # Optional/manual test scripts

  package.json              # Root workspace package.json
  package-lock.json          # Root npm lock file
  .gitignore
  README.md
```

---

## Tech Stack

### Frontend

* React
* JavaScript
* CSS
* React Scripts / Create React App style setup

### Backend

* Node.js
* Express
* MySQL
* Sequelize
* JWT authentication
* Nodemon for local development

### Repository Setup

* npm workspaces
* One root `node_modules`
* One root `package-lock.json`
* Separate `package.json` files for each app

---

## Applications

## 1. Applicant Portal

Location:

```text
apps/applicant-portal
```

Purpose:

The applicant portal is used by volunteers to:

* Create an applicant account
* Sign in
* Start a volunteer application
* Fill out personal information
* Fill out education and experience
* Choose role and availability
* Enter additional information
* Submit the application

Default local URL:

```text
http://localhost:3001
```

Environment file:

```text
apps/applicant-portal/.env
```

Example:

```env
PORT=3001
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

## 2. Admin Portal

Location:

```text
apps/admin-portal
```

Purpose:

The admin portal is used by admins to:

* Sign in as an admin
* View submitted volunteer applications
* Review applicant details

Default local URL:

```text
http://localhost:3002
```

Environment file:

```text
apps/admin-portal/.env
```

Example:

```env
PORT=3002
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

## 3. Backend API

Location:

```text
apps/api
```

Purpose:

The backend API is shared by both frontends.

It handles:

* Authentication
* Applicant signup/signin
* Admin signup/signin
* Volunteer application submission
* Admin application review
* Country/state/city lookup data
* Email confirmation logic
* Resume upload logic, which exists but needs a later cleanup/fix pass

Default local URL:

```text
http://localhost:3000
```

Environment file:

```text
apps/api/.env
```

---

# Backend Folder Structure Explained

The backend source code lives inside:

```text
apps/api/src
```

Current structure:

```text
apps/api/src/
  config/
  controllers/
  docs/
  mappers/
  middleware/
  models/
  repositories/
  routes/
  services/
  validators/
  index.js
```

---

## `src/index.js`

This is the backend entry point.

It is responsible for:

* Creating the Express app
* Loading middleware
* Enabling JSON request parsing
* Enabling CORS
* Connecting routes
* Starting the server on the configured port
* Loading Swagger API docs if enabled
* Testing the database connection

The backend starts from this file when you run:

```bash
npm run dev:api
```

---

## `src/config/`

The `config` folder contains configuration files used by the backend.

Expected files include:

```text
config/
  dbConnect.js
  googleDrive.js
  swagger.js
```

### `dbConnect.js`

Handles the MySQL database connection.

It is responsible for:

* Reading database values from `.env`
* Creating the Sequelize connection
* Testing database connectivity

The backend depends on this file to connect to MySQL.

### `googleDrive.js`

Contains Google Drive configuration for resume/document upload.

This exists because the application has resume upload-related code.

Current note:

Resume upload should be reviewed and fixed in a later pass before being considered complete.

### `swagger.js`

Configures Swagger/OpenAPI documentation.

It is used to serve backend API docs, usually at:

```text
http://localhost:3000/api-docs
```

---

## `src/controllers/`

The `controllers` folder contains request/response logic.

Controllers receive requests from routes, call repositories/services/validators, and send responses back to the frontend.

Expected files:

```text
controllers/
  apply.controller.js
  auth.controller.js
  document.controller.js
  employee.controller.js
```

### `apply.controller.js`

Handles general application-related API logic.

Used for:

* Getting countries
* Getting states
* Getting cities
* Getting country phone codes
* Creating a city
* Sending confirmation emails
* Getting a logged-in applicant’s applications

Example routes connected to this controller:

```text
GET  /api/v1/apply/countries
GET  /api/v1/apply/states/:countryCode
GET  /api/v1/apply/cities/:stateCode
GET  /api/v1/apply/countryPhoneCodes
POST /api/v1/apply/send-confirmation-email
GET  /api/v1/apply/my-applications
```

### `auth.controller.js`

Handles authentication.

Used for:

* Applicant signup
* Applicant signin
* Admin signup
* Admin signin
* Password validation
* JWT token creation

Example routes connected to this controller:

```text
POST /api/v1/auth/signup
POST /api/v1/auth/signin
```

### `employee.controller.js`

Handles volunteer application records.

Used for:

* Creating/submitting an application
* Getting all applications for admins
* Getting a single application by ID
* Updating application data
* Deleting application data

Example routes connected to this controller:

```text
POST   /api/v1/apply/employees
GET    /api/v1/apply/employees
GET    /api/v1/apply/employees/:id
PUT    /api/v1/apply/employees/:id
DELETE /api/v1/apply/employees/:id
```

### `document.controller.js`

Handles document/resume upload logic.

Current note:

This file exists because the applicant form has a resume-related flow. The upload flow should be fixed later so it properly connects to the logged-in applicant and stores resume metadata correctly.

---

## `src/routes/`

The `routes` folder defines the API endpoints.

Expected files:

```text
routes/
  apply.routes.js
  auth.routes.js
  index.js
```

### `index.js`

Main route entry point.

It connects route groups to the Express app.

For example:

```text
/api/v1/auth
/api/v1/apply
```

### `auth.routes.js`

Defines authentication routes.

Usually includes:

```text
POST /signup
POST /signin
```

Mounted under:

```text
/api/v1/auth
```

So the full route becomes:

```text
POST /api/v1/auth/signup
POST /api/v1/auth/signin
```

### `apply.routes.js`

Defines application, location, upload, and admin review routes.

Mounted under:

```text
/api/v1/apply
```

Common full routes include:

```text
GET  /api/v1/apply/countries
GET  /api/v1/apply/states/:countryCode
GET  /api/v1/apply/cities/:stateCode
POST /api/v1/apply/employees
GET  /api/v1/apply/employees
GET  /api/v1/apply/employees/:id
```

---

## `src/middleware/`

Middleware runs between the request and the controller.

Expected files:

```text
middleware/
  auth.middleware.js
  validation.middleware.js
```

### `auth.middleware.js`

Handles JWT authentication and admin authorization.

Used for:

* Verifying that a user is logged in
* Reading the JWT token
* Attaching the user to the request
* Restricting admin-only routes

Common functions:

```text
verifyToken
requireAdmin
```

### `validation.middleware.js`

Currently contains a simple request body check.

It verifies that required POST/PUT requests actually include a body.

Detailed application validation is handled separately inside:

```text
src/validators/application/
```

and used by:

```text
src/controllers/employee.controller.js
```

---

## `src/models/`

The `models` folder contains Sequelize models.

Models represent database tables.

Expected files:

```text
models/
  addressModel.js
  cityModel.js
  countryModel.js
  educationModel.js
  employeeModel.js
  employmentModel.js
  eeoModel.js
  resumeModel.js
  stateModel.js
  userModel.js
```

### What models do

Models define:

* Table names
* Column names
* Data types
* Required fields
* Database relationships if configured

Example:

```text
userModel.js
```

Represents the users table.

```text
employeeModel.js
```

Represents volunteer applicant/application records.

```text
educationModel.js
```

Represents education history.

```text
employmentModel.js
```

Represents employment history.

```text
countryModel.js, stateModel.js, cityModel.js
```

Represent location lookup tables.

---

## `src/repositories/`

The `repositories` folder contains database query logic.

Expected files:

```text
repositories/
  application.repository.js
  location.repository.js
```

### What repositories do

Repositories should handle direct database operations such as:

* Creating records
* Reading records
* Updating records
* Deleting records
* Querying lookup tables

The idea is:

```text
Controller receives request
↓
Controller calls repository
↓
Repository talks to database
↓
Controller sends response
```

### `application.repository.js`

Handles database operations related to volunteer applications.

Used for:

* Registering/submitting employee/application data
* Saving applicant-related data
* Reading application records

### `location.repository.js`

Handles database operations for location data.

Used for:

* Countries
* States
* Cities
* Country phone codes

---

## `src/mappers/`

The `mappers` folder converts data from one shape to another.

Expected file:

```text
mappers/
  employee.mapper.js
```

### What mappers do

Frontend data and database data often do not have the exact same structure.

The mapper helps convert frontend application form data into the format expected by the backend/database.

Example:

```text
Frontend form payload
↓
employee.mapper.js
↓
Backend/database-ready object
```

This keeps transformation logic out of controllers.

---

## `src/services/`

The `services` folder contains business logic or external service integrations.

Expected file:

```text
services/
  email.service.js
```

### `email.service.js`

Handles email-related logic.

Used for:

* Sending confirmation emails
* Email utility functions
* Any email integration logic

Services are useful because they keep controllers cleaner.

---

## `src/validators/`

The `validators` folder contains validation logic.

Expected structure:

```text
validators/
  legacy.validation.js
  application/
    index.js
    commonValidations.js
    address/
    education/
    employee/
    employment/
    eod/
```

### `validators/application/`

This is the main validation area for volunteer application data.

It validates things like:

* Personal information
* Address information
* Education information
* Employment information
* EEO information

This validation is used when applicants submit an application.

### `legacy.validation.js`

Older validation helper file.

This may still exist for compatibility. It can be reviewed later to decide whether it should be kept, merged, or removed.

---

## `src/docs/`

The `docs` folder inside the API contains backend API documentation files, especially Swagger/OpenAPI-related files.

Expected structure:

```text
docs/
  swagger/
```

Used by:

```text
src/config/swagger.js
```

This allows the backend to serve API documentation.

---

# Root Workspace Setup

This project uses npm workspaces.

The root `package.json` should look similar to this:

```json
{
  "name": "keelworks-volunteer-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/applicant-portal",
    "apps/admin-portal",
    "apps/api"
  ],
  "scripts": {
    "dev:api": "npm run dev --workspace apps/api",
    "dev:applicant": "npm start --workspace apps/applicant-portal",
    "dev:admin": "npm start --workspace apps/admin-portal",
    "build:applicant": "npm run build --workspace apps/applicant-portal",
    "build:admin": "npm run build --workspace apps/admin-portal"
  }
}
```

Each app still has its own `package.json`.

That is normal and required.

The root manages all workspaces together.

---

# Important Dependency Notes

Keep these:

```text
package.json
package-lock.json
apps/applicant-portal/package.json
apps/admin-portal/package.json
apps/api/package.json
```

Do not commit these:

```text
node_modules/
apps/applicant-portal/node_modules/
apps/admin-portal/node_modules/
apps/api/node_modules/
.env
```

With npm workspaces, install dependencies from the root:

```bash
npm install
```

This creates one root-level `node_modules` and one root-level `package-lock.json`.

---

# Prerequisites

Install these before running the project:

* Node.js
* npm
* MySQL
* Git
* VS Code or another editor

Recommended:

```text
Node.js 20 LTS or 22 LTS
```

If you are using a very new Node version and something behaves strangely, try using an LTS version.

---

# Local Setup Instructions

Follow these steps from the repo root.

## 1. Clone the repository

```bash
git clone git@github.com:noumaanahmed/KeelworksVolunteerApp.git
cd KeelworksVolunteerApp
```

If you already have the project locally, just go to the project root:

```bash
cd "/Users/noumaanahmed/Downloads/KeelworksVolunteerApp"
```

---

## 2. Install dependencies

From the repo root:

```bash
npm install
```

This installs dependencies for all three workspaces:

```text
apps/api
apps/applicant-portal
apps/admin-portal
```

Do not run `npm install` separately inside each app unless you specifically need to debug that app.

---

## 3. Create environment files

Create local `.env` files from the examples.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/applicant-portal/.env.example apps/applicant-portal/.env
cp apps/admin-portal/.env.example apps/admin-portal/.env
```

---

## 4. Configure applicant portal environment

Open:

```text
apps/applicant-portal/.env
```

Use:

```env
PORT=3001
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

## 5. Configure admin portal environment

Open:

```text
apps/admin-portal/.env
```

Use:

```env
PORT=3002
REACT_APP_API_BASE_URL=http://localhost:3000
```

---

## 6. Configure backend environment

Open:

```text
apps/api/.env
```

Example:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB_NAME=volunteer_management
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password_here

# Auth
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_SIGNUP_SECRET=replace_with_admin_signup_secret

# CORS
CORS_ORIGIN=http://localhost:3001

# Email confirmation
EMAIL_USER=your_email@example.com
EMAIL_APP_PASSWORD=your_email_app_password

# Google Drive / Resume Upload
GOOGLE_DRIVE_KEY=
GOOGLE_DRIVE_FOLDER_ID=
```

Update these values:

```text
MYSQL_PASSWORD
JWT_SECRET
ADMIN_SIGNUP_SECRET
EMAIL_USER
EMAIL_APP_PASSWORD
```

For local testing, email and Google Drive values may be left blank if you are not testing those features.

---

# Database Setup

## 1. Open MySQL

Use MySQL Workbench or the MySQL terminal.

## 2. Create the database

Run:

```sql
CREATE DATABASE IF NOT EXISTS volunteer_management;
USE volunteer_management;
```

## 3. Run SQL scripts

SQL scripts are stored in:

```text
database/sql/
```

Recommended order:

```text
00_RUN_ALL_IN_ORDER.sql
01_add_user_name_columns.sql
02_fix_remaining_gaps.sql
03_add_interested_role.sql
```

If MySQL safe update mode blocks a script, temporarily run:

```sql
SET SQL_SAFE_UPDATES = 0;
```

After the script finishes, turn it back on:

```sql
SET SQL_SAFE_UPDATES = 1;
```

---

# Running the Project

Use three separate terminal tabs.

---

## Terminal 1: Start the backend API

From the repo root:

```bash
npm run dev:api
```

Expected local backend URL:

```text
http://localhost:3000
```

You should see output showing the backend started and connected to the database.

---

## Terminal 2: Start the applicant portal

From the repo root:

```bash
npm run dev:applicant
```

Expected local applicant portal URL:

```text
http://localhost:3001
```

---

## Terminal 3: Start the admin portal

From the repo root:

```bash
npm run dev:admin
```

Expected local admin portal URL:

```text
http://localhost:3002
```

---

# Quick API Test

After starting the backend, test this public route:

```bash
curl -i http://localhost:3000/api/v1/apply/countries
```

A successful response should include:

```text
HTTP/1.1 200 OK
```

and JSON country data.

You can also open this in the browser:

```text
http://localhost:3000/api/v1/apply/countries
```

---

# Basic Manual Testing Flow

## Applicant flow

1. Open:

```text
http://localhost:3001
```

2. Sign up or sign in as an applicant.
3. Start a new application.
4. Fill out the form.
5. Submit the application.
6. Confirm you reach the thank-you/success page.

## Admin flow

1. Open:

```text
http://localhost:3002
```

2. Sign in as an admin.
3. Check whether the submitted application appears in the admin dashboard.

---

# Local Storage Keys

The applicant portal uses:

```text
kw_volunteer_token
kw_volunteer_user
```

The admin portal uses:

```text
kw_admin_token
kw_admin_user
```

If login behaves strangely during local development, clear browser local storage for localhost.

---

# Common Commands

Install all dependencies:

```bash
npm install
```

Run backend:

```bash
npm run dev:api
```

Run applicant portal:

```bash
npm run dev:applicant
```

Run admin portal:

```bash
npm run dev:admin
```

Build applicant portal:

```bash
npm run build:applicant
```

Build admin portal:

```bash
npm run build:admin
```

Check Git status:

```bash
git status
```

Commit changes:

```bash
git add -A
git commit -m "Your commit message"
git push
```

---

# Troubleshooting

## `react-scripts: command not found`

Run from the repo root:

```bash
npm install
```

If it still fails:

```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

Then try again:

```bash
npm run dev:applicant
```

---

## Backend cannot connect to MySQL

Check:

```text
apps/api/.env
```

Confirm:

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_DB_NAME
MYSQL_USERNAME
MYSQL_PASSWORD
```

Also make sure MySQL is running and the database exists:

```sql
CREATE DATABASE IF NOT EXISTS volunteer_management;
```

---

## API route returns 404

Confirm the backend is running:

```bash
npm run dev:api
```

Then test:

```bash
curl -i http://localhost:3000/api/v1/apply/countries
```

If this fails, check the route registration in:

```text
apps/api/src/routes/index.js
apps/api/src/routes/apply.routes.js
```

---

## Port already in use

If port 3000, 3001, or 3002 is already being used, stop the old process or change the relevant `.env` file.

Common ports:

```text
API:              3000
Applicant Portal: 3001
Admin Portal:     3002
```

---

## `.env` changes are not taking effect

Restart the app.

For React frontend `.env` changes, you must stop and restart the dev server.

---

## Old login/session issues

Clear local storage in the browser.

Chrome:

```text
Developer Tools
Application
Local Storage
http://localhost:3001 or http://localhost:3002
Clear
```

Then refresh and sign in again.

---

# Notes for Future Cleanup

The project has already been reorganized into a cleaner monorepo structure.

Future cleanup/fix passes can include:

1. Resume upload flow cleanup
2. Swagger/API docs cleanup
3. Backend model naming consistency
4. Better service/repository separation
5. Better error response standardization
6. Deployment setup
7. Testing setup

---

# Current Known Notes

* Applicant and admin portals are now separated.
* Backend API is shared by both portals.
* The project uses npm workspaces.
* Environment examples should be committed.
* Real `.env` files should not be committed.
* Resume upload exists but should be reviewed and fixed later.
