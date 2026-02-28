CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

ALTER TABLE "User"
ALTER COLUMN "allowedLat" DROP NOT NULL,
ALTER COLUMN "allowedLng" DROP NOT NULL;

UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'admin@example.com';
