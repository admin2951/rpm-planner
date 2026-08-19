import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "./session";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** 未登入導回登入頁 */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
