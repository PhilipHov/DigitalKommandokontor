import { useState } from "react";
import { setOrg, type Org } from "../App";

export default function LoginPage() {
  const [org, setOrgState] = useState<Org>("UAFD");
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrg(org);
    window.location.hash = "/apps";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f0ff] via-white to-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
        <div className="text-2xl font-semibold text-slate-900">PlanOps</div>
      </header>

      <div className="mx-auto max-w-xl px-6 pt-10 text-center">
        <h1 className="text-5xl font-black text-slate-900">Effektiv drift</h1>
        <p className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
          Mere kampkraft
        </p>
        <p className="mt-4 text-slate-600">
          Komplet personalestyring, intelligent planlægning og terrænbooking i én platform. <strong>PlanOps</strong> frigør tid til operativ styrke.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 max-w-xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
        <p className="text-sm text-slate-500">Vælg organisation og indtast dine oplysninger.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">Organisation</label>
        <select
          value={org}
          onChange={(e) => setOrgState(e.target.value as Org)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-200"
        >
          <option value="UAFD">Enhed (UAFD)</option>
          <option value="HKO">Hærkommandoen (HKO)</option>
          <option value="OTHER">Personelkommandoen/FES/FMI</option>
        </select>

        <label className="mt-4 block text-sm font-medium text-slate-700">Brugernavn</label>
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-200"
          placeholder="fx ab1234"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">Adgangskode</label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-200"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow hover:bg-blue-700"
        >
          Log ind
        </button>
      </form>
    </div>
  );
}
