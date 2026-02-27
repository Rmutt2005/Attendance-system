# Fullstack Attendance System (Next.js App Router)

Production-ready starter for attendance with:
- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Email/password login (no OAuth)
- JWT session in HTTP-only cookie
- Face detection check (face exists only)
- Geolocation + backend Haversine validation

## 1) Project structure

```txt
.
├─ app/
│  ├─ api/
│  │  ├─ auth/login/route.ts
│  │  ├─ auth/logout/route.ts
│  │  ├─ checkin/route.ts
│  │  └─ history/route.ts
│  ├─ dashboard/page.tsx
│  ├─ history/page.tsx
│  ├─ login/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ lib/
│  ├─ auth.ts
│  ├─ geo.ts
│  └─ prisma.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.mjs
├─ public/models/   (face-api.js models)
├─ middleware.ts
├─ .env.example
└─ package.json
```

## 2) Prisma schema

Schema is in `prisma/schema.prisma` and contains:
- `User` model with `allowedLat`, `allowedLng`, `radius`
- `Attendance` model with `type`, coordinates, distance, face flag
- `AttendanceType` enum (`CHECK_IN`, `CHECK_OUT`)

## 3) Backend logic

- `POST /api/auth/login`:
  - validate email/password
  - compare password hash with `bcryptjs`
  - issue JWT and store in HTTP-only cookie
- `POST /api/checkin`:
  - require authenticated JWT session
  - block if `faceDetected !== true`
  - block if location missing
  - calculate distance via Haversine (`lib/geo.ts`)
  - block if distance > user `radius` (default `200m`)
  - insert attendance log
- `GET /api/history`:
  - return current user's logs ordered by latest first
- `middleware.ts`:
  - protects `/dashboard`, `/history`, `/api/checkin`, `/api/history`

## 4) Frontend logic

- `/login`: email/password form
- `/dashboard`:
  - opens camera
  - loads face-api.js model from `/public/models`
  - requests browser geolocation
  - checks face exists before submit
  - sends attendance to backend
- `/history`: displays attendance table

## 5) Step-by-step setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Set `DATABASE_URL` and a secure `JWT_SECRET`.
4. Run migration:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed first user:
   ```bash
   npm run prisma:seed
   ```
   Default seed login:
   - Email: `admin@example.com`
   - Password: `password123`
6. Download face-api.js model files into `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
7. Start app:
   ```bash
   npm run dev
   ```
8. Open `http://localhost:3000/login`.

## Vercel deployment notes

- Use managed PostgreSQL (Neon, Supabase, Railway, etc.)
- Set `DATABASE_URL` and `JWT_SECRET` in Vercel env vars
- Run Prisma migration as part of deployment workflow
- Camera + Geolocation require HTTPS (Vercel provides HTTPS by default)
