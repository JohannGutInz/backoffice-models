const WHATSAPP_CONTACTS = [
  { country: "México", flag: "🇲🇽", number: "5216691730105", display: "+52 1 669 173 0105" },
  { country: "Colombia", flag: "🇨🇴", number: "573107142724", display: "+57 310 714 2724" },
];

export function WhatsAppRow() {
  return (
    <div className="mt-14 flex flex-wrap items-center justify-center gap-3.5">
      {WHATSAPP_CONTACTS.map((c) => (
        <a
          key={c.number}
          href={`https://wa.me/${c.number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/70 px-6 py-3 text-sm text-white backdrop-blur-md transition-colors hover:border-white/30 hover:bg-black/85"
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          WhatsApp {c.flag} {c.display}
        </a>
      ))}
    </div>
  );
}
