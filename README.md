# Attendance System (Next.js App Router)

## Overview

- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Credentials auth (email/password) + JWT cookie session
- Face detection (face exists only)
- Geolocation + backend Haversine validation
- Daily attendance flow with strict sequence (`MORNING_IN`, `LUNCH_OUT`, `AFTERNOON_IN`, `EVENING_OUT`)
- Role-based access (`ADMIN`, `USER`)
- Location-based attendance with per-user location permission

## Main behavior

- User flow:
  1. Open `/attendance`
  2. Select assigned location
  3. Continue to `/attendance/[locationId]`
  4. Face scan + submit attendance
- Backend checks:
  - selected location is active
  - user has access to selected location
  - face detected
  - geolocation provided
  - distance is within selected location radius
  - daily sequence rule is valid in `Asia/Bangkok`

## Admin capabilities

- Manage users and assign location access (`/users`)
- Manage locations (`/locations`)
  - create / update / enable-disable / delete
  - view location attendance history

## Key routes

- Auth:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/logout`
- User:
  - `GET /api/me`
  - `PATCH /api/me`
  - `POST /api/checkin`
  - `GET /api/history`
  - `GET /api/locations` (only assigned active locations)
- Admin:
  - `GET/POST /api/users`
  - `PATCH /api/users/:id` (set user location access)
  - `GET/POST /api/locations`
  - `GET/PATCH/DELETE /api/locations/:id`
  - `GET /api/locations/:id/history`

## Database schema

- `User`: account + role
- `Location`: attendance point (`name`, `latitude`, `longitude`, `radius`, `isActive`)
- `UserLocation`: many-to-many access map between users and locations
- `Attendance`: attendance log with selected `locationId`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env` from `.env.example`:
   - `DATABASE_URL`
   - `JWT_SECRET`
3. Apply migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Seed sample data:
   ```bash
   npm run prisma:seed
   ```
   - Admin: `admin@example.com / password123`
   - User: `user@example.com / password123`
6. Put face-api model files in `public/models/`
7. Run:
   ```bash
   npm run dev
   ```

## Deploy notes

- Configure `DATABASE_URL` and `JWT_SECRET` in Vercel
- Run `prisma migrate deploy` on deployment
- Camera + geolocation require HTTPS
