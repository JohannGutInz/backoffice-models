export type CalendarEvent = {
  id: string;
  nombre: string;
  startAt: Date;
  endAt: Date;
  cubierto: boolean;
  recurringDays: number[];
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  modelo: { id: string; firstName: string; lastNameP: string; lastNameM?: string | null } | null;
  _virtualKey?: string;
};

export type SerializedEvento = {
  id: string;
  nombre: string;
  startAt: string;
  endAt: string;
  cubierto: boolean;
  recurringDays: number[];
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  modelo: { id: string; firstName: string; lastNameP: string; lastNameM?: string | null } | null;
};

export type CalendarDay = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
};

export type MultiDayBar = {
  event: CalendarEvent;
  startCol: number;
  endCol: number;
  lane: number;
  startsHere: boolean;
  endsHere: boolean;
};

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isMultiDay(event: CalendarEvent): boolean {
  return !isSameDay(event.startAt, event.endAt);
}

// Expand recurring events into individual single-day occurrences within the event's range.
// Non-recurring events are returned as-is.
export function expandEventos(events: CalendarEvent[]): CalendarEvent[] {
  const result: CalendarEvent[] = [];
  for (const e of events) {
    if (!e.recurringDays.length) {
      result.push(e);
      continue;
    }
    const [sh, sm] = (e.dailyStartTime ?? "09:00").split(":").map(Number);
    const [eh, em] = (e.dailyEndTime ?? "18:00").split(":").map(Number);
    const cur = new Date(startOfDay(e.startAt));
    const until = startOfDay(e.endAt);
    while (cur <= until) {
      if (e.recurringDays.includes(cur.getDay())) {
        const startAt = new Date(cur);
        startAt.setHours(sh, sm, 0, 0);
        const endAt = new Date(cur);
        endAt.setHours(eh, em, 0, 0);
        result.push({ ...e, startAt, endAt, _virtualKey: `${e.id}_${toDateKey(cur)}` });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }
  return result;
}

export function getCalendarWeeks(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startWeekday + 1;
    let date: Date;
    let inCurrentMonth: boolean;
    if (dayNumber < 1) {
      date = new Date(year, month - 1, daysInPrevMonth + dayNumber);
      inCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      date = new Date(year, month + 1, dayNumber - daysInMonth);
      inCurrentMonth = false;
    } else {
      date = new Date(year, month, dayNumber);
      inCurrentMonth = true;
    }
    cells.push({ date, dateKey: toDateKey(date), inCurrentMonth });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function getMultiDayBarsForWeek(
  week: CalendarDay[],
  events: CalendarEvent[],
): MultiDayBar[] {
  const weekStart = week[0].date;
  const weekEnd = week[6].date;
  const weekEndMs = weekEnd.getTime() + 86400000 - 1;

  const multiDayEvents = events
    .filter((e) => {
      if (isSameDay(e.startAt, e.endAt)) return false;
      return e.startAt.getTime() <= weekEndMs && e.endAt.getTime() >= weekStart.getTime();
    })
    .sort((a, b) => {
      const diff = a.startAt.getTime() - b.startAt.getTime();
      if (diff !== 0) return diff;
      return (b.endAt.getTime() - b.startAt.getTime()) - (a.endAt.getTime() - a.startAt.getTime());
    });

  const laneOccupied: number[] = [];
  const bars: MultiDayBar[] = [];

  for (const event of multiDayEvents) {
    const effectiveStart = event.startAt < weekStart ? weekStart : startOfDay(event.startAt);
    const effectiveEnd = event.endAt > weekEnd ? weekEnd : startOfDay(event.endAt);

    const startCol = Math.round((effectiveStart.getTime() - weekStart.getTime()) / 86400000);
    const endCol = Math.min(Math.round((effectiveEnd.getTime() - weekStart.getTime()) / 86400000), 6);
    const clampedStart = Math.max(startCol, 0);

    let lane = 0;
    while (laneOccupied[lane] !== undefined && laneOccupied[lane] >= clampedStart) {
      lane++;
    }
    laneOccupied[lane] = endCol;

    bars.push({
      event,
      startCol: clampedStart,
      endCol,
      lane,
      startsHere: isSameDay(event.startAt, effectiveStart),
      endsHere: effectiveEnd <= weekEnd,
    });
  }

  return bars;
}

export function getSingleDayEventsForDay(dateKey: string, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => isSameDay(e.startAt, e.endAt) && toDateKey(e.startAt) === dateKey);
}

export function getAllEventsForDay(dateKey: string, events: CalendarEvent[]): CalendarEvent[] {
  return events
    .filter((e) => {
      const start = toDateKey(startOfDay(e.startAt));
      const end = toDateKey(startOfDay(e.endAt));
      return start <= dateKey && dateKey <= end;
    })
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export function parseSerializedEvento(e: SerializedEvento): CalendarEvent {
  return {
    ...e,
    startAt: new Date(e.startAt),
    endAt: new Date(e.endAt),
  };
}
