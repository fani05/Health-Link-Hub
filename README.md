# Health Link Hub

**Health Link Hub** is a full-stack web application for managing the relationship between patients and doctors: booking appointments, managing medical records, and providing statistics for doctors.

🔗 **Live app:** https://health-link-hub.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running the Project Locally](#running-the-project-locally)
---

## Features

### Patient
- Sign up and log in (with the patient role)
- Browse the list of available doctors
- Book appointments (pick a date + time slot)
- View already-occupied slots to avoid overlaps
- View and cancel their own appointments
- View their own intervention history / medical records

### Doctor
- Sign up and log in (with the doctor role + specialization)
- View received appointments
- Accept, reject, or cancel appointments
- Mark patients who did not show up (no-show)
- Create, edit, and delete medical records (procedure, cost, observations)
- View their own statistics (dashboard)

### Security
- **JWT**-based authentication
- Passwords hashed with **bcrypt**
- Role-based authorization (`protect`, `doctorOnly`, `patientOnly` middleware)
- Protection via **Helmet** and **rate limiting** on auth routes

---

## Tech Stack

| Area        | Technologies                                                      |
|-------------|-------------------------------------------------------------------|
| Frontend    | React 19, Vite, Axios                                             |
| Backend     | Node.js                                                           |
| Database    | MongoDB (Atlas)                                                   |
| Auth        | JWT (jsonwebtoken), bcryptjs                                      |
| Testing     | Jest, Supertest, mongodb-memory-server                            |

---

## Project Structure

```
Health-Link-Hub/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── src/
│   │   ├── controllers/          # Route logic (auth, appointments, medical records)
│   │   ├── models/               # Mongoose models (User, Appointment, MedicalRecord)
│   │   ├── routes/               # API route definitions
│   │   └── middleware/           # Authentication + role-based authorization
│   └── tests/                    # Jest tests
├── frontend/
│   └── src/
│       ├── api/                  # Configured Axios client
│       ├── context/              # React context for authentication
│       ├── routes/               # Protected / public routes
│       ├── pages/                # Pages (login, register, patient/doctor dashboards)
│       └── components/           # Reusable components (e.g. Navbar)
└── package.json                  # Scripts to run both apps together
```

---

## Running the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer) and **npm**
- A **MongoDB** database — you can use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/fani05/Health-Link-Hub.git
cd Health-Link-Hub
```

### 2. Install dependencies

The project has separate dependencies for the root, backend, and frontend:

```bash
# in the project root
npm install

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Create the `backend/.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
```

Create the `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the app

From the **project root** you can start the backend and frontend at the same time:

```bash
npm run dev
```

### 5. Open the app

Open in your browser: **http://localhost:5173**
