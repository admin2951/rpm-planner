/**
 * 部署時自動把 prisma/schema.prisma 套用到資料庫。
 *
 * 只有在偵測到 Supabase 直連字串時才執行（Vercel 上有、本機沒有），
 * 因此本機 `npm run build` 不會因為缺少環境變數而失敗。
 */
import { execSync } from "node:child_process";

const url =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL;

if (!url) {
  console.log("[db-push] 未設定 Supabase 連線字串，略過（本機建置正常）");
  process.exit(0);
}

console.log("[db-push] 套用 schema 至資料庫…");
try {
  execSync("prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[db-push] 完成");
} catch {
  console.error("[db-push] 失敗：schema 可能包含會刪除資料的變更，請人工確認。");
  process.exit(1);
}
