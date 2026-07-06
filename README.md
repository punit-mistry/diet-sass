# NutriSuite - Diet Management Web Application

A comprehensive full-stack web application for diet management with client and admin dashboards.

## Features

- **Authentication**: JWT-based auth with client and admin roles
- **Landing Page**: Marketing page with hero, services, testimonials, and about sections
- **Client Dashboard**: View diet plans, submit weekly updates, track progress
- **Admin Dashboard**: Manage clients, upload diet plans, assign plans, view updates
- **File Management**: PDF upload and storage for diet plans
- **Responsive Design**: Mobile-friendly UI with TailwindCSS

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local uploads (configurable for cloud)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env.local`

3. Start the development servers:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
dietience/
├── frontend/          # Next.js React application
├── backend/           # Express.js API server
├── uploads/           # File storage directory
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Diet Plans
- `GET /api/diet-plans` - Get diet plans (client/admin)
- `POST /api/diet-plans` - Create diet plan (admin)
- `PUT /api/diet-plans/:id` - Update diet plan (admin)
- `DELETE /api/diet-plans/:id` - Delete diet plan (admin)

### Weekly Updates
- `GET /api/updates` - Get weekly updates
- `POST /api/updates` - Submit weekly update (client)
- `PUT /api/updates/:id` - Update weekly update (client)

### Notes
- `GET /api/notes` - Get notes for user
- `POST /api/notes` - Send note to user (admin)

## Default Admin Account

- Email: admin@dietience.com
- Password: admin123

## License

MIT
