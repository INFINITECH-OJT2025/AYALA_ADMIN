"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import useFetchAllNotifications from "@/hooks/useFetchAllNotifications";
import { toast } from "sonner";


export default function Notification() {
  const { notifications: fetchedNotifications, fetchNotifications } = useFetchAllNotifications();
  const [notifications, setNotifications] = useState(fetchedNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" or "unread"
  const [openMenu, setOpenMenu] = useState<number | null>(null);
 const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const router = useRouter();

  interface Interview {
    applicant_id: number;
    name: string;
    email: string;
    phone: string;
    position: string;
    final_schedule: string;
  }
  
  const fetchUpcomingInterviews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/upcoming-interviews");
      const data = await response.json();
      setUpcomingInterviews(data);
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
    }
  };
  
  // ✅ Fetch interviews when component mounts
  useEffect(() => {
    fetchUpcomingInterviews();
  }, []);
  
  // ✅ Notify the admin if there are upcoming interviews
  useEffect(() => {
    if (upcomingInterviews.length > 0) {
      upcomingInterviews.forEach((interview) => {
        toast.info(
          `Upcoming Interview: ${interview.name} for ${interview.position} on ${new Date(interview.final_schedule).toLocaleString()}`
        );
      });
    }
  }, [upcomingInterviews]);

  // ✅ Sync fetched notifications when they change
  useEffect(() => {
    setNotifications(
      fetchedNotifications.map((notif) => ({
        ...notif,
        is_read: notif.is_read || "unread", // Ensure "is_read" is correctly set
      }))
    );
  }, [fetchedNotifications]);

  // ✅ Mark a single notification as read
  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}/mark-read`, {
        method: "POST",
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: "read" } : notif
        )
      );

      // ✅ Force refresh to persist read status after reload
      fetchNotifications();

      toast.success("Notification marked as read.");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://127.0.0.1:8000/api/notifications/mark-all-read", {
        method: "POST",
      });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: "read" }))
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read.");
    }
  };

  // ✅ Handle Notification Click (Navigate + Mark as Read)
  const handleViewNotification = (id: number, route: string) => {
    markAsRead(id);
    router.push(route);
  };

  // ✅ Delete notification
  const deleteNotification = async (id: number) => {
    const deletedNotif = notifications.find((notif) => notif.id === id);
    if (!deletedNotif) return;

    // ✅ Optimistically remove from UI
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));

    // ✅ Show undo toast
    toast(`Notification deleted.`, {
      action: {
        label: "Undo",
        onClick: async () => {
          try {
            const response = await fetch(
              "http://127.0.0.1:8000/api/notifications/restore",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: deletedNotif.message, // ✅ Ensure message is sent
                  type: deletedNotif.type, // ✅ Ensure type is sent
                  is_read: deletedNotif.is_read || "unread", // ✅ Default to unread if missing
                }),
              }
            );

            if (!response.ok) throw new Error("Failed to restore notification");

            const restoredNotif = await response.json();

            // ✅ Update UI immediately after restoring
            setNotifications((prev) => [...prev, restoredNotif]);

            toast.success("Notification restored.");
          } catch (error) {
            console.error("Error restoring notification:", error);
            toast.error("Failed to restore notification.");
          }
        },
      },
    });

    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification.");
    }
  };

  // ✅ Get Route for Notification Based on Message
  const getNotificationRoute = (notif: any) => {
    const message = notif.message.toLowerCase();

    if (message.startsWith("new property submitted"))
      return "/admin/overview/listed-properties";
    if (message.startsWith("new job application"))
      return "/admin/overview/job-applications";
    if (message.startsWith("new property inquiry"))
      return "/admin/Inquiries-Appointments/property-inquiries";
    if (message.startsWith("new appointment booked"))
      return "/admin/Inquiries-Appointments/property-appointments";
    if (message.startsWith("new general inquiry"))
      return "/admin/overview/inquiries-received";

    return "#"; // Default (No route)
  };

  // ✅ Filter Notifications Based on Selection
  // ✅ Fix unread filter to correctly check if the notification is unread
  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.is_read !== "read"
  );

  return (
    <div className="relative">
      {/* ✅ Notification Bell */}
      <Button
        variant="ghost"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />

        {/* ✅ Show badge only if there are unread notifications */}
        {notifications.filter((n) => n.is_read !== "read").length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {notifications.filter((n) => n.is_read !== "read").length}
          </span>
        )}
      </Button>

      {/* ✅ Notification Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-black shadow-lg border border-gray-300 dark:border-gray-700 rounded-lg p-4 z-50 h-max overflow-hidden"
        >
          {/* ✅ Tabs for "All" and "Unread" */}
          <div className="flex border-b pb-2 mb-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="ml-2"
            >
              Unread
            </Button>

            {notifications.some((n) => n.is_read !== "read") && (
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
                >
                  Mark All as Read
                </Button>
              </div>
            )}
          </div>

          {/* ✅ Notification List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`relative flex items-center p-3 border rounded-lg ${
                    notif.is_read === "read"
                      ? "bg-gray-100 dark:bg-[#18181a]"
                      : "bg-emerald-100 dark:bg-emerald-900"

                  }`}
                >
                  {/* ✅ Icon */}
                  {notif.type === "success" && (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  )}
                  {notif.type === "error" && (
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}

                  {/* ✅ Message */}
                  <p className="text-sm flex-1">{notif.message}</p>

                  {/* ✅ View Button */}
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleViewNotification(
                        notif.id,
                        getNotificationRoute(notif)
                      )
                    }
                  >
                    <Eye className="w-5 h-5" />
                  </Button>

                  {/* ✅ Three-dot Menu */}
                  <div className="relative">
                    <button
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-800"
                      onClick={() => deleteNotification(notif.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No new notifications</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
