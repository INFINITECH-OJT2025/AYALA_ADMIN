"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import useAppointments from "../../hooks/useAppointments";
import { EventApi } from "@fullcalendar/core";
import EventDetailsDialog from "@/components/common/EventDetailsDialog";
import InterviewDetailsDialog from "@/components/common/InterviewDetailsDialog";
import useInterview from "@/hooks/useInterview";

interface EventDetails {
  id: number;
  date: string;
  time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}

const AdminCalendar = () => {
  const events = useAppointments();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(
    null
  );
  const { schedule, applicant, loading } = useInterview(selectedApplicantId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEventClick = async (eventInfo: { event: EventApi }) => {
    const eventId = Number(eventInfo.event.id);

    // If this is an applicant interview event, fetch interview details
    if (eventInfo.event.extendedProps.isInterview) {
      setSelectedApplicantId(eventId);
      setSelectedEvent(null);
    } else {
      // Otherwise, fetch general event details
      setSelectedApplicantId(null);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/appointments/${eventId}`);
        const data: EventDetails = await res.json();
        setSelectedEvent(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    }
  };

  return (
    <div>
      <div className="text-gray-900 dark:text-gray-100 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          events={events}
          height="auto"
          eventClick={handleEventClick}
          dayHeaderClassNames="bg-gray-100 dark:bg-[#18181a] dark:text-gray-200"
          dayCellClassNames="bg-white dark:bg-[#18181a] dark:border-gray-700"
          eventClassNames="bg-emerald-500 text-white dark:bg-emerald-400 dark:text-gray-900 hover:bg-emerald-600 hover:text-gray-100 dark:hover:bg-emerald-500 dark:hover:text-gray-200"
        />
      </div>

      {isMounted && (
        <>
          {/* General Event Details Dialog */}
          <EventDetailsDialog
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />

          {/* Interview Details Dialog */}
          <InterviewDetailsDialog
            applicantId={selectedApplicantId}
            isOpen={!!selectedApplicantId}
            onClose={() => setSelectedApplicantId(null)}
            schedule={schedule}
            applicant={applicant} // ✅ Pass applicant details
          />
        </>
      )}
    </div>
  );
};

export default AdminCalendar;
