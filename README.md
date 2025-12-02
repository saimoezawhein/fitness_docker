# Fitness Tracker

A full-stack web application for tracking workouts, exercises, and fitness progress.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

## Overview

Fitness Tracker is a comprehensive workout tracking application that allows users to:
- Record and manage workout sessions
- Track exercises with sets, reps, weight, and duration
- Monitor calories burned and total workout time
- View workout history with filtering options
- Manage user profiles

## Features

| Feature | Description |
|---------|-------------|
| **User Authentication** | Register and login functionality |
| **Dashboard** | Overview of stats, recent workouts, and categories |
| **Record Workout** | Add workouts with multiple exercises |
| **Exercise Library** | 48 pre-loaded exercises across 6 categories |
| **Workout History** | Filter by time period, expandable workout details |
| **User Profile** | Edit profile information and view statistics |
| **Auto Calculations** | Automatic calorie calculation based on exercise duration |

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React)
- **Styling**: CSS with custom design system
- **Routing**: App Router
- **Build**: Standalone output for Docker

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: mysql2/promise
- **Middleware**: CORS, dotenv

### Database
- **Database**: MySQL 8.0
- **Tables**: 5 (users, categories, exercises, workouts, workout_exercises)
- **Seed Data**: 6 categories, 48 exercises, sample users

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins Pipeline
- **Database Admin**: phpMyAdmin

## Project Structure

```
fitness-tracker/
├── docker-compose.yml      # Docker services configuration
├── Jenkinsfile             # CI/CD pipeline
├── init.sql                # Database schema and seed data
├── .env.example            # Environment variables template
├── README.md               # Project documentation
│
├── 01_api/
│   ├── Dockerfile          # Backend container config
│   ├── package.json        # Node.js dependencies
│   ├── index.js            # Express server & API routes
│   └── .env.example        # Backend env template
│
└── 02_frontend/
    ├── Dockerfile          # Frontend container config
    ├── package.json        # Next.js dependencies
    ├── next.config.mjs     # Next.js configuration
    └── app/
        ├── page.js         # Home page
        ├── globals.css     # Global styles
        ├── layout.js       # Root layout
        ├── login/
        │   └── page.js     # Login page
        ├── register/
        │   └── page.js     # Registration page
        ├── profile/
        │   └── page.js     # User profile page
        ├── history/
        │   └── page.js     # Workout history page
        └── workouts/
            └── new/
                └── page.js # Add workout page
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- MySQL 8.0 (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - phpMyAdmin: http://localhost:8080

### Local Development

#### Backend
```bash
cd backend
cp .env.example .env
npm install
npm start
```

#### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Default Login Credentials

| Username | Email | Password |
|----------|-------|----------|
| demo | demo@example.com | demo123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id` | Get user profile |
| PUT | `/users/:id` | Update user profile |
| PUT | `/users/:id/password` | Change password |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get single category |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exercises` | Get all exercises |
| GET | `/exercises/:id` | Get single exercise |
| GET | `/exercises/category/:categoryId` | Get exercises by category |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workouts/user/:userId` | Get user's workouts |
| GET | `/workouts/:id/user/:userId` | Get single workout |
| POST | `/workouts` | Create workout |
| PUT | `/workouts/:id` | Update workout |
| DELETE | `/workouts/:id` | Delete workout |

### Workout Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workout-exercises/:workoutId` | Get workout exercises |
| POST | `/workout-exercises` | Add exercise to workout |
| DELETE | `/workout-exercises/:id` | Remove exercise |

### Stats & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/user/:userId` | Get user statistics |
| GET | `/health` | Health check |

## Database Schema

### Tables

**users**
- id, username, email, password
- first_name, last_name, profile_image
- is_active, last_login, created_at, updated_at

**categories**
- id, name, description, icon
- Seed: Cardio, Strength, Flexibility, HIIT, Yoga, Sports

**exercises**
- id, name, description, category_id
- muscle_group, difficulty, calories_per_minute

**workouts**
- id, user_id (FK), name, workout_date
- duration_minutes, total_calories, notes

**workout_exercises**
- id, workout_id (FK), exercise_id (FK)
- sets, reps, weight_kg, duration_seconds, calories_burned

### Relationships
```
users ──────< workouts ──────< workout_exercises >────── exercises
                                                              │
categories ──────────────────────────────────────────────────┘
```

## Deployment

### Docker Compose Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| mysql | mysql:8.0 | 3306 | Database |
| phpmyadmin | phpmyadmin | 8888 | Database admin |
| api | Custom | 3001 | Backend API |
| frontend | Custom | 3000 | Next.js app |

### Jenkins CI/CD Pipeline

The Jenkinsfile includes the following stages:

1. **Checkout** - Clone repository
2. **Validate** - Validate Docker Compose config
3. **Prepare Environment** - Create .env from credentials
4. **Deploy** - Build and start Docker containers
5. **Health Check** - Verify API is responding
6. **Verify Deployment** - Display service status

### Jenkins Credentials Required

| Credential ID | Type | Description |
|---------------|------|-------------|
| `MYSQL_ROOT_PASSWORD` | Secret text | MySQL root password |
| `MYSQL_PASSWORD` | Secret text | MySQL user password |

### Environment Variables

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=fitness_tracker
MYSQL_USER=fitness_user
MYSQL_PASSWORD=fitness_pass
MYSQL_PORT=3306

# phpMyAdmin Configuration
PHPMYADMIN_PORT=8080

# API Configuration
API_PORT=3001
DB_PORT=3306
API_HOST=http://localhost:3001

# Frontend Configuration
FRONTEND_PORT=3000
```

## Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#4ade80` | Main accent color |
| Primary Light | `#86efac` | Hover states |
| Primary Dark | `#22c55e` | Active states |
| Text Dark | `#1a2e1a` | Main text |
| Text Muted | `#6b7280` | Secondary text |
| Background | `#f9fafb` | Page background |
| Danger | `#ef4444` | Delete actions |

## License

This project is for educational purposes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
