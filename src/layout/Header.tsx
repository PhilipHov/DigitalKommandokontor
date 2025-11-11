import { LogOut, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="text-xl font-extrabold tracking-tight">PlanOps</div>
        <button
          onClick={() => (location.hash = "/")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <User className="h-4 w-4" />
          Log ud
          <LogOut className="h-4 w-4 opacity-60" />
        </button>
      </div>
    </header>
  );
}
