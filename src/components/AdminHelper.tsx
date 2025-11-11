import React from "react";

export default function AdminHelper() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="fixed right-5 bottom-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-white/90 backdrop-blur px-5 py-3 text-slate-800 shadow-lg ring-1 ring-slate-200 hover:bg-white"
        >
          Administrationshjælper  •  vis
        </button>
      ) : (
        <div className="w-[360px] max-w-[92vw] rounded-2xl bg-white/95 backdrop-blur shadow-2xl ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="font-semibold text-slate-800">Administrationshjælper</div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-700">
              skjul
            </button>
          </div>
          <div className="p-4">
            <div className="h-40 w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-600 text-sm">
              Hej! Jeg kan hjælpe med ferie-/fraværsregler, materielprocesser og “hvor finder jeg skabelonen til …”.
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Skriv fx: 'Hvor ligger fraværsskemaet?'"
              />
              <button className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
