"use client";

import { useEffect, useState } from "react";
import {
  fetchApplicants,
  scheduleApplicant,
  rejectApplicant,
  deleteApplicant,
  updateRescheduleStatus,
} from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Eye, CalendarCheck, X, Trash, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import useFetchSchedule from "@/hooks/useFetchSchedule";
import { Badge } from "../ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function JobApplicants() {
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const { scheduleRequest } = useFetchSchedule(selectedApplicant?.id || null);
  const [actionType, setActionType] = useState(""); // Track action type
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<string>("09:00"); // Default time
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(
    null
  );

  const handleRescheduleApproval = async (status: "approved" | "rejected") => {
    console.log("Current Schedule Request:", scheduleRequest);

    if (!scheduleRequest?.id) {
      console.error("Missing ID in scheduleRequest:", scheduleRequest);
      toast.error("No valid schedule request found.");
      return;
    }

    try {
      setLoading(true);
      setActionType(status);

      await updateRescheduleStatus(scheduleRequest.id, status);

      toast.success(`Schedule request has been ${status}.`);
      setIsScheduleDialogOpen(false);
    } catch (error) {
      toast.error("Error updating status.");
    } finally {
      setLoading(false);
      setActionType("");
    }
  };

  useEffect(() => {
    const getApplicants = async () => {
      try {
        const data = await fetchApplicants();
        setApplicants(data);
      } catch (err) {
        setError("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    getApplicants();
    const interval = setInterval(getApplicants, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScheduleSubmit = async () => {
    setLoading(true);
    if (!selectedApplicant || !scheduleDate || !scheduleTime) return;

    try {
      const validDate = new Date(scheduleDate);
      if (isNaN(validDate.getTime())) {
        console.error("Invalid schedule date");
        return;
      }

      const [hours, minutes] = scheduleTime.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error("Invalid schedule time");
        return;
      }

      validDate.setHours(hours, minutes, 0, 0);

      // ✅ Pass validDate directly if `scheduleApplicant` expects a Date
      await scheduleApplicant(selectedApplicant.id, validDate, message);

      toast.success("Interview Scheduled", {
        description: `An interview has been scheduled for ${
          selectedApplicant.email
        } on ${validDate.toLocaleString()}.`,
      });

      setIsScheduleDialogOpen(false);
      setSelectedApplicant(null);
      setScheduleDate(null);
      setScheduleTime("09:00");
      setMessage("");
    } catch (error) {
      console.error("Scheduling failed:", error);
      toast.error("Failed to schedule interview", {
        description:
          "There was an issue scheduling the interview. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectionSubmit = async () => {
    setLoading(true);
    if (!selectedApplicant) return;

    try {
      await rejectApplicant(selectedApplicant.id, message);
      toast.error("Applicant Rejected", {
        description: `A rejection email has been sent to ${selectedApplicant.email}.`,
      });

      setIsRejectionDialogOpen(false);
      setSelectedApplicant(null);
      setMessage("");
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("Failed to reject applicant", {
        description:
          "There was an issue rejecting the applicant. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedApplicantId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedApplicantId) return;

    try {
      await deleteApplicant(selectedApplicantId);
      setApplicants((prev) => prev.filter((a) => a.id !== selectedApplicantId));

      toast.success("Applicant Deleted", {
        description: "The applicant and their appointment have been removed.",
      });
    } catch (error) {
      console.error("Error deleting applicant:", error);
      toast.error("Failed to delete applicant", {
        description:
          "There was an issue deleting the applicant. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedApplicantId(null);
    }
  };
  const exportToPDF = (applicants: any[]) => {
    const doc = new jsPDF(); // Portrait mode (default)

    // Add Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("Job Applicants List - Export", 14, 10); // Title
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 160, 10); // Date
      doc.setLineWidth(0.5);
      doc.line(14, 15, 200, 15); // Horizontal line below header
    };

    // Add Footer with page number
    // const addFooter = (pageNumber: number) => {
    //   const pageCount = doc.internal.getNumberOfPages();
    //   doc.setFontSize(10);
    //   doc.text(
    //     `Page ${pageNumber} of ${pageCount}`,
    //     14,
    //     doc.internal.pageSize.height - 10
    //   ); // Page number
    //   doc.text(
    //     "AyalaLand",
    //     160,
    //     doc.internal.pageSize.height - 10
    //   ); // Footer text
    // };

    // Define Table Headers
    const tableColumn = [
      "First Name",
      "Last Name",
      "Email",
      "Phone No.",
      "Address",
      "Status",
      "Position",
    ];

    // Map applicants to table rows (horizontal format)
    const tableRows = applicants.map((applicant) => [
      applicant.first_name,
      applicant.last_name,
      applicant.email,
      applicant.phone,
      applicant.address,
      applicant.status,
      applicant.job_title,
    ]);

    // Add Header
    addHeader();

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    // addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("job_applicants_list.pdf");
  };
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "numbering",
    header: "No.",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone No." },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "job_title", header: "Position" },
    {
      accessorKey: "resume_path",
      header: "Resume",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(row.original.resume_path, "_blank")}
        >
          <Eye className="w-4 h-4" /> View Resume
        </Button>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => {
              setSelectedApplicant(row.original);
              setIsScheduleDialogOpen(true);
            }}
            disabled={row.original.status === "rejected"} // Disable if status is 'replied'
          >
            <CalendarCheck className="w-4 h-4" /> Schedule
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedApplicant(row.original);
              setIsRejectionDialogOpen(true);
              setIsScheduleDialogOpen(false); // Ensure the schedule modal doesn't open
            }}
            disabled={row.original.status === "replied"} // Disable if status is 'rejected'
          >
            <X className="w-4 h-4" /> Reject
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedApplicantId(row.original.id);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
          Job Applicants
        </h2>
        <Button onClick={() => exportToPDF(applicants)} variant="default">
          <Download/>
          Export to PDF
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300 text-center">
          Loading applicants...
        </p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={applicants} />
        </div>
      )}

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent className="max-w-lg w-full mx-auto !h-auto">
          <DialogHeader className="text-center">
            <DialogTitle>
              {selectedApplicant?.status === "replied"
                ? "Scheduled Interview Details"
                : "Schedule Interview"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-start">
            Interview for <b>{selectedApplicant?.email || "this applicant"}</b>:
          </p>

          {selectedApplicant?.status === "replied" ? (
            <div className="mt-3">
              <p>
                <b>Scheduled Date:</b>{" "}
                {selectedApplicant?.schedule_date
                  ? new Date(selectedApplicant.schedule_date).toLocaleString(
                      "en-US",
                      {
                        month: "long", // Full month name (e.g., March)
                        day: "numeric", // Day without leading zero (e.g., 28)
                        year: "numeric", // Full year (e.g., 2025)
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true, // Ensures AM/PM format
                      }
                    )
                  : "No schedule available"}
              </p>

              <p className="mt-2">
                <b>Message:</b>{" "}
                {selectedApplicant.message || "No additional details"}
              </p>

              {/* Fetch Scheduled Request Data only if status is "replied" */}
              {scheduleRequest && (
                <div className="bg-gray-200 dark:bg-[#18181a] p-2 rounded-md mt-4">
                  <p>
                    <b>Requested Reschedule Date:</b>{" "}
                    {scheduleRequest?.new_schedule
                      ? new Date(scheduleRequest.new_schedule).toLocaleString(
                          "en-US",
                          {
                            timeZone: "UTC",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : "No reschedule requested"}
                  </p>

                  <p className="mt-2">
                    <b>Applicant's Message:</b>{" "}
                    {scheduleRequest.applicant_message || "No message provided"}
                  </p>
                  {/* Reschedule Status with Badge */}
                  <div className="mt-2 flex items-center">
                    <b className="mr-2">Reschedule Status:</b>
                    <Badge
                      variant={
                        scheduleRequest?.status === "approved"
                          ? "default" // ✅ Green (Default for success)
                          : scheduleRequest?.status === "pending"
                          ? "secondary" // ✅ Yellow (Secondary for warning)
                          : scheduleRequest?.status === "rejected"
                          ? "destructive" // ✅ Red (Destructive for rejection)
                          : "outline" // ✅ Gray (Outline for no status)
                      }
                    >
                      {scheduleRequest?.status || "No status available"}
                    </Badge>
                  </div>

                  {/* ✅ Display Proof File if Provided */}
                  {scheduleRequest.file_path ? (
                    <div className="mt-4">
                      <p>
                        <b>Proof of Request:</b>
                      </p>
                      <a
                        href={scheduleRequest.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Attached File
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500">No proof provided.</p>
                  )}

                  {/* ✅ Buttons for Admin to Approve or Reject Reschedule Request */}
                  {scheduleRequest.status === "pending" && (
                    <div className="flex justify-end space-x-3 mt-4">
                      <Button
                        variant="success"
                        onClick={() => handleRescheduleApproval("approved")}
                        disabled={loading} // ✅ Disable while processing
                      >
                        {loading && actionType === "approve"
                          ? "Approving..."
                          : "Approve"}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleRescheduleApproval("rejected")}
                        disabled={loading} // ✅ Disable while processing
                      >
                        {loading && actionType === "reject"
                          ? "Rejecting..."
                          : "Reject"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full flex justify-center">
                  <div className="min-h-[320px] max-h-[320px] flex items-center">
                    <Calendar
                      selected={scheduleDate || undefined}
                      onSelect={(date: Date | undefined) =>
                        setScheduleDate(date || null)
                      }
                      mode="single"
                      required
                      disabled={
                        (date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) || // Disable past dates
                          date.getDay() === 0 || // Disable Sundays
                          date.getDay() === 6 // Disable Saturdays
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <p className="text-start">Select Time:</p>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="time"
                    className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={scheduleTime}
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      if (selectedTime >= "08:00" && selectedTime <= "17:00") {
                        setScheduleTime(selectedTime);
                      } else {
                        setScheduleTime(""); // Reset input if invalid
                        toast.error(
                          "Please select a time between 08:00 AM and 05:00 PM."
                        );
                      }
                    }}
                    min="08:00"
                    max="17:00"
                    required
                  />
                </div>
              </div>

              <div>
                <p className="text-start">Additional Details:</p>
                <Textarea
                  className="w-full min-h-[100px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter any additional details..."
                />
              </div>
            </>
          )}

          <DialogFooter className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
            >
              Close
            </Button>
            {selectedApplicant?.status !== "replied" && (
              <Button
                onClick={handleScheduleSubmit}
                variant="success"
                disabled={!scheduleDate || loading} // Disable button while loading
              >
                {loading ? "Scheduling..." : "Schedule Interview"}{" "}
                {/* Show loading text */}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRejectionDialogOpen}
        onOpenChange={setIsRejectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Applicant</DialogTitle>
          </DialogHeader>

          {selectedApplicant?.status === "rejected" ? (
            // ✅ Show this message if the applicant is already rejected
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-md">
              <p>
                <b>This applicant is already rejected.</b>
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                Enter a rejection message for <b>{selectedApplicant?.email}</b>:
              </p>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectionDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleRejectionSubmit}
              variant="destructive"
              disabled={loading || selectedApplicant?.status === "rejected"} // ✅ Disable if rejected
            >
              {loading ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md w-full bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this applicant? This action cannot
            be undone.
          </p>
          <DialogFooter className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
