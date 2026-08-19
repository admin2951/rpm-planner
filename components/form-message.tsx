export function FormMessage({ state }: { state: { error?: string; message?: string } }) {
  if (state.error) {
    return (
      <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
        {state.error}
      </div>
    );
  }
  if (state.message) {
    return (
      <div className="rounded-lg bg-gold px-3.5 py-2.5 text-sm text-forest">
        {state.message}
      </div>
    );
  }
  return null;
}
