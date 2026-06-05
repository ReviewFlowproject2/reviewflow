"use client";

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-brand-muted">{text}</p>
    </div>
  );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-brand-muted text-sm">{text}</p>
    </div>
  );
}
