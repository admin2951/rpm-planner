"use client";

import { useState } from "react";
import { NewResultForm } from "@/components/new-result-form";
import { ImportResultsForm } from "@/components/import-results-form";

export function ResultCreatePanel() {
  const [mode, setMode] = useState<"single" | "import">("single");

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={
            "rounded-full px-3 py-1.5 text-sm transition " +
            (mode === "single" ? "bg-gold font-semibold text-forest" : "text-muted hover:bg-sand")
          }
        >
          單筆新增
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
          className={
            "rounded-full px-3 py-1.5 text-sm transition " +
            (mode === "import" ? "bg-gold font-semibold text-forest" : "text-muted hover:bg-sand")
          }
        >
          批次匯入
        </button>
      </div>
      {mode === "single" ? <NewResultForm /> : <ImportResultsForm />}
    </div>
  );
}
