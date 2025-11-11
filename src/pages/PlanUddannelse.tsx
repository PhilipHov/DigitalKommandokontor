import { useMemo, useState } from "react";
import AppHeader from "../components/AppHeader";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import AIUddannelsesAssistent from "../components/AIUddannelsesAssistent";

type Kategori =
  | "Basisteori"
  | "Hvervning"
  | "CBRN"
  | "Skydning"
  | "Våbenuddannelse"
  | "Fysisk træning"
  | "Eksercits"
  | "Feltøvelser";

type Subject = {
  id: string;
  navn: string;
  kategori: Kategori;
  timerGennemført: number;
  timerTotal: number;
  status: "Ikke påbegyndt" | "I gang" | "Afsluttet";
  underviser?: string;
  naesteDato?: string;
  mangler?: string[];
};

const KATEGORIER: Kategori[] = [
  "Basisteori",
  "Hvervning",
  "CBRN",
  "Skydning",
  "Våbenuddannelse",
  "Fysisk træning",
  "Eksercits",
  "Feltøvelser",
];

const DATA: Subject[] = [
  {
    id: "s1",
    navn: "Basisteori – kap. 2.1",
    kategori: "Basisteori",
    timerGennemført: 6,
    timerTotal: 10,
    status: "I gang",
    underviser: "LT Holm",
    naesteDato: "2025-11-20",
    mangler: ["Test A", "Opgave 1"],
  },
  {
    id: "s2",
    navn: "Hvervning – retningslinjer",
    kategori: "Hvervning",
    timerGennemført: 2,
    timerTotal: 4,
    status: "I gang",
    underviser: "SG Madsen",
    naesteDato: "2025-11-18",
  },
  {
    id: "s3",
    navn: "CBRN – basis",
    kategori: "CBRN",
    timerGennemført: 0,
    timerTotal: 6,
    status: "Ikke påbegyndt",
    underviser: "KN Jensen",
  },
  {
    id: "s4",
    navn: "Skydning – M/95 (grund)",
    kategori: "Skydning",
    timerGennemført: 8,
    timerTotal: 8,
    status: "Afsluttet",
    underviser: "OR Larsen",
  },
  {
    id: "s5",
    navn: "Våbenuddannelse – M/95 vedligehold",
    kategori: "Våbenuddannelse",
    timerGennemført: 3,
    timerTotal: 6,
    status: "I gang",
    underviser: "OR Nielsen",
    naesteDato: "2025-11-22",
    mangler: ["Sikkerhedsbrief"],
  },
  {
    id: "s6",
    navn: "Fysisk træning – grundprogram",
    kategori: "Fysisk træning",
    timerGennemført: 15,
    timerTotal: 24,
    status: "I gang",
    underviser: "CPSN Thomsen",
  },
  {
    id: "s7",
    navn: "Eksercits – deling",
    kategori: "Eksercits",
    timerGennemført: 1,
    timerTotal: 4,
    status: "I gang",
    underviser: "KP Sørensen",
  },
  {
    id: "s8",
    navn: "Feltøvelse – døgn 1",
    kategori: "Feltøvelser",
    timerGennemført: 0,
    timerTotal: 12,
    status: "Ikke påbegyndt",
    underviser: "DLF",
  },
];

const pct = (a: number, b: number) => Math.round((100 * a) / (b || 1));
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString("da-DK") : "—");

export default function PlanUddannelse() {
  const [query, setQuery] = useState("");
  const [onlyUnder80, setOnlyUnder80] = useState(false);
  const [catVisible, setCatVisible] = useState<Record<Kategori, boolean>>(
    Object.fromEntries(KATEGORIER.map((k) => [k, true])) as Record<Kategori, boolean>
  );

  const { samletPct, catPct, manglerTot, udenDato } = useMemo(() => {
    const total = DATA.reduce((acc, subj) => acc + subj.timerTotal, 0);
    const done = DATA.reduce((acc, subj) => acc + subj.timerGennemført, 0);
    const cat = Object.fromEntries(KATEGORIER.map((k) => [k, { done: 0, total: 0 }])) as Record<
      Kategori,
      { done: number; total: number }
    >;

    let missing = 0;
    let withoutDate = 0;
    for (const subj of DATA) {
      cat[subj.kategori].done += subj.timerGennemført;
      cat[subj.kategori].total += subj.timerTotal;
      missing += subj.mangler?.length ?? 0;
      if (subj.status !== "Afsluttet" && !subj.naesteDato) withoutDate++;
    }

    const catPct = Object.fromEntries(
      KATEGORIER.map((k) => [k, pct(cat[k].done, cat[k].total)])
    ) as Record<Kategori, number>;

    return { samletPct: pct(done, total), catPct, manglerTot: missing, udenDato: withoutDate };
  }, []);

  const list = useMemo(() => {
    const lower = query.toLowerCase();
    return DATA.filter((subj) => {
      if (!catVisible[subj.kategori]) return false;
      if (lower && !`${subj.navn} ${subj.kategori} ${subj.underviser ?? ""}`.toLowerCase().includes(lower)) return false;
      if (onlyUnder80 && pct(subj.timerGennemført, subj.timerTotal) >= 80) return false;
      return true;
    });
  }, [query, catVisible, onlyUnder80]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader title="PlanUddannelse" />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Samlet uddannelsesgrad"
            value={`${samletPct}%`}
            sub="Alle fag (timer vægtet)"
            tone={samletPct >= 80 ? "ok" : samletPct >= 60 ? "warn" : "bad"}
          />
          <StatCard
            label="Manglende opgaver"
            value={manglerTot}
            sub="Tjeklister / afleveringer"
            tone={manglerTot === 0 ? "ok" : "warn"}
          />
          <StatCard
            label="Forløb uden dato"
            value={udenDato}
            sub="Plan kræver dato"
            tone={udenDato > 0 ? "bad" : "ok"}
          />
          <StatCard
            label="Aktive fag"
            value={DATA.filter((d) => d.status !== "Afsluttet").length}
            sub="I gang / planlagt"
            tone="info"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {KATEGORIER.map((k) => (
            <div key={k} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{k}</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={catVisible[k]}
                    onChange={(e) => setCatVisible((prev) => ({ ...prev, [k]: e.target.checked }))}
                  />
                  Vis
                </label>
              </div>
              <div className="mt-3">
                <ProgressBar value={catPct[k]} />
                <div className="mt-1 text-sm text-slate-600">{catPct[k]}% gennemført</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søg i fag, underviser, kategori…"
            className="w-full rounded-xl border bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:w-96"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={onlyUnder80}
              onChange={(e) => setOnlyUnder80(e.target.checked)}
            />
            Vis kun fag &lt; 80%
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
              {list.map((subj) => {
                const progress = pct(subj.timerGennemført, subj.timerTotal);
                const badge =
                  subj.status === "Afsluttet"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : subj.status === "I gang"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200";

                return (
                  <div key={subj.id} className="rounded-2xl border bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">{subj.kategori}</div>
                        <div className="text-lg font-semibold text-slate-900">{subj.navn}</div>
                        <div className="text-sm text-slate-500">Underviser: {subj.underviser ?? "—"}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badge}`}>{subj.status}</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <ProgressBar value={progress} />
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="tabular-nums">
                          {subj.timerGennemført} / {subj.timerTotal} t
                        </span>
                        <span className="tabular-nums font-medium">{progress}%</span>
                      </div>
                      <div className="text-sm text-slate-500">Næste modul: {fmt(subj.naesteDato)}</div>
                    </div>

                    {subj.mangler?.length ? (
                      <div className="mt-4 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                        <div className="mb-1 text-xs font-semibold text-amber-800">Mangler</div>
                        <ul className="ml-5 list-disc text-sm text-amber-900">
                          {subj.mangler.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">Åbn materiale</button>
                      <button className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">Marker som afsluttet</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
                    <th>Kategori</th>
                    <th>Fag</th>
                    <th>Status</th>
                    <th>Fremskridt</th>
                    <th>Underviser</th>
                    <th>Næste dato</th>
                    <th>Mangler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((subj) => {
                    const progress = pct(subj.timerGennemført, subj.timerTotal);
                    const badge =
                      subj.status === "Afsluttet"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : subj.status === "I gang"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-slate-50 text-slate-700 ring-slate-200";
                    return (
                      <tr key={subj.id} className="[&>td]:px-4 [&>td]:py-3">
                        <td className="text-slate-600">{subj.kategori}</td>
                        <td className="font-medium text-slate-900">{subj.navn}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badge}`}>
                            {subj.status}
                          </span>
                        </td>
                        <td className="w-44">
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <ProgressBar value={progress} />
                            </div>
                            <span className="tabular-nums">{progress}%</span>
                          </div>
                        </td>
                        <td className="text-slate-600">{subj.underviser ?? "—"}</td>
                        <td>{fmt(subj.naesteDato)}</td>
                        <td className="text-slate-600">{subj.mangler?.length ? subj.mangler.join(", ") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Print / PDF</button>
              <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">Eksportér CSV</button>
              <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">Gem ugentlig status & underskriv</button>
            </div>
          </div>

          <AIUddannelsesAssistent onSend={(prompt) => console.log("AI prompt:", prompt)} />
        </div>
      </div>
    </div>
  );
}
