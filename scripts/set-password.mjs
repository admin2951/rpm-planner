/**
 * 更改登入密碼：在終端機輸入新密碼，只把雜湊值寫進資料庫。
 *
 *   npm run set-password
 *
 * 會連到 .env.local / .env 裡設定的資料庫（也就是正式資料庫）。
 * 密碼不會顯示在螢幕上，也不會存進任何檔案。
 */
import { existsSync } from "node:fs";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const MIN_LENGTH = 12;

// 環境變數已經有連線字串時就不讀檔，避免覆蓋呼叫端指定的資料庫。
if (!process.env.POSTGRES_PRISMA_URL) {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
if (!process.env.POSTGRES_PRISMA_URL) {
  console.error("找不到 POSTGRES_PRISMA_URL，請確認 .env 檔存在。");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
// 輸入密碼時不顯示任何字元，只保留換行。
let muted = false;
rl._writeToOutput = (text) => {
  if (!muted) rl.output.write(text);
  else if (text.includes("\n") || text.includes("\r")) rl.output.write("\n");
};

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    muted = false;
    rl.question(question, (answer) => {
      muted = false;
      resolve(answer);
    });
    muted = hidden; // 提示文字已經印出，之後的按鍵才隱藏
  });
}

const prisma = new PrismaClient();

try {
  const defaultEmail = (process.env.ADMIN_EMAIL || "admin@esheco.com").toLowerCase();
  const emailInput = (await ask(`帳號 Email（直接按 Enter 使用 ${defaultEmail}）：`)).trim().toLowerCase();
  const email = emailInput || defaultEmail;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    console.error(`找不到帳號 ${email}，沒有做任何變更。`);
    process.exitCode = 1;
  } else {
    const password = await ask(`新密碼（至少 ${MIN_LENGTH} 個字元，輸入時不會顯示）：`, { hidden: true });
    if (password.length < MIN_LENGTH) {
      console.error(`密碼太短，至少要 ${MIN_LENGTH} 個字元。沒有做任何變更。`);
      process.exitCode = 1;
    } else if ((await ask("再輸入一次新密碼：", { hidden: true })) !== password) {
      console.error("兩次輸入不一樣，沒有做任何變更。");
      process.exitCode = 1;
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 10) },
      });
      console.log(`✔ 已更新 ${email} 的密碼。`);
      console.log("  提醒：已登入的裝置不會自動登出，要在 Vercel 更換 SESSION_SECRET 才會。");
    }
  }
} catch (e) {
  console.error("更改失敗：", e.code === "P1001" ? "連不到資料庫（Supabase 可能被暫停了）" : e.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await prisma.$disconnect();
}
