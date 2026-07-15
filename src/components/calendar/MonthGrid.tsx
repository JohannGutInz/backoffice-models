import { cn, toDateKey } from "@/lib/utils";
import type { Booking } from "@/lib/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthGrid({
  year,
  month,
  bookingsByDate,
  todayKey,
}: {
  year: number;
  month: number;
  bookingsByDate: Map<string, Booking[]>;
  todayKey: string;
}) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - startWeekday + 1;
    if (dayNumber < 1) {
      return { day: daysInPrevMonth + dayNumber, inCurrentMonth: false, dateKey: "" };
    }
    if (dayNumber > daysInMonth) {
      return { day: dayNumber - daysInMonth, inCurrentMonth: false, dateKey: "" };
    }
    const dateKey = toDateKey(new Date(year, month, dayNumber));
    return { day: dayNumber, inCurrentMonth: true, dateKey };
  });

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-zinc-200 pb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-medium text-zinc-400">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 pt-2">
        {cells.map((cell, idx) => {
          const dayBookings = cell.inCurrentMonth ? bookingsByDate.get(cell.dateKey) ?? [] : [];
          const isToday = cell.inCurrentMonth && cell.dateKey === todayKey;
          return (
            <div
              key={idx}
              className={cn(
                "flex min-h-[88px] flex-col gap-1 rounded-lg border p-1.5",
                cell.inCurrentMonth ? "border-zinc-100 bg-white" : "border-transparent bg-zinc-50/60",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday
                    ? "bg-zinc-950 font-semibold text-gold-300"
                    : cell.inCurrentMonth
                      ? "text-zinc-700"
                      : "text-zinc-300",
                )}
              >
                {cell.day}
              </span>
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                {dayBookings.slice(0, 2).map((b) => (
                  <span
                    key={b.id}
                    className="truncate rounded-md bg-gold-50 px-1.5 py-0.5 text-[10px] font-medium text-gold-700"
                    title={b.id}
                  >
                    {b.id.replace("bkg_", "BK-").toUpperCase()}
                  </span>
                ))}
                {dayBookings.length > 2 && (
                  <span className="text-[10px] text-zinc-400">+{dayBookings.length - 2} más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
