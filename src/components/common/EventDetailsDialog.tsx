"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface EventDetailsDialogProps {
  event: EventDetails | null;
  onClose: () => void;
}

const EventDetailsDialog = ({ event, onClose }: EventDetailsDialogProps) => {
  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-[#18181a] dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-semibold">📅 Date & Time:</span>{" "}
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(`1970-01-01T${event.time}`).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <div>
            <span className="font-semibold">👤 Booker:</span> {event.first_name}{" "}
            {event.last_name}
          </div>
          <div>
            <span className="font-semibold">✉️ Email:</span> {event.email}
          </div>
          <div>
            <span className="font-semibold">📞 Phone:</span> {event.phone}
          </div>
          <div>
            <span className="font-semibold">📝 Message:</span> {event.message}
          </div>
        </div>

        <DialogFooter className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
