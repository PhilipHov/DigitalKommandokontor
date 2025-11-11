import { Info } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "ok" | "warn" | "bad" | "info";
};

const toneMap: Record<Required<Props>["tone"], string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warn: "bg-amber-50 text-amber-700 ring-amber-100",
  bad: "bg-rose-50 text-rose-700 ring-rose-100",
  info: "bg-slate-50 text-slate-700 ring-slate-100",
};

export default function StatCard({ icon, label, value, sub, tone = "info" }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          {icon ?? <Info className="h-5 w-5" />}
        </div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </div>
  );
}
