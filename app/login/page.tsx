import { LoginForm } from "@/components/login-form";

/** 登入頁：淺灰底上兩塊錯開的白色方塊，右側直書淡灰大字 */
export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-5">
        <span className="display text-[28px] font-bold tracking-[0.01em] text-ink">RPM</span>
        <span className="text-[10px] font-bold leading-[1.25] tracking-[0.06em] text-ink">
          成果・理由
          <br />
          行動計畫
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-6">
        <span aria-hidden className="ghost-vertical absolute right-4 top-0 hidden text-[8.5rem] md:block">
          Results
        </span>

        <div className="relative max-w-2xl bg-white px-8 py-10 sm:px-12 sm:py-14">
          <p aria-hidden className="display text-5xl text-ink sm:text-6xl">
            Sign in
          </p>
          <h1 className="mt-6 flex items-center gap-3 text-sm text-ink">
            <span className="h-px w-8 bg-ink" aria-hidden />
            登入以開始規劃你的 R・P・M
          </h1>
        </div>

        <div className="relative -mt-4 max-w-md bg-white p-8 sm:ml-40">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
