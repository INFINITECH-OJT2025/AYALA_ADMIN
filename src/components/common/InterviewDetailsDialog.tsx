"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InterviewDetailsDialogProps {
  applicantId: number | null;
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    admin_schedule: string | null;
    new_schedule: string | null;
    interview_date: string | null;
    admin_message: string | null;
    applicant_message: string | null;
    status: string;
  } | null;
  applicant?: {
    // ✅ Ensure applicant is optional to prevent crashes
    name: string;
    email: string;
    phone: string;
    position: string;
  } | null;
}

const InterviewDetailsDialog = ({
  applicantId,
  isOpen,
  onClose,
  schedule,
  applicant,
}: InterviewDetailsDialogProps) => {
  if (!isOpen || !applicantId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-[#18181a] dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Interview Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-gray-700 dark:text-gray-300">
          {/* ✅ Applicant Info */}
          <div>
            <span className="font-semibold">👤 Applicant Name:</span>{" "}
            {applicant?.name || "N/A"}
          </div>
          <div>
            <span className="font-semibold">📩 Email:</span>{" "}
            {applicant?.email || "N/A"}
          </div>
          <div>
            <span className="font-semibold">📞 Phone:</span>{" "}
            {applicant?.phone || "N/A"}
          </div>
          <div>
            <span className="font-semibold">💼 Position Applied:</span>{" "}
            {applicant?.position || "N/A"}
          </div>

          {/* ✅ Schedule Info */}
          <div>
            <span className="font-semibold">📅 Scheduled Date & Time:</span>{" "}
            {schedule?.interview_date
              ? `${new Date(schedule.interview_date).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }
                )} - ${new Date(schedule.interview_date).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "UTC",
                  }
                )}`
              : "No schedule available"}
          </div>

          <div>
            <span className="font-semibold">📝 Admin Message:</span>{" "}
            {schedule?.admin_message || "No message provided"}
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

export default InterviewDetailsDialog;
