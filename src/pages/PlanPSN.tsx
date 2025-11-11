import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, MessageSquare, Target, Users as UsersIcon } from "lucide-react";
import AppHeader from "../components/AppHeader";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";

type Person = {
  id: string;
  navn: string;
  funktion: string;
  fokusScore: number;
  puStatus: "Ikke påbegyndt" | "Planlagt" | "Udført";
  puDato?: string;
  kvalQ: number;
  kvalQTotal: number;
  handleplan: number;
  naesteSamtale?: string;
  note?: string;
  risikoniveau: "Lav" | "Middel" | "Høj";
};

const START: Person[] = [
  {
    id: "1",
    navn: "SG Hansen",
    funktion: "Delingsfører",
    fokusScore: 82,
    puStatus: "Planlagt",
    puDato: "2025-11-20",
    kvalQ: 7,
    kvalQTotal: 10,
    handleplan: 55,
    naesteSamtale: "2025-11-21",
    note: "Mangler Q-gevær",
    risikoniveau: "Middel",
  },
  {
    id: "2",
    navn: "KN Jensen",
    funktion: "NK deling",
    fokusScore: 91,
    puStatus: "Udført",
    puDato: "2025-09-10",
    kvalQ: 10,
    kvalQTotal: 10,
    handleplan: 100,
    naesteSamtale: "2026-03-10",
    note: "",
    risikoniveau: "Lav",
  },
  {
    id: "3",
    navn: "KP Sørensen",
    funktion: "Gruppefører",
    fokusScore: 66,
    puStatus: "Ikke påbegyndt",
    kvalQ: 5,
    kvalQTotal: 10,
    handleplan: 20,
    naesteSamtale: "2025-11-18",
    note: "PU mangler",
    risikoniveau: "Høj",
  },
  {
    id: "4",
    navn: "OR Larsen",
    funktion: "Konstabel",
    fokusScore: 74,
    puStatus: "Planlagt",
    puDato: "2025-11-25",
    kvalQ: 6,
    kvalQTotal: 8,
    handleplan: 40,
    naesteSamtale: "2025-11-25",
    note: "FOKUS delvist udfyldt",
    risikoniveau: "Middel",
  },
];

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString("da-DK") : "—");

export default function PlanPSN() {
  const [query, setQuery] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const rows = useMemo(() => {
    const lower = query.toLowerCase();
    const now = new Date();
    return START.filter((p) => {
      const match = [p.navn, p.funktion, p.note].join(" ").toLowerCase().includes(lower);
      if (!match) return false;
      if (!onlyCritical) return true;
      const puForfalden = p.puStatus !== "Udført" && (!p.puDato || new Date(p.puDato) < now);
      const handleplanLav = p.handleplan < 50;
      const fokusLav = p.fokusScore < 70;
      return puForfalden || handleplanLav || fokusLav || p.risikoniveau === "Høj";
    });
  }, [query, onlyCritical]);

  const aggregates = useMemo(() => {
    const n = START.length;
    const fokusSnit = Math.round(START.reduce((acc, p) => acc + p.fokusScore, 0) / n);
    const puDone = START.filter((p) => p.puStatus === "Udført").length;
    const overdue = START.filter((p) => {
      const now = new Date();
      const puForfalden = p.puStatus !== "Udført" && (!p.puDato || new Date(p.puDato) < now);
      return puForfalden || p.handleplan < 50 || p.fokusScore < 70 || p.risikoniveau === "Høj";
    }).length;
    const kval = Math.round(
      (100 * START.reduce((acc, p) => acc + p.kvalQ, 0)) /
        START.reduce((acc, p) => acc + p.kvalQTotal, 0)
    );
    return { n, fokusSnit, puDone, overdue, kval };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader title="PlanPSN" />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Gns. FOKUS-score"
            value={`${aggregates.fokusSnit}%`}
            sub="Seneste 12 mdr"
            tone={aggregates.fokusSnit >= 80 ? "ok" : aggregates.fokusSnit >= 70 ? "warn" : "bad"}
          />
          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="PU gennemført"
            value={`${aggregates.puDone}/${aggregates.n}`}
            sub="Sidste 12 mdr"
            tone="info"
          />
          <StatCard
            icon={<UsersIcon className="h-5 w-5" />}
            label="Kvalifikationsgrad (Q)"
            value={`${aggregates.kval}%`}
            sub="Beståede Q'er ud af total"
            tone={aggregates.kval >= 85 ? "ok" : "warn"}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Åben risiko/forfald"
            value={aggregates.overdue}
            sub="PU forfalden / lav FOKUS / lav handleplan"
            tone={aggregates.overdue > 0 ? "bad" : "ok"}
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søg i personel…"
            className="w-full rounded-xl border bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:w-96"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={onlyCritical}
              onChange={(e) => setOnlyCritical(e.target.checked)}
            />
            Vis kun forfald / høj risiko
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left">
                  <th>Navn</th>
                  <th>Funktion</th>
                  <th>FOKUS</th>
                  <th>PU</th>
                  <th>Q'er</th>
                  <th>Handleplan</th>
                  <th>Næste samtale</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((p) => (
                  <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                    <td className="font-medium text-slate-900">{p.navn}</td>
                    <td className="text-slate-600">{p.funktion}</td>
                    <td className="w-44">
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <ProgressBar value={p.fokusScore} />
                        </div>
                        <span className="tabular-nums">{p.fokusScore}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                          p.puStatus === "Udført"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : p.puStatus === "Planlagt"
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-rose-50 text-rose-700 ring-rose-200"
                        }`}
                      >
                        {p.puStatus}
                      </span>
                      <div className="text-xs text-slate-500">{p.puDato ? `(${fmtDate(p.puDato)})` : "—"}</div>
                    </td>
                    <td className="w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <ProgressBar value={Math.round((100 * p.kvalQ) / p.kvalQTotal)} />
                        </div>
                        <span className="tabular-nums">
                          {p.kvalQ}/{p.kvalQTotal}
                        </span>
                      </div>
                    </td>
                    <td className="w-44">
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <ProgressBar value={p.handleplan} />
                        </div>
                        <span className="tabular-nums">{p.handleplan}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{fmtDate(p.naesteSamtale)}</td>
                    <td className="text-slate-600">{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-slate-700" />
              <h2 className="text-lg font-semibold">AI — PSN-assistent</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="font-medium">
                Hej! Jeg kan hjælpe med <b>FOKUS-bedømmelser</b>, <b>PU-notater</b>, <b>handleplaner</b> og
                forslag til <b>opfølgninger</b>.
              </p>
              <p className="mt-3 text-slate-600">
                Eksempel: <i>"Opsummer FOKUS for SG Hansen og foreslå tre handlepunkter."</i>
              </p>
              <ul className="mt-3 space-y-1 text-slate-600">
                <li>• Formuler PU-bedømmelse med styrker og indsatsområder.</li>
                <li>• Beskriv handleplan for lav score på motivation/kompetence.</li>
                <li>• Klargør dagsorden til næste samtale.</li>
              </ul>
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setAiPrompt("");
              }}
            >
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Skriv fx: 'Lav handleplan til KP Sørensen'"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Send
              </button>
            </form>
          </section>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">Eksportér CSV</button>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Print / PDF</button>
          <button className="rounded-xl border px-4 py-2 hover:bg-slate-50">
            Markér ugentlig opfølgning som underskrevet
          </button>
        </div>
      </div>
    </div>
  );
}
