import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 border-b border-ink/80 pb-5">
          <p
            aria-hidden
            className="font-display text-6xl font-medium leading-none tracking-[-0.04em] text-ink"
          >
            RPM
          </p>
          <h1 className="mt-2 text-sm font-bold tracking-[0.12em] text-sage-dark">
            成果・理由・行動計畫
          </h1>
          <p className="mt-3 text-sm text-muted">登入以開始規劃你的 R・P・M</p>
        </div>
        <div className="rounded-2xl bg-white p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
