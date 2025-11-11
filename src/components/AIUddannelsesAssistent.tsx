type Props = {
  onSend?: (prompt: string) => void;
};

export default function AIUddannelsesAssistent({ onSend }: Props) {
  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const prompt = String(fd.get("prompt") || "").trim();
    if (!prompt) return;
    onSend?.(prompt);
    (e.currentTarget.elements.namedItem("prompt") as HTMLInputElement).value = "";
  }

  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-5 py-4 text-xl font-semibold">AI — Uddannelsesassistent</div>
      <div className="px-5 pb-5">
        <div className="rounded-xl bg-slate-50 p-5 text-slate-800 ring-1 ring-slate-200">
          <p className="text-lg">
            Hej! Jeg kan hjælpe med <b>lektionsplaner</b> og <b>direktiver</b>. Skriv hvad du vil have genereret — fx mål,
            ressourcer, sikkerhed eller ansvar.
          </p>
          <p className="mt-3 text-slate-600">
            Eksempel: <i>“Lav lektionsplan for M/95 vedligehold (2 timer) med fokus på sikkerhed og evaluering.”</i>
          </p>
          <textarea className="mt-4 h-44 w-full resize-none rounded-lg border bg-white p-3 focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>

        <form onSubmit={handle} className="mt-3 flex gap-2">
          <input
            name="prompt"
            placeholder="Skriv prompt…"
            className="flex-1 rounded-xl border bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-500">Send</button>
        </form>
      </div>
    </div>
  );
}
