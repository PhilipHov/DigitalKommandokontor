import React from "react";

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
};

export default function ProductCard({ title, subtitle, icon, href, external }: Props) {
  const linkProps = external ? { href, target: "_self", rel: "noopener" } : { href };

  return (
    <a
      {...linkProps}
      className="group relative block rounded-[24px] border border-[#e4e8f5] bg-white py-6 px-7 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)] transition hover:shadow-[0_16px_36px_-16px_rgba(15,23,42,0.38)]"
    >
      <div className="absolute -top-7 -left-8 h-[120px] w-[120px] rounded-full bg-gradient-to-b from-[#f2f6ff] to-transparent opacity-60 pointer-events-none" />
      <div className="flex items-start gap-4">
        <div className="relative grid h-[52px] w-[52px] place-items-center rounded-[18px] bg-gradient-to-b from-[#f5f8ff] via-[#f0f4ff] to-[#e6ecff] text-[#2a3b7d]">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
          <p className="text-[15px] text-slate-600 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 h-px w-full bg-[#e3e7f2]" />

      <div className="mt-4 inline-flex items-center gap-2 text-slate-800 font-medium">
        <span>Åbn</span>
        <span aria-hidden className="translate-x-0 transition group-hover:translate-x-[3px]">→</span>
      </div>
    </a>
  );
}
