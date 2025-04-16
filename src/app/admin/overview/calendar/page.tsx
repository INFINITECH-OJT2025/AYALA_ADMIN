import AdminCalendar from "@/components/calendar/adminCalendar";
import React from "react";

const CalendarPage = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold">Admin Calendar</h1>
      <AdminCalendar />
    </div>
  );
};

export default CalendarPage;
