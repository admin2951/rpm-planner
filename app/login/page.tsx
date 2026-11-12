import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-clay">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-3">
          <span className="rounded-lg bg-gold px-3 py-1.5 font-display text-base font-semibold tracking-[-0.03em] text-ink">
            RPM 系統
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="flex items-center gap-2 font-display text-xs font-medium uppercase tracking-[0.06em] text-ink">
            <span className="h-2 w-2 rounded-full bg-ink" aria-hidden />
            Sign in
          </p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl">
            Results,
            <br />
            Purpose,
            <br />
            Massive action.
          </h1>
          <p className="mt-6 text-base text-muted">登入以開始規劃你的 R・P・M</p>
        </div>

        <div className="md:border-l md:border-clay md:pl-10">
          <div className="rounded-xl border border-clay bg-white p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
