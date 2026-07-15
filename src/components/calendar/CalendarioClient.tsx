"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCalendarWeeks,
  getMultiDayBarsForWeek,
  getSingleDayEventsForDay,
  getAllEventsForDay,
  parseSerializedEvento,
  expandEventos,
  formatTime,
  toDateKey,
  type SerializedEvento,
} from "@/lib/calendar-utils";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const BAR_HEIGHT = 22;
const DAY_NUM_HEIGHT = 28;

function monthParam(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function CalendarioClient({
  year,
  month,
  eventos: rawEventos,
  todayKey,
  eventoBaseUrl,
}: {
  year: number;
  month: number;
  eventos: SerializedEvento[];
  todayKey: string;
  eventoBaseUrl: string;
}) {
  const eventos = expandEventos(rawEventos.map(parseSerializedEvento));
  const weeks = getCalendarWeeks(year, month);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const prevParam = monthParam(year, month === 0 ? 11 : month - 1, );
  const prevYear = month === 0 ? year - 1 : year;
  const nextParam = monthParam(year, month === 11 ? 0 : month + 1);
  const nextYear = month === 11 ? year + 1 : year;
  const currentParam = monthParam(new Date().getFullYear(), new Date().getMonth());

  const selectedEvents = selectedDay ? getAllEventsForDay(selectedDay, eventos) : [];

  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-zinc-900">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Link
            href={`/app/calendario?month=${monthParam(new Date().getFullYear(), new Date().getMonth())}`}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
          >
            Hoy
          </Link>
          <Link
            href={`/app/calendario?month=${monthParam(prevYear, month === 0 ? 11 : month - 1)}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/app/calendario?month=${monthParam(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1)}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-zinc-200 pb-2">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-medium text-zinc-400">
            {wd}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="border-l border-zinc-200">
        {weeks.map((week, weekIdx) => {
          const bars = getMultiDayBarsForWeek(week, eventos);
          const maxLane = bars.reduce((m, b) => Math.max(m, b.lane), -1);
          const barsHeight = maxLane >= 0 ? (maxLane + 1) * BAR_HEIGHT : 0;
          const cellMinHeight = DAY_NUM_HEIGHT + barsHeight + 48; // 48px for chips area

          return (
            <div key={weekIdx} className="relative border-b border-zinc-200">
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {week.map((day, colIdx) => {
                  const isToday = day.dateKey === todayKey;
                  const isSelected = day.dateKey === selectedDay;
                  const singleDayEvts = day.inCurrentMonth
                    ? getSingleDayEventsForDay(day.dateKey, eventos)
                    : [];
                  const visibleChips = singleDayEvts.slice(0, 3);
                  const extraChips = singleDayEvts.length - visibleChips.length;

                  return (
                    <div
                      key={colIdx}
                      onClick={() =>
                        setSelectedDay(day.inCurrentMonth ? (isSelected ? null : day.dateKey) : null)
                      }
                      style={{ minHeight: cellMinHeight }}
                      className={cn(
                        "relative cursor-pointer border-r border-zinc-200 p-1 transition-colors",
                        day.inCurrentMonth ? "bg-white hover:bg-zinc-50" : "bg-zinc-50/50",
                        isSelected && "bg-gold-50 ring-1 ring-inset ring-gold-300",
                      )}
                    >
                      {/* Day number */}
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs leading-none",
                          isToday
                            ? "bg-zinc-950 font-semibold text-gold-300"
                            : day.inCurrentMonth
                              ? "text-zinc-700"
                              : "text-zinc-300",
                        )}
                      >
                        {day.date.getDate()}
                      </span>

                      {/* Space reserved for multi-day bars */}
                      <div style={{ height: barsHeight }} />

                      {/* Single-day chips */}
                      {day.inCurrentMonth && (
                        <div className="flex flex-col gap-0.5 px-0.5">
                          {singleDayEvts.length <= 3 ? (
                            visibleChips.map((e) => (
                              <span
                                key={e._virtualKey ?? e.id}
                                className={cn(
                                  "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                                  e.cubierto
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gold-50 text-gold-700",
                                )}
                              >
                                {e.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600">
                              {singleDayEvts.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Multi-day bars overlay */}
              {bars.map((bar, barIdx) => {
                const span = bar.endCol - bar.startCol + 1;
                const top = DAY_NUM_HEIGHT + bar.lane * BAR_HEIGHT + 2;
                const leftPct = (bar.startCol / 7) * 100;
                const widthPct = (span / 7) * 100;

                const roundedLeft = bar.startsHere ? "8px" : "0px";
                const roundedRight = bar.endsHere ? "8px" : "0px";

                return (
                  <Link
                    key={barIdx}
                    href={`${eventoBaseUrl}/${bar.event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top,
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: BAR_HEIGHT - 4,
                      borderRadius: `${roundedLeft} ${roundedRight} ${roundedRight} ${roundedLeft}`,
                      paddingLeft: bar.startsHere ? "6px" : "2px",
                      paddingRight: bar.endsHere ? "6px" : "2px",
                    }}
                    className={cn(
                      "flex items-center overflow-hidden text-[10px] font-medium transition-opacity hover:opacity-80",
                      bar.event.cubierto
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gold-100 text-gold-800",
                    )}
                  >
                    <span className="truncate">{bar.event.nombre}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h4 className="text-sm font-semibold text-zinc-800">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-400">Sin eventos este día.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {selectedEvents.map((e) => (
                <li key={e.id} className="flex items-start gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-1.5 w-28 shrink-0 text-xs font-medium text-zinc-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(e.startAt)}–{formatTime(e.endAt)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`${eventoBaseUrl}/${e.id}`}
                      className="text-sm font-medium text-zinc-900 hover:text-gold-600"
                    >
                      {e.nombre}
                    </Link>
                    {e.modelo && (
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {e.modelo.firstName} {e.modelo.lastNameP}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      e.cubierto ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                    )}
                  >
                    {e.cubierto && <CheckCircle2 className="h-3 w-3" />}
                    {e.cubierto ? "Cubierto" : "Pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
