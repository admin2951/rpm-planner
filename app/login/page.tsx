import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-clay bg-white p-8 shadow-sm">
        <p className="text-center font-serif text-2xl font-bold text-moss">RPM系統</p>
        <p className="mt-1 text-center text-sm text-muted">登入以開始規劃你的 R・P・M</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
