# KeelWorks Volunteer Application Platform

A cleaned MVP for the KeelWorks volunteer application workflow. The project is an npm-workspaces monorepo with two React portals and one Express/MySQL API.

The app supports two ways of running:

- **Local development:** applicant portal, admin portal, Express API, and local MySQL.
- **Public deployment:** applicant portal on Netlify, admin portal on Netlify, Express API on Railway, and MySQL on Railway or another managed MySQL provider.

## Workspaces

| Workspace | Purpose | Default Port |
|---|---|---:|
| `apps/applicant-portal` | Applicant sign-up, sign-in, dashboard, and volunteer application form | `3001` |
| `apps/admin-portal` | Admin sign-up, sign-in, and application review dashboard | `3002` |
| `apps/api` | Express API, auth, application workflow, email, and MySQL persistence | `3000` |
| `packages/shared-ui` | Shared React UI components used by both portals | n/a |

## Current MVP Features

### Applicant portal

- Applicant sign-up and sign-in.
- Applicant dashboard for submitted applications.
- Multi-step volunteer application form.
- Country, state/province, and city lookup.
- Application submission tied to the signed-in user account.
- Optional confirmation email after submission.
- MDB-styled authentication screen.

### Admin portal

- Admin sign-up and sign-in.
- Admin-only dashboard.
- Paginated application list.
- Full application detail modal.
- Controlled application status workflow.
- Status action buttons based on the current status.
- Internal notes and status history timeline.
- MDB-styled authentication screen.

### Backend API

- JWT authentication.
- Admin authorization middleware.
- Centralized error handling.
- Environment validation at startup.
- Layered backend structure: routes, controllers, services, repositories, models.
- Sequelize models for the active MVP schema.
- Transaction-based application creation.
- Application ownership through `users.user_id -> Employee.user_id`.
- EEO record linked through `EEOData.employee_id`.
- Admin status audit trail through `ApplicationStatusHistory`.

## Admin Application Workflow

The admin portal uses a controlled early-onboarding status flow:

```text
submitted
  -> under_review
  -> accepted
  -> forwarded
  -> on_hold
  -> declined

accepted
  -> acceptance_email_sent
  -> awaiting_intro_response

forwarded
  -> accepted
  -> on_hold
  -> declined
```

Admins should open an application, review the full details, choose one of the available actions, and optionally add an internal note. The backend validates transitions so applications cannot jump to invalid statuses. Each status change is recorded in `ApplicationStatusHistory`.

The app does not automate Gmail templates yet. Admins should still send the matching Gmail template manually for accepted, forwarded, on-hold, and declined decisions.

## Project Structure

```text
KeelworksVolunteerApp/
  apps/
    applicant-portal/
      src/
        components/
        config/
          api.js
        styles/
          app.css
          auth-page.css
        App.js
        index.js
      .env.example
      package.json

    admin-portal/
      src/
        api/
        components/
        config/
          api.js
        styles/
          admin-dashboard.css
          auth-page.css
        App.js
        index.js
      .env.example
      package.json

    api/
      src/
        app.js
        server.js
        index.js
        config/
        controllers/
        mappers/
        middleware/
        models/
        repositories/
        routes/
        services/
        utils/
        validators/
      .env.example
      package.json

  packages/
    shared-ui/

  deploy/
    railway-api.env.example
    netlify-applicant.env.example
    netlify-admin.env.example

  docs/
    deployment/
      NETLIFY_RAILWAY_DEPLOYMENT.md
    setup/
      SQL_SETUP_SCRIPT.sql

  railway.json
  package.json
  README.md
```

## Frontend Styling

Both React portals use MDB React UI Kit for the authentication layout. Portal-level styles live outside components:

```text
apps/applicant-portal/src/styles/
  app.css
  auth-page.css

apps/admin-portal/src/styles/
  admin-dashboard.css
  auth-page.css
```

Use inline styles only for truly dynamic values. Layout, form, button, dashboard, and auth styling should live in the appropriate `styles/` file.

## Backend Architecture

Backend requests follow this flow:

```text
React portal
  -> Express app
  -> route file
  -> middleware
  -> controller
  -> service
  -> repository
  -> Sequelize model
  -> MySQL table
  -> JSON response
```

Why this structure is used:

- **Routes** define URL paths and attach middleware.
- **Controllers** translate HTTP requests/responses.
- **Services** contain business workflows.
- **Repositories** perform database access.
- **Validators** normalize and validate incoming data.
- **Models** describe database tables and relationships.
- **Middleware** handles auth, validation, and errors.

## Prerequisites

Install these before running locally:

- Node.js 18+
- npm 9+
- MySQL 8+

## Local Environment Setup

Create local `.env` files from the examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/applicant-portal/.env.example apps/applicant-portal/.env
cp apps/admin-portal/.env.example apps/admin-portal/.env
```

Update `apps/api/.env` for your local MySQL setup:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

MYSQL_DB_NAME=volunteer_management
MYSQL_USERNAME=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
ADMIN_SIGNUP_SECRET=replace_with_a_private_admin_signup_key

EMAIL_USER=
EMAIL_APP_PASSWORD=
```

Email settings are optional. If Gmail credentials are not configured, confirmation email sending is skipped without blocking application submission.

Do not commit real `.env` files. Commit only `.env.example` files.

## Database Setup

There is only one setup/reset script:

```text
docs/setup/SQL_SETUP_SCRIPT.sql
```

Run this script in MySQL Workbench or your MySQL client for first-time setup. It wipes and recreates the active MVP tables and seeds the required location data.

The script creates/uses this database by default:

```text
volunteer_management
```

For a hosted MySQL provider like Railway, use the same script. If your provider gives you a fixed database/schema name, update the top of the script to use that database before running it.

Run this script:

- once during initial local setup,
- once during initial hosted database setup,
- again only when you intentionally want to wipe/reset the database.

The active MVP tables are:

- `users`
- `Employee`
- `Address`
- `Country`
- `State`
- `City`
- `Education`
- `Employment`
- `EEOData`
- `ApplicationStatusHistory`

## Install Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for all workspaces and generates the root `package-lock.json`.

## Run Locally

Open three terminals from the repository root.

### API

```bash
npm run dev:api
```

Health check:

```text
http://localhost:3000/health
```

### Applicant portal

```bash
npm run dev:applicant
```

Applicant portal:

```text
http://localhost:3001
```

### Admin portal

```bash
npm run dev:admin
```

Admin portal:

```text
http://localhost:3002
```

## Build and Check

```bash
npm run check:api
npm run build:applicant
npm run build:admin
```

## Public Deployment Summary

The project is prepared for:

```text
Netlify site 1: Applicant portal
  Build command: npm run build:applicant
  Publish directory: apps/applicant-portal/build

Netlify site 2: Admin portal
  Build command: npm run build:admin
  Publish directory: apps/admin-portal/build

Railway service 1: Express API
  Start command: npm run start:api

Railway service 2: MySQL database
  Run docs/setup/SQL_SETUP_SCRIPT.sql once from MySQL Workbench
```

Both Netlify sites should use the same API variable:

```env
REACT_APP_API_BASE_URL=https://your-railway-api.up.railway.app
```

The Railway API should allow both Netlify origins:

```env
CORS_ORIGIN=https://your-applicant-site.netlify.app,https://your-admin-site.netlify.app
```

Full deployment instructions are in:

```text
docs/deployment/NETLIFY_RAILWAY_DEPLOYMENT.md
```

## API Endpoints

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Create applicant/admin account |
| `POST` | `/api/v1/auth/signin` | Sign in |
| `GET` | `/api/v1/auth/me` | Get current signed-in user |

Admin sign-up requires `admin_secret` matching `ADMIN_SIGNUP_SECRET`.

### Locations

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/locations/countries` | Get countries |
| `GET` | `/api/v1/locations/states/:countryCode` | Get states for a country code |
| `GET` | `/api/v1/locations/cities/:stateId` | Get cities for a state ID |
| `POST` | `/api/v1/locations/cities/resolve` | Find or create a city by `state_id` and `city_name` |

### Applications

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/applications` | Applicant | Submit volunteer application |
| `GET` | `/api/v1/applications/me` | Applicant | Get signed-in applicant submissions |
| `GET` | `/api/v1/applications/admin` | Admin | Get paginated application list |
| `GET` | `/api/v1/applications/admin/:employeeId` | Admin | Get full application details |
| `PATCH` | `/api/v1/applications/admin/:employeeId/status` | Admin | Update application status |
| `POST` | `/api/v1/applications/confirmation-email` | Public | Process optional confirmation email |

## Development Rules

- Do not commit real `.env` files.
- Keep route files thin.
- Keep controllers thin.
- Put business workflows in services.
- Put database access in repositories.
- Keep database setup in `docs/setup/SQL_SETUP_SCRIPT.sql` until a real migration system is introduced.
- Add a new endpoint only when it is connected end-to-end from frontend to backend to database.

## Recommended Next Features

1. Add automated tests for auth, validation, application submission, and admin status updates.
2. Add admin due dates/reminders for forwarded candidates and accepted candidates awaiting intro scheduling.
3. Add manual email template helper panels for Accepted, Forwarded, On Hold, and Declined workflows.
4. Add intro-meeting and participation-agreement tracking after `awaiting_intro_response`.
5. Rebuild resume upload using a clear multipart endpoint and database-backed file metadata.
6. Reintroduce Swagger/OpenAPI only after the endpoint design stabilizes.
