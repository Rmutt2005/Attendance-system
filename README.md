# Fullstack Attendance System (Next.js App Router)

Production-ready starter with:
- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Email/password login (JWT in HTTP-only cookie)
- Face detection check (face exists only)
- Geolocation + backend Haversine validation
- Daily 4-step attendance sequence in `Asia/Bangkok`

## Project structure

```txt
.
|- app/
|  |- api/
|  |  |- auth/login/route.ts
|  |  |- auth/logout/route.ts
|  |  |- checkin/route.ts
|  |  |- history/route.ts
|  |  `- users/route.ts
|  |- dashboard/page.tsx
|  |- history/page.tsx
|  |- login/page.tsx
|  `- users/page.tsx
|- lib/
|  |- attendance.ts
|  |- auth.ts
|  |- geo.ts
|  `- prisma.ts
|- prisma/
|  |- schema.prisma
|  `- seed.mjs
|- public/models/
|- middleware.ts
`- package.json
```

## Attendance rules

- Allowed types per day:
  - `MORNING_IN`
  - `LUNCH_OUT`
  - `AFTERNOON_IN`
  - `EVENING_OUT`
- Rule 1: same type cannot be submitted twice in one Bangkok day.
- Rule 2: strict sequence is enforced (cannot submit `AFTERNOON_IN` before `LUNCH_OUT`).
- Rule 3: day boundary uses `Asia/Bangkok` timezone.
- Rule 4: check-in is blocked if:
  - no face detected
  - location is missing/denied
  - distance is greater than user radius (`200m` default)

## Database schema

- `User`: name, email, hashed password, `allowedLat`, `allowedLng`, `radius`
- `Attendance`: type, coordinates, distance, `faceDetected`, timestamp
- Enum `AttendanceType`: `MORNING_IN`, `LUNCH_OUT`, `AFTERNOON_IN`, `EVENING_OUT`

## API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/checkin`
- `GET /api/history`
- `POST /api/users` (create user + allowed location/radius)

## Pages

- `/login`
- `/dashboard`
- `/history`
- `/users`

## Setup

1. Install packages:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Set env:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed default account:
   ```bash
   npm run prisma:seed
   ```
   - Email: `admin@example.com`
   - Password: `password123`
6. Put face-api model files in `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
7. Start app:
   ```bash
   npm run dev
   ```

## Deploy (Vercel)

- Use managed PostgreSQL (Neon/Supabase/Railway)
- Configure `DATABASE_URL` and `JWT_SECRET` in Vercel
- Run Prisma migrations in deployment workflow
- Camera and geolocation work only on HTTPS (Vercel provides HTTPS)
