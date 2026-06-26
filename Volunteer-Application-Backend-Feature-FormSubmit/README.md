# Volunteer Application Backend API

## Description
A Node.js backend application for managing volunteer applications. The system handles user registration, document uploads, and location-based data management.

## Features
- User registration and profile management
- Location services (Countries, States, Cities)
- Document upload functionality
- RESTful API endpoints
- Swagger API documentation

## Technology Stack
- Node.js
- Express.js
- MySQL with Sequelize ORM
- Google Drive API for document storage
- Docker
- Swagger for API documentation

## Prerequisites
- Node.js (v16+)
- Docker and Docker Compose
- MySQL
- Google Drive API credentials

## Installation

1. Clone the repository
```bash
git clone [repository-url]
cd volunteer-application-backend
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Create a `.env` file in the root directory:
```
MYSQL_DB_NAME=your_database_name
MYSQL_USERNAME=your_username
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
JWT_SECRET=JWT_SECRET
CORS_ORIGIN=Cors_origin
MYSQL_PORT=3306
GOOGLE_DRIVE_KEY=your_google_drive_key
```

4. Docker Setup
```bash
docker-compose up --build
```

## API Documentation
Access Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Location Services
- `GET /api/v1/apply/countries` - Get all countries
- `GET /api/v1/apply/states/:countryCode` - Get states by country code
- `GET /api/v1/apply/cities/:stateCode` - Get cities by state code
- `GET /api/v1/apply/countryPhoneCodes` - Get country phone codes

### Employee Management
- `POST /api/v1/apply/employees` - Create new employee
- `POST /api/v1/apply/upload` - Upload documents

## Database Schema
The application uses the following main tables:
- Employee
- Education
- Employment
- Address
- Country
- State
- City

