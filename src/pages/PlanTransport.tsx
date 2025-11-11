import { Route, Truck, MapPin } from "lucide-react";
import AppHeader from "../components/AppHeader";

export default function PlanTransport() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader title="PlanTransport" />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">PlanTransport</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-3">
              <Route className="h-6 w-6 text-slate-700" />
              <h2 className="text-lg font-semibold">Ruteplan</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4" /> Frederikslund → Sjælsmark (08:00–10:30)
                </div>
                <div className="text-slate-500">Stop: Depot A → Depot B → Skydebane</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4" /> Antvorskov → Næstved (11:15–12:30)
                </div>
                <div className="text-slate-500">Afhentninger: M/10 reservedele</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center gap-3">
              <Truck className="h-6 w-6 text-slate-700" />
              <h2 className="text-lg font-semibold">Køretøjer</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2 pr-6">Vogn</th>
                    <th className="py-2 pr-6">Status</th>
                    <th className="py-2 pr-6">Fører</th>
                    <th className="py-2">Bemærkning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 pr-6 font-medium text-slate-900">ZR-113 (Lastbil)</td>
                    <td className="py-2 pr-6">Klar</td>
                    <td className="py-2 pr-6">SG Hansen</td>
                    <td className="py-2">Tanket, klar 07:30</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-medium text-slate-900">ZR-221 (Varevogn)</td>
                    <td className="py-2 pr-6">Service</td>
                    <td className="py-2 pr-6">—</td>
                    <td className="py-2">Bremsecheck kl. 13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
