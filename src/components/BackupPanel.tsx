"use client";

import { useRef, useState } from "react";
import { exportJSON, importJSON } from "@/lib/store";

export default function BackupPanel() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runs-and-lifts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
    setError(null);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importJSON(String(reader.result));
      if (result?.error) {
        setError(result.error);
        setMessage(null);
      } else {
        setMessage("Backup imported.");
        setError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="rounded-xl border border-hairline bg-card p-4">
      <p className="text-sm text-ink-muted">
        Your data lives only in this browser. Export a backup before clearing
        browser data or to move to another device.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleExport}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold hover:border-foreground"
        >
          Export backup
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold hover:border-foreground"
        >
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="hidden"
          aria-label="Import backup file"
        />
      </div>
      {message && <p className="mt-2 text-sm text-ink-muted">{message}</p>}
      {error && <p className="mt-2 text-sm text-lift">{error}</p>}
    </div>
  );
}
