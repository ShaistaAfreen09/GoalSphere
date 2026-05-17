# GoalSphere

GoalSphere is a modern enterprise-grade goal management and KPI tracking platform designed to streamline organizational performance management workflows.

The platform enables employees, managers, and administrators to create, monitor, approve, and analyze quarterly goals through an interactive role-based dashboard system.



## Features

### Authentication & Access Control
- Secure user authentication using Supabase
- Login and signup functionality
- Persistent sessions
- Protected routes
- Role-based dashboards


## Goal Management
- Create and manage quarterly goals
- Goal weightage validation
- KPI target tracking
- Progress updates
- Goal status management
- Approval workflow
- Multiple goal categories and units of measurement


## Role-Based System

### Employee
- Create and update goals
- Track progress
- Submit goals for approval
- Perform quarterly check-ins

### Manager
- Review employee goals
- Monitor team performance
- Approve or reject submissions

### Admin
- Access analytics dashboard
- View audit logs
- Monitor organization-wide activity



## Analytics Dashboard
- KPI overview cards
- Progress trend visualizations
- Completion metrics
- Interactive charts using Recharts
- Status breakdown analytics



## Audit Logging
- Immutable activity tracking
- Goal creation history
- User activity monitoring
- Exportable logs


## UI/UX
- Fully responsive enterprise dashboard
- Dark and light mode support
- Interactive animated login background
- Smooth transitions and animations
- Modern clean interface
- Sidebar navigation system



# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Recharts

## Backend & Services
- Supabase
  - Authentication
  - PostgreSQL Database
  - APIs

## Deployment
- Vercel



# Project Structure

```bash
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── contexts/
 ├── services/
 ├── lib/
 └── main.tsx
```



# Environment Variables

Create a `.env` file in the root directory.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```



# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/GoalSphere.git
```

## Navigate to Project

```bash
cd GoalSphere
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```



# Production Build

```bash
npm run build
```



# Deployment

The application is deployed using Vercel.



# Key Functionalities Implemented

- Enterprise goal management
- KPI tracking system
- Role-based dashboards
- Analytics and visualization
- Audit logging
- Approval workflows
- Authentication system
- Responsive UI
- Dark/light themes



# Future Improvements

- Real-time notifications
- AI-powered insights
- Team collaboration features
- Calendar integrations
- Advanced reporting system
- Mobile application support



