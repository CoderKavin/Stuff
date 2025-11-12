import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date & time",
  timeFormat = "12",
  isDarkMode = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : new Date()
  );
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    value ? new Date(value).toTimeString().slice(0, 5) : "09:00"
  );
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes, 0, 0);
    onChange(finalDate.toISOString());
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange("");
    setShowPicker(false);
  };

  const formatDisplayDate = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: timeFormat === "12",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1, date2) => {
    return (
      date1 &&
      date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ position: "relative" }} ref={pickerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        style={{
          color: value ? (isDarkMode ? "#ffffff" : "#1C1C1E") : "#8E8E93",
          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
          borderRadius: "12px",
          border: isDarkMode ? "1px solid #3a3a3a" : "1px solid #E5E5E5",
        }}
        className="w-full px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF] transition-smooth"
      >
        {formatDisplayDate()}
      </button>
      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            backgroundColor: isDarkMode ? "#252525" : "white",
            borderRadius: "16px",
            border: isDarkMode ? "1px solid #3a3a3a" : "1px solid #E5E5E5",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            zIndex: 1000,
            width: "320px",
          }}
          className="animate-scale-in"
        >
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
                style={{ color: "#007AFF", padding: "4px" }}
                className="hover:bg-[#007AFF10] rounded-lg transition-smooth"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#1C1C1E",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {monthName}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
                style={{ color: "#007AFF", padding: "4px" }}
                className="hover:bg-[#007AFF10] rounded-lg transition-smooth"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  style={{
                    color: "#8E8E93",
                    fontSize: "11px",
                    fontWeight: "600",
                    textAlign: "center",
                    padding: "4px",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "16px",
              }}
            >
              {days.map((day, index) => {
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    disabled={!day}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      backgroundColor: isSelected
                        ? "#007AFF"
                        : isTodayDate
                        ? isDarkMode
                          ? "rgba(0, 122, 255, 0.2)"
                          : "#007AFF10"
                        : "transparent",
                      color: isSelected
                        ? "white"
                        : isTodayDate
                        ? "#007AFF"
                        : day
                        ? isDarkMode
                          ? "#ffffff"
                          : "#1C1C1E"
                        : "transparent",
                      fontWeight: isSelected || isTodayDate ? "600" : "400",
                      border: "none",
                      cursor: day ? "pointer" : "default",
                    }}
                    className={day ? "hover:bg-[#F2F2F7] transition-smooth" : ""}
                  >
                    {day ? day.getDate() : ""}
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  color: "#8E8E93",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                TIME
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: isDarkMode ? "1px solid #3a3a3a" : "1px solid #E5E5E5",
                  fontSize: "14px",
                  color: isDarkMode ? "#ffffff" : "#1C1C1E",
                  backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                }}
                className="focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF]"
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: isDarkMode ? "1px solid #3a3a3a" : "1px solid #E5E5E5",
                  backgroundColor: isDarkMode ? "#2a2a2a" : "white",
                  color: "#FF3B30",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
                className="hover:bg-[#FF3B3010] transition-smooth"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#007AFF",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                }}
                className="hover:bg-[#0051D5] transition-smooth"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
