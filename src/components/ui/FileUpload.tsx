"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { UploadCloud, FileCheck2, X } from "lucide-react";

export function FileUpload({
  label,
  hint,
  file,
  onChange,
  error,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onChange(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragging
            ? "border-brand-500 bg-brand-50"
            : file
            ? "border-success-300 bg-success-50"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          error && "border-danger-500"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <FileCheck2 className="h-6 w-6 text-success-600" />
            <p className="text-sm font-medium text-slate-700">{file.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-danger-600"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              Tap to take a photo or choose a file
            </p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
