import { Link } from "react-router-dom";
import { AlarmClock, Compass, Boxes, Truck, GraduationCap, UserCircle2, ChevronRight } from "lucide-react";

const CARDS = [
  { title: "PlanTid", desc: "Skemalægning & arbejdstid.", icon: AlarmClock, to: "/planlog" },
  { title: "PlanTN", desc: "Terræn & øvelsessteder.", icon: Compass, to: "/planlog" },
  { title: "PlanLog (UAFD)", desc: "Materiel, status, mangler — ét overblik.", icon: Boxes, to: "/planlog" },
  { title: "PlanTransport", desc: "Ruter, afhentninger & køretøjer.", icon: Truck, to: "/plantransport" },
  { title: "PlanUddannelse", desc: "Doktrin/SharePoint søgning + AI-skabeloner.", icon: GraduationCap, to: "/planuddannelse" },
  { title: "PlanPSN", desc: "PSN, FOKUS & samtaler (AI-sparring).", icon: UserCircle2, to: "/planpsn" },
];

export default function Apps() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="text-center pt-12 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">PLANOPS Produkt Vælger</h1>
        <p className="mt-2 text-slate-600 text-lg">Vælg den løsning du vil arbejde videre med.</p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-16 md:grid-cols-2">
        {CARDS.map(({ title, desc, icon: Icon, to }) => (
          <Link key={title} to={to} className="group block">
            <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-blue-200">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 transition group-hover:bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="text-slate-600">{desc}</p>
                </div>
              </div>

              <div className="mt-6 h-px w-full bg-slate-200" />

              <div className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium">
                <span>Åbn</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
