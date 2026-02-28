import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("password123", 10);
  const userPasswordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPasswordHash,
      role: "ADMIN"
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { role: "USER" },
    create: {
      name: "General User",
      email: "user@example.com",
      password: userPasswordHash,
      role: "USER"
    }
  });

  const office = await prisma.location.upsert({
    where: { name: "Main Office" },
    update: {
      latitude: 13.7563,
      longitude: 100.5018,
      radius: 200,
      isActive: true
    },
    create: {
      name: "Main Office",
      latitude: 13.7563,
      longitude: 100.5018,
      radius: 200,
      isActive: true
    }
  });

  await prisma.userLocation.upsert({
    where: {
      userId_locationId: {
        userId: employee.id,
        locationId: office.id
      }
    },
    update: {},
    create: {
      userId: employee.id,
      locationId: office.id
    }
  });

  console.log("Seed completed.");
  console.log("Admin:", "admin@example.com / password123");
  console.log("User:", "user@example.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
