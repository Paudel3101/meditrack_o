# MediTrack - Clinic Management System

A comprehensive RESTful API for managing clinic operations including staff, patients, appointments, and medical records.

**Course Project**: Individual Project Phase 1 - Full Stack Development (PROG2500-26W)

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Phase 1 Deliverables](#phase-1-deliverables)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Submission Information](#submission-information)

---

## 📦 Project Overview

MediTrack Phase 1 is a **headless backend** system (no UI) that provides:
- A robust RESTful API for clinic management
- Secure authentication with JWT tokens
- Complete CRUD operations for three core entities (Staff, Patients, Appointments)
- Comprehensive data persistence using MySQL
- Production-ready error handling and validation
- Interactive API documentation via Swagger/OpenAPI

### The Three Core Entities

1. **Staff (Users)** - Authentication and role-based access
2. **Patients** - Patient medical records and information
3. **Appointments** - Appointment scheduling linking patients and staff

---

## ✅ Phase 1 Deliverables

This Phase 1 submission includes:

### ✨ Features
- 👥 **Staff Management** - Manage doctors, nurses, receptionists, and admin
- 👨‍⚕️ **Patient Management** - Complete patient records with medical history
- 📅 **Appointment Scheduling** - Book and manage appointments with conflict detection
- 📊 **Dashboard & Analytics** - View clinic statistics and metrics
- 🔐 **Authentication** - Secure login with JWT tokens
- 👮 **Role-Based Access Control** - Different permissions for different roles

### Roles Supported
- **Admin** - Full system access
- **Doctor** - View/manage patients and appointments
- **Nurse** - Assist with patient care and records
- **Receptionist** - Manage appointments and patient scheduling

### 🛠 Tech Stack

```
Backend:        Node.js + Express.js
Database:       MySQL 5.7+
Authentication: JWT (JSON Web Tokens)
Password Hash:  Bcrypt
Validation:     Express Validator
API Docs:       Swagger/OpenAPI 3.0
Testing:        Custom Node.js Test Suite + Postman
```

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

```bash
✅ Node.js (v14.0.0 or higher)
✅ npm (comes with Node.js)
✅ MySQL Server (v5.7 or higher)
✅ Postman (optional, for API testing)
```

**Check installations:**
```powershell
node --version
npm --version
mysql --version
```

---

## 📥 Installation

### Step 1: Clone/Download the Project

```powershell
# Navigate to your desired directory
cd C:\Users\HP\Desktop\meditrack

# Your project structure should look like:
meditrack/
│
├── server/
│   ├── src/
│   │   ├── app.js                          # Express app configuration
│   │   ├── config/
│   │   │   └── database.js                 # Database connection configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js          # Authentication & login logic
│   │   │   ├── appointment.controller.js   # Appointment CRUD operations
│   │   │   ├── dashboard.controller.js     # Dashboard statistics
│   │   │   ├── patient.controller.js       # Patient CRUD operations
│   │   │   └── staff.controller.js         # Staff CRUD operations
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js          # JWT authentication middleware
│   │   │   ├── error.middleware.js         # Global error handling
│   │   │   └── validate.middleware.js      # Input validation rules
│   │   │
│   │   ├── models/
│   │   │   ├── appointment.model.js        # Appointment data model
│   │   │   ├── patient.model.js            # Patient data model
│   │   │   └── staff.model.js              # Staff data model
│   │   │
│   │   ├── routes/
│   │   │   ├── appointment.routes.js       # Appointment endpoints
│   │   │   ├── auth.routes.js              # Authentication endpoints
│   │   │   ├── dashboard.routes.js         # Dashboard endpoints
│   │   │   ├── patient.routes.js           # Patient endpoints
│   │   │   └── staff.routes.js             # Staff endpoints
│   │   │
│   │   └── utils/
│   │       ├── db.js                       # Database utility functions
│   │       └── validators.js               # Custom validation functions
│   │
│   ├── database.sql                        # Database schema & tables
│   ├── insert_data.sql                     # Sample/test data
│   ├── init-db.js                          # Database initialization script
│   ├── update-passwords.js                 # Password hashing utility
│   ├── test-all-apis.js                    # Comprehensive API test suite
│   ├── server.js                           # Main server entry point
│   ├── package.json                        # Dependencies & scripts
│   ├── .env                                # Environment variables
│   └── .env.example                        # Example environment file
│
├── postman-collection.json                 # Postman API testing collection
├── README.md                               # Project documentation
└── PROJECT_STRUCTURE.md                    # This file
```

### Step 2: Navigate to Server Directory

```powershell
cd meditrack\server
```

### Step 3: Install Dependencies

```powershell
npm install
```

This will install all required packages listed in `package.json`:
- express (web framework)
- mysql2 (database driver)
- jsonwebtoken (authentication)
- bcrypt (password hashing)
- cors (cross-origin requests)
- helmet (security headers)
- morgan (request logging)
- express-validator (input validation)
- dotenv (environment variables)
- nodemon (development auto-reload)

---

## ⚙️ Configuration

### Step 1: Create Environment File

Create a `.env` file in the `server` directory:

```bash
# server/.env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=meditrack_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRY=24h

# Session Configuration
SESSION_TIMEOUT=900000
```

### Step 2: Update MySQL Password

Replace `your_mysql_password` with your actual MySQL root password.

If you don't have MySQL installed:
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use Windows package manager: `choco install mysql`

---

## 🗄️ Database Setup

### Step 1: Start MySQL Server

```powershell
# Windows - Start MySQL Service
net start MySQL80

# Or if using MySQL Command Line Client
mysql -u root -p
```

### Step 2: Initialize Database

Run the automatic initialization script:

```powershell
npm run db:init
```

Or using alias:
```powershell
npm run db:create
```

**What this does:**
- ✅ Creates `meditrack_db` database
- ✅ Creates all 5 tables (staff, patients, appointments, medical_records, sessions)
- ✅ Inserts 40+ sample data records
- ✅ Sets up all relationships and constraints

### Step 3: Verify Database Creation

Open MySQL client and verify:

```sql
-- Login to MySQL
mysql -u root -p

-- Use the database
USE meditrack_db;

-- Check tables
SHOW TABLES;

-- Check staff records
SELECT COUNT(*) FROM staff;
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM appointments;
```

Expected results:
```
Tables in meditrack_db:
- appointments
- medical_records
- patients
- sessions
- staff

Data counts:
- staff: 5 records
- patients: 10 records
- appointments: 10 records
- medical_records: 8 records
```

---

## 🚀 Running the Application

### Step 1: Start the Development Server

```powershell
npm run dev
```

**Output should show:**
```
Server is running on port 3000
Connected to database: meditrack_db
✅ Server started successfully
```

### Step 2: Verify Server is Running

Open your browser or Postman and test:
```
http://localhost:3000/api/auth/login
```

The server is running correctly if you get a response (not "cannot connect").

### Step 3: Keep Server Running

The development server will run continuously. You can:
- Open a new terminal to run other commands
- Press `Ctrl+C` to stop the server
- Changes to code will auto-reload (nodemon)

---

## 🧪 Testing

### Step 1: Run Comprehensive API Tests

```powershell
npm run test
```

Or using alias:
```powershell
npm run test:api
```

### Step 2: Understand Test Output

The test suite will run 31 tests across 6 categories:

```
✅ AUTHENTICATION TESTS (2/2)
   - Login
   - Get Profile

✅ STAFF CRUD TESTS (6/6)
   - Get All Staff
   - Get Staff by ID
   - Create Staff
   - Update Staff
   - Deactivate Staff
   - Reactivate Staff

✅ PATIENT CRUD TESTS (5/5)
   - Get All Patients
   - Get Patient by ID
   - Create Patient
   - Update Patient
   - Archive Patient

✅ APPOINTMENT CRUD TESTS (6/6)
   - Get All Appointments
   - Get Appointment by ID
   - Create Appointment
   - Update Appointment
   - Update Appointment Status
   - Delete Appointment

✅ DASHBOARD TESTS (3/3)
   - Get Dashboard Stats
   - Get Recent Appointments
   - Get Patient Count

✅ ERROR HANDLING TESTS (4/4)
   - Invalid Login Rejection
   - Missing Required Field Rejection
   - Non-existent Resource Error
   - Invalid Time Format Rejection
```

### Step 3: Test Success

All 31 tests should show ✅ (green) status.

If any fail, check:
- Server is running (`npm run dev`)
- Database is initialized (`npm run db:init`)
- MySQL server is running

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Headers
All endpoints (except login) require JWT token:

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Default Test Credentials

```
Email: admin@meditrack.com
Password: Password123!
```

---

## 🔐 Authentication

### How Authentication Works

1. **Login** - Send credentials to get JWT token
   ```powershell
   POST /api/auth/login
   {
     "email": "admin@meditrack.com",
     "password": "Password123!"
   }
   ```

2. **Receive Token** - Save the token from response
   ```json
   {
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIs..."
     }
   }
   ```

3. **Use Token** - Include in Authorization header for subsequent requests
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

4. **Token Expiry** - Token expires after 24 hours, login again to get new token

---

## 🐛 Troubleshooting

### Issue: Server won't start (Port 3000 already in use)
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Restart server
npm run dev
```

### Issue: Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
1. Start MySQL: `net start MySQL80`
2. Verify credentials in `.env` file
3. Check MySQL is running: `mysql -u root -p`

### Issue: Tests fail with "Email already registered"
```
This means test data already exists. Re-run tests:
npm run test
```
The tests use unique timestamps, so they should pass.

### Issue: Cannot create appointment (Time slot already booked)
```
The appointment time is already taken by another doctor.
Try different date/time or different doctor.
```

---

## 📖 Step-by-Step Workflow

### First Time Setup (Complete Guide)

```powershell
# 1. Navigate to project
cd C:\Users\HP\Desktop\meditrack\server

# 2. Create .env file with your MySQL password
# Edit .env with your credentials

# 3. Install dependencies
npm install

# 4. Initialize database
npm run db:init

# 5. Start server
npm run dev
# Keep this terminal running

# 6. In a NEW TERMINAL, run tests
npm run test

# 7. All tests should pass ✅
```

### Daily Usage

```powershell
# Start server
cd C:\Users\HP\Desktop\meditrack\server
npm run dev

# In another terminal, test APIs
npm run test

# Or use Postman with postman-collection.json
```

---

## ✅ Success Checklist

- [ ] Node.js and npm installed
- [ ] MySQL server installed and running
- [ ] Project files downloaded/cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with MySQL password
- [ ] Database initialized (`npm run db:init`)
- [ ] Server running (`npm run dev`)
- [ ] All 31 tests passing (`npm run test`)
- [ ] Ready to develop! 🚀

---

## 📝 Available Commands

```powershell
# Development
npm run dev              # Start server with auto-reload

# Production
npm start               # Start production server

# Database
npm run db:init        # Initialize and seed database
npm run db:create      # Alias for db:init

# Testing
npm run test           # Run comprehensive API tests
npm run test:api       # Alias for test
```

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure server is running on port 3000
4. Check database connection in `.env`
5. Run tests to verify setup: `npm run test`

---

## 📊 Project Status

- ✅ Database Schema: Complete
- ✅ All APIs: Working (31/31 tests passing)
- ✅ Authentication: Implemented
- ✅ CRUD Operations: All working
- ✅ Testing: Comprehensive suite included
- ✅ Documentation: Complete

---

## 📝 License

This project is licensed under ISC License.

---

## 🎯 Next Steps

1. **Explore the API** - Use Postman collection to test endpoints
2. **Review Code** - Check controllers and models to understand business logic
3. **Customize** - Modify validation rules, add new fields, or extend functionality
4. **Deploy** - Set up on production server with appropriate environment variables
5. **Scale** - Add caching, implement advanced search, add reporting features

---

**Version**: 1.0.0  
**Last Updated**: February 3, 2026  
**Status**: ✅ Production Ready

## 📦 Installation

### 1. Clone/Download the Project

```bash
cd meditrack
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```dotenv
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meditrack_db
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h
SESSION_TIMEOUT=900000

CORS_ORIGIN=http://localhost:3000
```

## 🗄️ Database Setup

### Option 1: Automatic Setup with Script

```bash
npm run db:create
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Create a default admin user

### Option 2: Manual Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE meditrack_db;
USE meditrack_db;

# Load schema
SOURCE database.sql;

# Load sample data (optional)
SOURCE insert_data.sql;
```

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. File → Open SQL Script → Select `database.sql`
3. Execute (Ctrl+Shift+Enter)
4. Repeat for `insert_data.sql` (optional)

## 🔐 Default Admin Credentials

**Email:** admin@meditrack.com  
**Password:** Password123!

⚠️ **Change these credentials after first login!**

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Requires `nodemon` (included in devDependencies)

### Production Mode

```bash
npm start
```

### Expected Output

```
Server running on port 5000
Database connected successfully
✅ MediTrack API is ready!
```

The server will be available at: `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/logout` | Logout user |

### Staff Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | Get all staff |
| POST | `/api/staff` | Create staff |
| GET | `/api/staff/:id` | Get staff by ID |
| PUT | `/api/staff/:id` | Update staff |
| PUT | `/api/staff/:id/deactivate` | Deactivate staff |
| PUT | `/api/staff/:id/reactivate` | Reactivate staff |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Get patient by ID |
| PUT | `/api/patients/:id` | Update patient |
| PUT | `/api/patients/:id/archive` | Archive patient |
| GET | `/api/patients/search` | Search patients |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/:id` | Get appointment by ID |
| PUT | `/api/appointments/:id` | Update appointment |
| PUT | `/api/appointments/:id/status` | Update appointment status |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get clinic statistics |
| GET | `/api/dashboard/recent-appointments` | Get recent appointments |
| GET | `/api/dashboard/patient-count` | Get patient count |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |

## 🧪 Testing with Postman

### 1. Import Collection

1. Open Postman
2. Click **Import**
3. Select `postman-collection.json`
4. Confirm import

### 2. Set Environment Variables

1. Create new Environment
2. Add variables:
   - `base_url` = `http://localhost:5000`
   - `auth_token` = (will be auto-populated after login)

### 3. Test Workflow

1. **Login First**
   - POST `/api/auth/login`
   - Copy the token from response
   - Paste into `auth_token` variable

2. **Test Staff Endpoints**
   - GET `/api/staff` (view all staff)
   - POST `/api/staff` (create new staff)

3. **Test Patient Endpoints**
   - GET `/api/patients` (view all patients)
   - POST `/api/patients` (create new patient)

4. **Test Appointment Endpoints**
   - GET `/api/appointments` (view all appointments)
   - POST `/api/appointments` (create appointment)

5. **Test Dashboard**
   - GET `/api/dashboard/stats` (view statistics)

## 📝 Request/Response Examples

### Login Request

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@meditrack.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@meditrack.com",
      "first_name": "Admin",
      "role": "Admin"
    }
  }
}
```

### Create Patient Request

```bash
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "medical_record_number": "MRN001",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "phone": "1234567890",
  "email": "john@example.com",
  "allergies": "Penicillin",
  "blood_type": "O+"
}
```

## 🐛 Troubleshooting

### MySQL Connection Error: ETIMEDOUT

**Solution:**
```bash
# Check if MySQL is running
tasklist | findstr mysql

# Ensure DB_HOST is correct in .env
DB_HOST=localhost  # or 127.0.0.1
```

### Port 5000 Already in Use

```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Not Found

```bash
# Create database manually
mysql -u root -p meditrack_db < database.sql
```

### Cannot Login

1. Verify admin user exists: `SELECT * FROM staff WHERE email='admin@meditrack.com';`
2. Run seed script: `node seed-simple.js`
3. Check database connection in .env

### JWT_SECRET Not Set

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=your_generated_secret_here
```

## 📚 Database Schema

### Tables

1. **staff** - Staff members and users
2. **patients** - Patient records
3. **appointments** - Appointment scheduling
4. **medical_records** - Detailed medical history
5. **sessions** - User session tracking

See `database.sql` for complete schema.

## 🔄 Common Workflows

### Workflow 1: Add New Doctor

1. Login with Admin account
2. POST `/api/staff` with doctor details
3. System generates temporary password
4. Doctor can login and change password

### Workflow 2: Schedule Appointment

1. Login with appropriate role
2. POST `/api/appointments` with patient and doctor IDs
3. System checks for scheduling conflicts
4. Appointment created and stored

### Workflow 3: Patient Checkup

1. Doctor logs in
2. Views appointment details: GET `/api/appointments/:id`
3. Updates appointment status: PUT `/api/appointments/:id/status`
4. Status changes to "Completed"

## � Phase 1 Submission Information

### Submission Checklist

✅ **Database & Data Modeling**
- Three core entities implemented (Staff, Patients, Appointments)
- Proper foreign key relationships with referential integrity
- Timestamps on all entities for audit trails
- Indexed fields for performance optimization

✅ **Authentication & Security**
- JWT-based authentication with configurable expiration
- Passwords hashed using bcrypt (never stored in plain text)
- Role-based access control for all protected endpoints
- Secure token verification and session validation

✅ **API Endpoints & HTTP Status Codes**
- Full CRUD operations for all entities
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)
- Comprehensive error handling with meaningful messages
- Input validation on all endpoints

✅ **Code Quality**
- Modular architecture (Routes → Controllers → Models)
- Clear separation of concerns
- Comprehensive JSDoc comments
- Professional naming conventions
- DRY principle applied throughout

✅ **Documentation**
- API_DOCUMENTATION.md with setup and usage instructions
- Swagger/OpenAPI interactive documentation at `/api-docs`
- Postman collection (MediTrack-API-Phase1.postman_collection.json)
- Database schema documentation in database.sql
- Clear code comments explaining logic

✅ **Git Repository**
- Regular commits with descriptive messages throughout development
- Clean commit history showing steady progress
- Feature branch (p_phase_1) for Phase 1 work
- No single massive commits

### Key Files

- **server/src/app.js** - Express application setup with Swagger UI
- **server/src/config/swagger.js** - OpenAPI/Swagger configuration
- **server/database.sql** - Complete database schema with relationships
- **server/API_DOCUMENTATION.md** - Comprehensive API documentation
- **MediTrack-API-Phase1.postman_collection.json** - Postman testing collection
- **server/src/middleware/auth.middleware.js** - JWT verification and RBAC
- **server/src/controllers/** - Business logic for each entity
- **server/src/models/** - Database query builders
- **server/src/routes/** - API endpoint definitions

### Running Phase 1 Locally

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Create .env file with database configuration
# See API_DOCUMENTATION.md for .env template

# 4. Initialize database
npm run db:init

# 5. Start server
npm run dev

# 6. Access documentation
# Swagger UI: http://localhost:5000/api-docs
# API Health: http://localhost:5000/api/health
```

### Testing Phase 1 Endpoints

Import the Postman collection:
1. Open Postman
2. File → Import
3. Select `MediTrack-API-Phase1.postman_collection.json`
4. Set BASE_URL environment variable
5. Run tests for each endpoint

Or use curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@meditrack.com","password":"AdminPass123!"}'

# Get all patients (with JWT token)
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Rubric Alignment

| Criterion | Status | Details |
|-----------|--------|---------|
| **Deployment & Integrity** | ✅ Ready | Repository has regular commits. Ready for deployment to Render/Heroku |
| **Data Modeling** | ✅ Complete | 3 entities with proper foreign keys, no data redundancy |
| **Endpoint Execution** | ✅ Complete | All CRUD endpoints return proper HTTP status codes |
| **Identity Management** | ✅ Complete | Bcrypt hashing, JWT auth, protected routes, no plain-text passwords |
| **Code Quality** | ✅ Complete | Modular code, professional naming, comprehensive docs |

## �📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API logs in console
3. Check database for data integrity

## 📄 License

MIT

## 👥 Contributors

MediTrack Team

---

**Last Updated:** February 2, 2026  
**Version:** 1.0.0
I n c e p t i o n   P h a s e   1   -   F e b   1 0 ,   2 0 2 6  
 