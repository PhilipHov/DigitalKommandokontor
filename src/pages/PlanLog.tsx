import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import AppHeader from "../components/AppHeader";

/** ---------- Demo-data ---------- */
type Item = {
  id: string;
  kategori: string;
  navn: string;
  status: "Operativ" | "Ude" | "Reparation";
  sla: number;
  mtbf: string;
  naesteService: string;
  noter?: string;
  beholdning: number;
  udeAfDrift: number;
};

const DEMO: Item[] = [
  {
    id: "m10",
    kategori: "Køretøjer",
    navn: "M/10 – let køretøj",
    status: "Operativ",
    sla: 96,
    mtbf: "3.1 t",
    naesteService: "2025-12-01",
    noter: "—",
    beholdning: 120,
    udeAfDrift: 3,
  },
  {
    id: "m95",
    kategori: "Våben",
    navn: "M/95 – gevær",
    status: "Operativ",
    sla: 94,
    mtbf: "2500 h",
    naesteService: "2026-01-10",
    noter: "—",
    beholdning: 3100,
    udeAfDrift: 186,
  },
  {
    id: "drn",
    kategori: "Droner",
    navn: "Drone, rekognoscering",
    status: "Ude",
    sla: 88,
    mtbf: "900 h",
    naesteService: "—",
    noter: "2 ude – retur 14/11",
    beholdning: 24,
    udeAfDrift: 2,
  },
  {
    id: "byg",
    kategori: "Bygninger",
    navn: "Bygninger",
    status: "Operativ",
    sla: 100,
    mtbf: "Infinity t",
    naesteService: "Kontinuerlig",
    noter: "—",
    beholdning: 52,
    udeAfDrift: 0,
  },
];

const STORAGE_KEY = "planlog_uafd_signoffs_v1";

const kpiCard = (title: string, value: string, sub?: string, icon?: ReactNode) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3 text-slate-600">
      {icon}
      <div className="text-sm">{title}</div>
    </div>
    <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    {sub && <div className="mt-1 text-slate-500 text-sm">{sub}</div>}
  </div>
);

function Progress({ pct }: { pct: number }) {
  return (
    <div className="w-full rounded-full bg-slate-200 h-2">
      <div
        className={`h-2 rounded-full transition-all ${
          pct >= 95 ? "bg-emerald-500" : pct >= 90 ? "bg-amber-500" : "bg-rose-500"
        }`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

function SignaturePad({ value, onChange, height = 140 }: { value?: string; onChange: (dataUrl: string | null) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.clearRect(0, 0, c.width, c.height);

    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value]);

  const start = (x: number, y: number) => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };

  const move = (x: number, y: number) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const c = canvasRef.current!;
    onChange(c.toDataURL("image/png"));
  };

  const getXY = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className="rounded-xl border border-slate-300 bg-white">
      <canvas
        ref={canvasRef}
        className="block w-full"
        width={800}
        height={height}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          const { x, y } = getXY(e);
          start(x, y);
        }}
        onPointerMove={(e) => {
          const { x, y } = getXY(e);
          move(x, y);
        }}
        onPointerUp={() => stop()}
        onPointerLeave={() => stop()}
      />
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs text-slate-500">Underskriv i feltet</span>
        <button
          type="button"
          className="text-xs text-slate-600 hover:text-slate-900 underline"
          onClick={() => {
            const c = canvasRef.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            onChange(null);
          }}
        >
          Ryd
        </button>
      </div>
    </div>
  );
}

type CountRow = {
  itemId: string;
  navn: string;
  forventet: number;
  talt: number | "";
};

type SignOff = {
  weekISO: string;
  signedAt: string;
  fullName: string;
  unit: string;
  signatureDataUrl: string;
  rows: Array<{ itemId: string; talt: number }>;
};

export default function PlanLog() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "vaaben" | "kmp" | "sensitiv" | "best" | "count">("dashboard");
  const [query, setQuery] = useState("");
  const [onlyLowSLA, setOnlyLowSLA] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Item>("sla");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const data = useMemo(() => {
    let rows = DEMO.filter(
      (r) =>
        r.navn.toLowerCase().includes(query.toLowerCase()) ||
        r.kategori.toLowerCase().includes(query.toLowerCase())
    );
    if (onlyLowSLA) rows = rows.filter((r) => r.sla < 90);
    rows.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [query, onlyLowSLA, sortKey, sortDir]);

  const readinessPct = Math.round(DEMO.reduce((acc, r) => acc + r.sla, 0) / DEMO.length);
  const totalTilg = DEMO.reduce((acc, r) => acc + r.beholdning - r.udeAfDrift, 0);
  const totalUde = DEMO.reduce((acc, r) => acc + r.udeAfDrift, 0);

  const [countRows, setCountRows] = useState<CountRow[]>(
    DEMO.map((it) => ({ itemId: it.id, navn: it.navn, forventet: it.beholdning, talt: "" }))
  );
  const mismatches = countRows.filter((r) => typeof r.talt === "number" && r.talt !== r.forventet);

  const [showSign, setShowSign] = useState(false);
  const [sigName, setSigName] = useState("");
  const [sigUnit, setSigUnit] = useState("");
  const [sigImg, setSigImg] = useState<string | null>(null);
  const [weekISO, setWeekISO] = useState(getCurrentISOWeek());

  const [signOffs, setSignOffs] = useState<SignOff[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SignOff[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signOffs));
  }, [signOffs]);

  const saveSignOff = () => {
    if (!sigName || !sigUnit || !sigImg) return;
    const rows = countRows
      .filter((r): r is Required<CountRow> & { talt: number } => typeof r.talt === "number")
      .map((r) => ({ itemId: r.itemId, talt: r.talt }));
    const record: SignOff = {
      weekISO,
      signedAt: new Date().toISOString(),
      fullName: sigName,
      unit: sigUnit,
      signatureDataUrl: sigImg,
      rows,
    };
    setSignOffs((s) => [record, ...s].slice(0, 20));
    setShowSign(false);
    setSigName("");
    setSigUnit("");
    setSigImg(null);
  };

  const exportCSV = () => {
    const head = ["Kategori", "Navn", "Status", "SLA", "MTBF", "Næste service", "Noter", "Beholdning", "Ude af drift"];
    const rows = data.map((r) =>
      [
        r.kategori,
        r.navn,
        r.status,
        `${r.sla}%`,
        r.mtbf,
        r.naesteService,
        r.noter ?? "—",
        r.beholdning,
        r.udeAfDrift,
      ].join(";")
    );
    const blob = new Blob([head.join(";") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planlog_uafd.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader title="PlanLog (UAFD)" />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <div className="flex flex-wrap gap-2">
          {["dashboard", "vaaben", "kmp", "sensitiv", "best", "count"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`rounded-full border px-4 py-2 text-sm ${
                activeTab === key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {tabLabel(key)}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {kpiCard("Readiness", `${readinessPct}%`, "SLA: 92% 🤝", <GaugeIcon />)}
              {kpiCard(
                "Tilgængeligt (ALT)",
                String(totalTilg),
                `Udlån: ${totalUde} (${Math.round((totalUde / (totalTilg + totalUde)) * 100)}%)`,
                <CubesIcon />
              )}
              {kpiCard("Reparation (ALT)", String(totalUde), "3% i værksted", <WrenchIcon />)}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søg i materiel…"
                className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-400"
              />
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={onlyLowSLA} onChange={(e) => setOnlyLowSLA(e.target.checked)} />
                <span className="text-sm text-slate-700">Vis kun under 90% SLA</span>
              </label>

              <div className="ml-auto flex gap-2">
                <button onClick={() => window.print()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                  Print / PDF
                </button>
                <button onClick={exportCSV} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                  Eksportér CSV
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    {[
                      ["kategori", "Kategori"],
                      ["navn", "Navn"],
                      ["status", "Status"],
                      ["sla", "SLA"],
                      ["mtbf", "MTBF"],
                      ["naesteService", "Næste service"],
                      ["noter", "Noter"],
                      ["beholdning", "Beholdning"],
                      ["udeAfDrift", "Ude af drift"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className="cursor-pointer px-4 py-3 text-sm"
                        onClick={() => {
                          if (sortKey === key) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey(key as keyof Item);
                            setSortDir("asc");
                          }
                        }}
                      >
                        <div className="inline-flex items-center gap-1">
                          {label}
                          {sortKey === key && <span className="text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">{r.kategori}</td>
                      <td className="px-4 py-3">{r.navn}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            r.status === "Operativ"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "Reparation"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress pct={r.sla} />
                          </div>
                          <div className="w-10 text-sm tabular-nums">{r.sla}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.mtbf}</td>
                      <td className="px-4 py-3">{r.naesteService}</td>
                      <td className="px-4 py-3">{r.noter ?? "—"}</td>
                      <td className="px-4 py-3">{r.beholdning}</td>
                      <td className="px-4 py-3">{r.udeAfDrift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "count" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ugentlig optælling</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Uge</label>
                  <input
                    type="week"
                    value={weekISO}
                    onChange={(e) => setWeekISO(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Materiel</th>
                      <th className="px-3 py-2">Forventet</th>
                      <th className="px-3 py-2">Talt</th>
                      <th className="px-3 py-2">Afvigelse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {countRows.map((row, i) => {
                      const afv = typeof row.talt === "number" ? row.talt - row.forventet : 0;
                      const warn = typeof row.talt === "number" && row.talt !== row.forventet;
                      return (
                        <tr key={row.itemId} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2">{row.navn}</td>
                          <td className="px-3 py-2 tabular-nums">{row.forventet}</td>
                          <td className="px-3 py-2">
                            <input
                              inputMode="numeric"
                              value={row.talt}
                              onChange={(e) =>
                                setCountRows((prev) => {
                                  const clone = [...prev];
                                  const v = e.target.value;
                                  clone[i] = { ...row, talt: v === "" ? "" : Number(v) };
                                  return clone;
                                })
                              }
                              className={`w-24 rounded-lg border px-2 py-1 text-sm tabular-nums ${
                                warn ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-white"
                              }`}
                            />
                          </td>
                          <td className={`px-3 py-2 tabular-nums ${warn ? "text-amber-600" : "text-slate-500"}`}>
                            {typeof row.talt === "number" ? (afv > 0 ? `+${afv}` : afv) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {mismatches.length === 0 ? "Ingen afvigelser" : `${mismatches.length} afvigelse(r) fundet`}
                </div>
                <button
                  onClick={() => setShowSign(true)}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                  disabled={countRows.every((r) => r.talt === "")}
                >
                  Godkend & underskriv
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold">Seneste underskrifter</h3>
              <ul className="mt-3 space-y-3">
                {signOffs.length === 0 && <li className="text-sm text-slate-500">Ingen signaturer endnu.</li>}
                {signOffs.map((s, idx) => (
                  <li key={idx} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.fullName}</div>
                        <div className="text-xs text-slate-600">
                          {s.unit} · {s.weekISO} · {new Date(s.signedAt).toLocaleString()}
                        </div>
                      </div>
                      <img src={s.signatureDataUrl} alt="signatur" className="h-10" />
                    </div>
                    <div className="mt-2 text-xs text-slate-600">{s.rows.length} linjer godkendt</div>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <button
                  onClick={() => downloadSignoffCSV(signOffs)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Exportér signatur-historik (CSV)
                </button>
              </div>
            </div>

            {showSign && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">Godkend ugentlig optælling</h3>
                    <button className="text-slate-500 hover:text-slate-900" onClick={() => setShowSign(false)}>
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-600">Fulde navn</label>
                      <input value={sigName} onChange={(e) => setSigName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Enhed</label>
                      <input value={sigUnit} onChange={(e) => setSigUnit(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <SignaturePad value={sigImg ?? undefined} onChange={setSigImg} />
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button onClick={() => setShowSign(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                      Annullér
                    </button>
                    <button
                      onClick={saveSignOff}
                      disabled={!sigName || !sigUnit || !sigImg}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Gem underskrift
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== "dashboard" && activeTab !== "count" && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            <div className="text-sm">
              Pladsholder – indsæt jeres indhold for fanen: <b>{tabLabel(activeTab)}</b>.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getCurrentISOWeek() {
  const d = new Date();
  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
    );
  const wk = String(week).padStart(2, "0");
  return `${d.getFullYear()}-W${wk}`;
}

function downloadSignoffCSV(list: SignOff[]) {
  const head = ["Week", "SignedAt", "FullName", "Unit", "Rows"];
  const rows = list.map((s) =>
    [
      s.weekISO,
      s.signedAt,
      s.fullName,
      s.unit,
      s.rows.map((r) => `${r.itemId}:${r.talt}`).join("|"),
    ].join(";")
  );
  const blob = new Blob([head.join(";") + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "planlog_signoff_history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function tabLabel(k: string) {
  return (
    {
      dashboard: "Dashboard",
      vaaben: "Våben",
      kmp: "KMP Mat",
      sensitiv: "Sensitiv Mat",
      best: "Bestillinger",
      count: "Kontrolleret optælling",
    } as Record<string, string>
  )[k];
}

function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M12 3a9 9 0 1 0 9 9" stroke="#334155" strokeWidth="2" fill="none" />
      <path d="M12 12 19 5" stroke="#334155" strokeWidth="2" />
    </svg>
  );
}

function CubesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4V11" stroke="#334155" strokeWidth="2" fill="none" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M14 7a5 5 0 1 0 3 3l5-5-3-3-5 5Z" stroke="#334155" strokeWidth="2" fill="none" />
      <circle cx="6" cy="18" r="3" stroke="#334155" strokeWidth="2" fill="none" />
    </svg>
  );
}
