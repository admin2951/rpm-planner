import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@esheco.com";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("✔ 帳號已存在，略過建立（要改密碼請執行 npm run set-password）");
    return;
  }

  // 不提供預設密碼：這個 repo 是公開的，寫在程式裡的密碼等於公開。
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("尚未建立帳號：請先設定 ADMIN_PASSWORD 環境變數");
  }

  await prisma.user.create({
    data: {
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
