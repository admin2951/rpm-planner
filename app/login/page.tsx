import { LoginForm } from "@/components/login-form";

/** 登入頁：左上大字標題，右下超大 RPM 字標，中間是登入表單 */
export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-cream">
      <div className="mx-auto w-full max-w-6xl px-6 pt-6">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <span aria-hidden className="display text-6xl text-ink sm:text-7xl">
            Sign in
          </span>
          <span aria-hidden className="mb-[0.55rem] hidden h-[3px] w-20 bg-ink sm:block" />
          <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.05em] text-sage sm:text-5xl">
            登入
          </h1>
        </div>
        <p className="mt-6 max-w-sm text-[15px] leading-snug text-ink">
          Results, purpose and massive action — 登入以開始規劃你的 R・P・M。
        </p>
        <div className="mt-5 h-px bg-ink" />
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="max-w-sm bg-white p-7">
          <LoginForm />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl overflow-hidden px-6 pb-4 text-right">
        <span aria-hidden className="display inline-block text-[9rem] text-ink sm:text-[13rem]">
          RPM
        </span>
      </div>
    </div>
  );
}
