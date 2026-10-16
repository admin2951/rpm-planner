import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sage-dark px-4">
      {/* 提案裡的「發光」意象：一圈柔和的亮青光暈 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-sage opacity-20 blur-3xl"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <p className="flex items-center justify-center gap-2 text-center font-serif text-3xl font-medium tracking-wide text-moss">
          <span className="h-2 w-2 rounded-full bg-sage" aria-hidden />
          RPM系統
        </p>
        <p className="mt-2 text-center text-sm font-light text-muted">
          登入以開始規劃你的 R・P・M
        </p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
