import React from "react";
import { Clock3, Compass, Boxes, Truck, GraduationCap, UsersRound, ExternalLink } from "lucide-react";
import ProductCard from "../components/ProductCard";
import AdminHelper from "../components/AdminHelper";
import { getOrg } from "../App";

const STANDARD_CARDS = [
  {
    title: "PlanTid",
    subtitle: "Skemalægning & arbejdstid.",
    icon: <Clock3 className="h-6 w-6" />,
    href: "https://plan-fk6lm5pgo-philiphovs-projects.vercel.app/#plantid",
    external: true,
  },
  {
    title: "PlanTN",
    subtitle: "Terræn & øvelsessteder.",
    icon: <Compass className="h-6 w-6" />,
    href: "https://plan-fk6lm5pgo-philiphovs-projects.vercel.app/#plantn",
    external: true,
  },
  {
    title: "PlanLog (UAFD)",
    subtitle: "Materiel, status, mangler — ét overblik.",
    icon: <Boxes className="h-6 w-6" />,
    href: "#/app/planlog",
  },
  {
    title: "PlanTransport",
    subtitle: "Ruter, afhentninger & køretøjer.",
    icon: <Truck className="h-6 w-6" />,
    href: "#/app/plantransport",
  },
  {
    title: "PlanUddannelse",
    subtitle: "Doktrin/SharePoint søgning + AI-skabeloner.",
    icon: <GraduationCap className="h-6 w-6" />,
    href: "#/app/planuddannelse",
  },
  {
    title: "PlanPSN",
    subtitle: "PSN, FOKUS & samtaler (AI-sparring).",
    icon: <UsersRound className="h-6 w-6" />,
    href: "#/app/planpsn",
  },
];

export default function ProductsPage() {
  const org = getOrg();
  const isHko = org === "HKO";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-[#f6f8ff] to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-semibold text-slate-900">PlanOps</div>
        <button
          onClick={() => (window.location.hash = "/")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-slate-800 shadow ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <span role="img" aria-label="Profil">
            👤
          </span>
          Log ud
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-slate-900">PLANOPS Produkt Vælger</h1>
        <p className="mt-3 text-center text-slate-600">Vælg den løsning du vil arbejde videre med.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {isHko ? (
            <ProductCard
              title="PlanLog (HKO)"
              subtitle="Hærens samlede overblik, status & rapportering."
              icon={<ExternalLink className="h-6 w-6" />}
              href="https://plan-fk6lm5pgo-philiphovs-projects.vercel.app/#planlog"
              external
            />
          ) : (
            STANDARD_CARDS.map((card) => <ProductCard key={card.title} {...card} />)
          )}
        </div>
      </main>

      <AdminHelper />
    </div>
  );
}
