export function BrandPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <p className="mb-4 text-[11px] font-semibold tracking-[0.32em] text-white/55 uppercase">{eyebrow}</p>
      <h1 className="text-4xl leading-[0.95] font-light tracking-[0.1em] text-white uppercase sm:text-5xl">
        {title}
      </h1>
      <div className="mt-5 h-px w-12 bg-gold-500 shadow-[0_0_18px_rgba(186,27,93,0.5)]" />
      <p className="mx-auto mt-5 max-w-xl text-[11px] leading-relaxed tracking-[0.12em] text-white/55 uppercase">
        {description}
      </p>
    </div>
  );
}
