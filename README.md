# KeelWorks Volunteer Application Platform

A professionalized MVP for the KeelWorks volunteer application workflow. The repository is an npm-workspaces monorepo with two React portals and one Express/MySQL API.

This version is ready for both local development and public deployment:

- Local: React portals + Express API + local MySQL
- Public: two Netlify frontend sites + Railway Express API + Railway MySQL

## Workspaces

| Workspace | Purpose | Default Port |
|---|---|---:|
| `apps/applicant-portal` | Applicant sign-up, sign-in, dashboard, and volunteer application form | `3001` |
| `apps/admin-portal` | Admin sign-up, sign-in, and application review dashboard | `3002` |
| `apps/api` | Express API, auth, validation, application workflow, email, and MySQL persistence | `3000` |
| `packages/shared-ui` | Shared React UI components used by both portals | n/a |

## What This MVP Includes

### Applicant portal

- Applicant account sign-up and sign-in with MDB-styled authentication layout
- Applicant dashboard showing submitted applications
- Multi-step volunteer application form
- Country/state/city lookup
- Application submission tied to the signed-in user account
- Optional confirmation email after submission

### Admin portal

- Admin account sign-up and sign-in with MDB-styled authentication layout
- Admin-only dashboard
- Paginated application list
- Full application details modal
- Controlled application status workflow
- Status action buttons based on the current application state
- Internal notes and status history timeline

### Backend API

- JWT authentication
- Admin authorization middleware
- Centralized error handling
- Environment validation at startup
- Layered backend structure: routes, controllers, services, repositories, models
- Sequelize models for the active MVP schema
- Transaction-based application creation
- Application ownership through `users.user_id -> Employee.user_id`
- EEO record linked to the submitted application through `EEOData.employee_id`
- Admin status transitions with audit history through `ApplicationStatusHistory`


## Admin Application Workflow

The admin portal now supports a controlled status flow for the early onboarding decision process:

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

Admins should open an application from the dashboard, review the full details, select one of the available next actions, and optionally add an internal note. The backend validates transitions so an application cannot jump to an invalid status. Each change is recorded in `ApplicationStatusHistory`.

The app does not send Gmail templates automatically yet. For accepted, forwarded, on-hold, and declined actions, admins should still send the matching Gmail template manually, then mark the status in the portal.

### SQL files

- `docs/setup/00_RUN_ALL_IN_ORDER.sql` is the main local first-time/reset setup script.
- `docs/setup/SQL_STARTUP_SCRIPT.sql` is kept as a descriptive copy of the same full reset setup.
- `docs/setup/SQL_STARTUP_SCRIPT_HOSTED.sql` is the hosted-database version for Railway or another managed MySQL database where you select the database/schema before running the script.
- `docs/setup/01_add_admin_status_workflow.sql` is a migration for an existing professional MVP database when you do not want to wipe current data.

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
          env.js
          database.js
        controllers/
          applications.controller.js
          auth.controller.js
          locations.controller.js
        mappers/
          application.mapper.js
        middleware/
          auth.middleware.js
          error.middleware.js
          validate-request.middleware.js
        models/
          index.js
          *.model.js
        repositories/
          applications.repository.js
          locations.repository.js
          users.repository.js
        routes/
          index.js
          applications.routes.js
          auth.routes.js
          locations.routes.js
        services/
          applications.service.js
          auth.service.js
          email.service.js
          locations.service.js
        utils/
          api-response.js
          app-error.js
          async-handler.js
        validators/
          application.validator.js
      .env.example
      package.json

  packages/
    shared-ui/
      src/
        ProfileMenu.js
      package.json

  deploy/
    railway-api.env.example
    netlify-applicant.env.example
    netlify-admin.env.example

  docs/
    deployment/
      NETLIFY_RAILWAY_DEPLOYMENT.md
    setup/
      00_RUN_ALL_IN_ORDER.sql
      SQL_STARTUP_SCRIPT.sql
      SQL_STARTUP_SCRIPT_HOSTED.sql

  railway.json
  package.json
  README.md
```


## Frontend Styling

Both React portals use the MDB React UI Kit for the authentication screen layout and shared CSS classes for the radial-gradient glass-card design. Portal-level styles are kept outside components:

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

Backend requests now follow a consistent feature-based flow:

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

### Why this structure is easier to maintain

- **Routes** only define URL paths and middleware.
- **Controllers** only translate HTTP requests/responses.
- **Services** contain business workflows.
- **Repositories** are the only files that directly query Sequelize models.
- **Validators** normalize and validate incoming application data.
- **Models** describe the active database schema.
- **Middleware** handles cross-cutting concerns like auth, request validation, and errors.

## Main Backend Flows

### Applicant submits application

```text
POST /api/v1/applications
  -> verifyToken
  -> requireJsonBody
  -> applications.controller.createApplication
  -> applications.service.submitApplication
  -> application.validator.validateApplicationPayload
  -> locations.service.assertLocationReferencesExist
  -> applications.repository.createApplication
  -> Address, Employee, EEOData, Education, Employment
```

Important: the submitted `personal_email` must match the signed-in applicant account email. This keeps applications tied to the correct `users.user_id`.

### Applicant views own applications

```text
GET /api/v1/applications/me
  -> verifyToken
  -> applications.controller.listMyApplications
  -> applications.service.getMyApplications
  -> applications.repository.findApplicationsByUserId
```

### Admin views applications

```text
GET /api/v1/applications/admin?page=1&limit=10
  -> verifyToken
  -> requireAdmin
  -> applications.controller.listAdminApplications
  -> applications.service.getAdminApplications
  -> applications.repository.listApplications
```

## Prerequisites

Install these before running locally:

- Node.js 18+
- npm 9+
- MySQL 8+

## Environment Setup

Create local `.env` files from the examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/applicant-portal/.env.example apps/applicant-portal/.env
cp apps/admin-portal/.env.example apps/admin-portal/.env
```

Update `apps/api/.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

MYSQL_DB_NAME=volunteer_management
MYSQL_USERNAME=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
ADMIN_SIGNUP_SECRET=replace_with_a_private_admin_signup_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

Email settings are optional. If Gmail credentials are not configured, confirmation email sending is skipped without blocking application submission.

## Database Setup

SQL setup is kept in:

```text
docs/setup/00_RUN_ALL_IN_ORDER.sql
```

Run this script in MySQL Workbench or your MySQL client for local first-time setup. It wipes and recreates the active MVP tables and seeds country/state data.

For Railway or another hosted MySQL database, use:

```text
docs/setup/SQL_STARTUP_SCRIPT_HOSTED.sql
```

Select the hosted database/schema as the default schema in MySQL Workbench before running the hosted script.

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

API health check:

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

## Build Frontends

```bash
npm run build:applicant
npm run build:admin
```

## Public Deployment

The project is prepared for two separate Netlify frontend sites and one Railway backend/database stack.

Recommended setup:

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
  Run docs/setup/SQL_STARTUP_SCRIPT_HOSTED.sql once from MySQL Workbench
```

Both Netlify sites should use the same environment variable:

```env
REACT_APP_API_BASE_URL=https://your-railway-api.up.railway.app
```

The Railway API should allow both Netlify origins:

```env
CORS_ORIGIN=https://your-applicant-site.netlify.app,https://your-admin-site.netlify.app
```

Full instructions are in:

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
| `GET` | `/api/v1/applications/me` | Applicant | Get signed-in applicant's submissions |
| `GET` | `/api/v1/applications/admin` | Admin | Get paginated application list |
| `POST` | `/api/v1/applications/confirmation-email` | Public | Process optional confirmation email |

## Development Rules

- Do not commit real `.env` files.
- Keep route files thin.
- Keep controllers thin.
- Put business workflows in services.
- Put database access in repositories.
- Add database columns to `docs/setup/SQL_STARTUP_SCRIPT.sql` when adding persisted fields.
- Add a new endpoint only when it is connected end-to-end from frontend to backend to database.

## Recommended Next Features

1. Add automated tests for auth, validation, application submission, and admin status updates.
2. Add admin due dates/reminders for forwarded candidates and accepted candidates awaiting intro scheduling.
3. Add manual email template helper panels for Accepted, Forwarded, On Hold, and Declined workflows.
4. Add intro-meeting and participation-agreement tracking after `awaiting_intro_response`.
5. Rebuild resume upload using a clear multipart endpoint and database-backed file metadata.
6. Reintroduce Swagger/OpenAPI after the endpoint design stabilizes.
