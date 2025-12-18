"use client";

import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface WhenDropdownProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  onClose?: () => void;
}

export default function WhenDropdown({
  startDate,
  endDate,
  onDateChange,
  onClose,
}: WhenDropdownProps) {
  const [localStart, setLocalStart] = useState<Date | null>(startDate);
  const [localEnd, setLocalEnd] = useState<Date | null>(endDate);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (date: Date) => {
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(date);
      setLocalEnd(null);
    } else if (localStart && !localEnd) {
      if (date >= localStart) {
        setLocalEnd(date);
      } else {
        setLocalStart(date);
        setLocalEnd(null);
      }
    }
  };

  const handleClear = () => {
    setLocalStart(null);
    setLocalEnd(null);
    onDateChange(null, null);
  };

  const handleConfirm = () => {
    if (localStart && localEnd) {
      onDateChange(localStart, localEnd);
      if (onClose) onClose();
    }
  };

  const renderMonth = (monthOffset: number) => {
    const month = (currentMonth + monthOffset) % 12;
    const year = currentYear + Math.floor((currentMonth + monthOffset) / 12);
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isStart = localStart && date.toDateString() === localStart.toDateString();
      const isEnd = localEnd && date.toDateString() === localEnd.toDateString();
      const isInRange = localStart && localEnd && date > localStart && date < localEnd;
      const isDisabled = date < today;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && handleDateClick(date)}
          disabled={isDisabled}
          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
            isDisabled
              ? "cursor-not-allowed text-gray-300"
              : isStart || isEnd
              ? "bg-blue-600 text-white"
              : isInRange
              ? "bg-blue-100 text-blue-900"
              : isToday
              ? "border-2 border-blue-600 text-blue-600"
              : "text-gray-900 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <h3 className="mb-3 text-center font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
      className="search-bar-dropdown w-full max-w-[400px] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-6"
      data-dropdown="search-when"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Select Dates</h2>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Single month with navigation arrows - same for mobile and desktop */}
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))}
            disabled={monthOffset === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setMonthOffset(monthOffset + 1)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        {renderMonth(monthOffset)}
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-gray-700">
          {!localStart ? (
            <p>Select check-in date</p>
          ) : !localEnd ? (
            <p>Select check-out date</p>
          ) : (
            <p>
              {localStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
              {localEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!localStart || !localEnd}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm Dates
        </button>
      </div>
    </motion.div>
  );
}
