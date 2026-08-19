import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@esheco.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "rpm12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "我",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  console.log("✔ 帳號建立完成（不建立示範資料）");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
