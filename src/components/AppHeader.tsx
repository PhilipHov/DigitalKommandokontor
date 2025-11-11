import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AppHeader({ title }: { title?: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  const showBack = loc.pathname.startsWith("/app/") && loc.pathname !== "/";

  return (
    <div className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        {showBack && (
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tilbage</span>
          </button>
        )}
        <div className="text-2xl font-black tracking-tight text-slate-900">
          {title ?? "PlanOps"}
        </div>
      </div>
    </div>
  );
}
