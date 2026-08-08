export function BulletList({ items, twoCol = false }: { items: string[]; twoCol?: boolean }) {
  return (
    <ul className={twoCol ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}>
      {items.map((item) => (
        <li
          key={item}
          className="relative rounded-lg bg-white/5 py-2.5 pr-3.5 pl-6 text-[12.5px] leading-snug text-white/85"
        >
          <span className="absolute top-3.5 left-2.5 h-1.5 w-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(186,27,93,0.7)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}
