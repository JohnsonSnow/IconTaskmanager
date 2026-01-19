# 🧩 Icon Architecture – Full Stack Application

This repository contains a full-stack application built with:

- **ASP.NET (.NET 10+)** backend
- **Next.js (App Router)** frontend
- **PostgreSQL** database
- **Seq** for structured logging
- **Docker & Docker Compose** for local development

The project is designed to be run **entirely via Docker Compose**.

---

## 🚀 Prerequisites

Before running the project, make sure you have the following installed:

### Required
- **Docker** (latest stable)
- **Docker Compose** (included with Docker Desktop)

### Optional (for development/debugging)
- **.NET SDK 10.0 or newer**
  - Required only if you want to run or debug the API **outside Docker**
  - Docker containers do **not** require .NET installed locally

---

## 📦 Tech Stack

| Layer       | Technology |
|------------|------------|
| Backend    | ASP.NET (.NET 10+) |
| Frontend   | Next.js (App Router) |
| Database   | PostgreSQL 17 |
| Logging    | Seq |
| Containers | Docker / Docker Compose |

---

## 🛠️ Environment Variables

Create a `.env` file in the root of the project (if not already present):

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:5001
ℹ️ Environment variables used by the frontend must be prefixed with NEXT_PUBLIC_.

▶️ Running the Application
1️⃣ Build and start all services
From the project root, run:

bash
Copy code
docker compose up --build
This will start the following services:

Service	URL / Port
Web API	https://localhost:5001
Frontend	http://localhost:3000
PostgreSQL	localhost:5432
Seq	http://localhost:8081

2️⃣ Trust HTTPS certificates (important)
The backend runs on HTTPS.
If you see certificate warnings, run:

bash
Copy code
dotnet dev-certs https --trust
Then restart Docker Compose.

🗄️ Database & Migrations
PostgreSQL data is persisted locally in:

bash
Copy code
./.containers/db
Database migrations are automatically applied on startup when running in Development mode.

🩺 Health Checks
The API exposes a health check endpoint:

bash
Copy code
https://localhost:5001/health
📜 Logging (Seq)
Structured logs are available via Seq:

arduino
Copy code
http://localhost:8081
No authentication is required in development.

🧪 Development Notes
Authentication is handled using JWT

Auth state is stored with Zustand + localStorage

API requests include the JWT via the Authorization: Bearer <token> header

CORS is configured for http://localhost:3000

🛑 Stopping the Application
To stop all running containers:

bash
Copy code
docker compose down
To stop containers and remove volumes (⚠️ deletes database data):

bash
Copy code
docker compose down -v
🧠 Troubleshooting
Ports already in use
Ensure the following ports are available:

3000 (Frontend)

5000, 5001 (API)

5432 (PostgreSQL)

8081 (Seq)

Authentication issues
Clear browser localStorage and restart the frontend container.

Database issues
Delete the ./.containers/db directory and restart Docker Compose.

