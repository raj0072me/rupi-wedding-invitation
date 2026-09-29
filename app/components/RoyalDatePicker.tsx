"use client";

import { useState, useId } from "react";

interface RoyalDatePickerProps {
  label: string;
  sublabel?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  icon?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function RoyalDatePicker({
  label,
  sublabel,
  value,
  onChange,
  icon = "🗓️",
  placeholder = "Select Auspicious Date",
}: RoyalDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const baseId = useId();

  // Parse existing date or default to January 2027
  const initialDate = value ? new Date(value + "T00:00:00") : new Date(2027, 0, 30);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear() || 2027);
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth() ?? 0); // 0-indexed (January)

  // Format date display
  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const fullDate = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(fullDate);
    setIsOpen(false);
  };

  const handleQuickPreset = (year: number, month: number, day: number) => {
    setViewYear(year);
    setViewMonth(month);
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    onChange(`${year}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Build calendar matrix
  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);
  const totalSlots = Math.ceil((totalDays + startDay) / 7) * 7;

  // Selected date components
  const selectedYear = value ? parseInt(value.split("-")[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split("-")[1], 10) - 1 : null;
  const selectedDay = value ? parseInt(value.split("-")[2], 10) : null;

  return (
    <div className="royal-date-picker-container">
      {label && (
        <label className="field-label" htmlFor={`${baseId}-trigger`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={`${baseId}-trigger`}
        type="button"
        onClick={() => setIsOpen(true)}
        className={`royal-date-trigger ${value ? "has-value" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="royal-date-icon" aria-hidden="true">{icon}</span>
          <div className="text-left truncate">
            {value ? (
              <>
                <div className="royal-date-value">{formatDisplay(value)}</div>
                {sublabel && <div className="royal-date-sublabel">{sublabel}</div>}
              </>
            ) : (
              <span className="royal-date-placeholder">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {value && (
            <span
              onClick={clearSelection}
              className="royal-date-clear-btn"
              title="Clear date"
              role="button"
              tabIndex={0}
            >
              ✕
            </span>
          )}
          <span className="royal-date-arrow-badge">
            {value ? "Change ✎" : "Choose 📅"}
          </span>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="royal-date-modal-overlay"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="royal-date-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="royal-date-header flex items-center justify-between">
              <div>
                <h3 className="royal-date-title">{label || "Select Auspicious Date"}</h3>
                <p className="text-xs text-stone-500 font-serif italic">
                  Choose the sacred date from the wedding calendar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="royal-date-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick Season Presets */}
            <div className="px-4 pt-3 pb-2 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar border-b border-amber-100 bg-amber-50/40">
              <span className="text-amber-800 font-semibold whitespace-nowrap text-[11px] uppercase tracking-wider">
                Auspicious Dates:
              </span>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handleQuickPreset(2027, 0, 30)}
              >
                30 Jan 2027 (Wedding)
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() => handleQuickPreset(2027, 0, 29)}
              >
                29 Jan 2027 (Haldi/Mehndi)
              </button>
            </div>

            <div className="royal-picker-body">
              {/* Month / Year Navigator */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="nav-arrow-btn"
                  title="Previous month"
                >
                  ‹
                </button>

                <div className="flex items-center gap-2 font-display text-base font-bold text-maroon">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                    className="month-select"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                    className="year-select"
                  >
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="nav-arrow-btn"
                  title="Next month"
                >
                  ›
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEKDAYS.map((wd) => (
                  <span
                    key={wd}
                    className="text-xs font-semibold uppercase tracking-wider text-amber-900/60 py-1"
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: totalSlots }).map((_, index) => {
                  const dayNumber = index - startDay + 1;
                  const isCurrentMonth = dayNumber > 0 && dayNumber <= totalDays;

                  if (!isCurrentMonth) {
                    return <div key={index} className="h-9 w-full opacity-0" />;
                  }

                  const isSelected =
                    selectedYear === viewYear &&
                    selectedMonth === viewMonth &&
                    selectedDay === dayNumber;

                  // Lucky/auspicious visual highlight for weekends & prime wedding days
                  const dayOfWeek = (startDay + dayNumber - 1) % 7;
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDay(dayNumber)}
                      className={`calendar-day-btn ${
                        isSelected ? "selected" : ""
                      } ${isWeekend ? "weekend" : ""}`}
                    >
                      <span>{dayNumber}</span>
                      {isSelected && <span className="day-dot"></span>}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-amber-200/50">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    handleQuickPreset(today.getFullYear(), today.getMonth(), today.getDate());
                  }}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                >
                  Today
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="text-xs font-medium text-stone-500 hover:text-stone-700 px-2 py-1"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-xs !py-1.5 !px-3.5 !min-h-0"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
