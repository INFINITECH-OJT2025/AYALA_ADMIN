"use client";

import { useEffect, useState } from "react";
import {
  fetchAppointments,
  replyAppointment,
  deleteAppointment,
  archiveAppointment,
  unarchiveAppointment,
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
import {
  Mail,
  Archive,
  Trash,
  Inbox,
  User,
  ImageIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const getAppointments = async () => {
      try {
        const data = await fetchAppointments();
        setAppointments(data);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    getAppointments(); // Initial fetch

    const interval = setInterval(getAppointments, 5000); // ✅ Auto-refresh every 5 seconds

    return () => clearInterval(interval); // ✅ Cleanup on unmount
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredAppointments(appointments);
    } else if (filter === "archived") {
      setFilteredAppointments(
        appointments.filter((inq) => inq.status === "archived")
      );
    } else {
      setFilteredAppointments(
        appointments.filter((inq) => inq.status !== "archived")
      );
    }
  }, [filter, appointments]);

  const handleReply = async () => {
    setLoading(true);
    if (!selectedAppointment) return;
    try {
      await replyAppointment(selectedAppointment.id, replyMessage);

      // ✅ Update the status to "replied"
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id
            ? { ...appt, status: "replied" }
            : appt
        )
      );

      // ✅ Show Sonner toast
      toast.success("Reply Sent", {
        description: `Your response has been sent to ${selectedAppointment.email}.`,
      });

      setSelectedAppointment(null);
      setReplyMessage("");
    } catch {
      toast.error("Failed to send reply", {
        description: "There was an issue sending the reply.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (id: number, isArchived: boolean) => {
    try {
      if (isArchived) {
        await unarchiveAppointment(id);
        setAppointments((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "active" } : i))
        );

        // ✅ Show Sonner toast
        toast.success("Appointment Unarchived", {
          description: "The appointment has been restored to active.",
        });
      } else {
        await archiveAppointment(id);
        setAppointments((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "archived" } : i))
        );

        // ✅ Show Sonner toast
        toast.info("Appointment Archived", {
          description: "The appointment has been moved to archived.",
        });
      }
    } catch {
      toast.error("Failed to update appointment", {
        description: "There was an issue updating the status.",
      });
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedAppointmentId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAppointmentId) return;

    try {
      await deleteAppointment(selectedAppointmentId);
      setAppointments((prev) =>
        prev.filter((appt) => appt.id !== selectedAppointmentId)
      );

      // ✅ Show Sonner toast
      toast.success("Appointment Deleted", {
        description: "The appointment has been removed successfully.",
      });
    } catch {
      toast.error("Failed to delete appointment", {
        description: "There was an issue deleting the appointment.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAppointmentId(null);
    }
  };

  const exportToPDF = (appointments: any[]) => {
    const doc = new jsPDF(); // Portrait mode (default)

    // Add Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("Property Appointments List - Export", 14, 10); // Title
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
    //   doc.text("AyalaLand", 160, doc.internal.pageSize.height - 10); // Footer text
    // };

    // Define Table Headers
    const tableColumn = [
      "Property Name",
      "Last Name",
      "First Name",
      "Email",
      "Phone",
      "Status",
    ];

    // Map property appointments to table rows (horizontal format)
    const tableRows = appointments.map((appointment) => [
      appointment.property.property_name, // Accessing property name correctly
      appointment.last_name,
      appointment.first_name,
      appointment.email,
      appointment.phone,
      appointment.status,
    ]);

    // Add Header
    addHeader();

    // Start Table
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    // addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("property_appointments_list.pdf");
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "numbering",
      header: "No.",
      cell: ({ row }) => {
        return <span>{row.index + 1}</span>;
      },
    },
    { accessorKey: "property.property_name", header: "Property Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div className="w-24">{row.original.status}</div>,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedAppointment(row.original)}
          >
            <Mail className="w-4 h-4 text-blue-600" /> Reply
          </Button>

          {/* ✅ Fixed Width for Archive/Unarchive Button ONLY */}
          <div className="w-32">
            <Button
              size="sm"
              variant="outline"
              className="w-full flex items-center justify-center whitespace-nowrap"
              onClick={() =>
                handleToggleArchive(
                  row.original.id,
                  row.original.status === "archived"
                )
              }
            >
              {row.original.status === "archived" ? (
                <>
                  <Inbox className="w-4 h-4 text-green-600" />
                  <span>Unarchive</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 text-gray-600" />
                  <span>Archive</span>
                </>
              )}
            </Button>
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => confirmDelete(row.original.id)}
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        Property Appointments
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            onClick={() => setFilter("archived")}
          >
            Archived
          </Button>
        </div>

        {/* Export to PDF button aligned to the far right */}
        <Button
          onClick={() => exportToPDF(appointments)}
          variant="default"
          className="ml-auto"
        >
          <Download />
          Export to PDF
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <p className="text-gray-500 dark:text-gray-300">
            Loading appointments...
          </p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filteredAppointments} />
        </div>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this appointment? This action
              cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
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

      {/* Reply Dialog */}
      {selectedAppointment && (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Appointment</DialogTitle>
            </DialogHeader>

            {/* Property Details */}
            <div className="mb-2 p-3 border rounded bg-gray-200 dark:bg-[#18181a]">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                Property Details:
              </h3>

              {selectedAppointment.property?.property_image ? (
                (() => {
                  // Ensure property_image is an array (if it's a string, split it)
                  const images = Array.isArray(
                    selectedAppointment.property.property_image
                  )
                    ? selectedAppointment.property.property_image
                    : selectedAppointment.property.property_image.split(",");

                  return (
                    <img
                      src={images[0]} // ✅ Display only the first image
                      alt="Property"
                      className="w-full h-40 object-cover rounded-md mt-2"
                    />
                  );
                })()
              ) : (
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  No image available
                </p>
              )}

              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <b>Property Name: </b>
                {selectedAppointment.property?.property_name ||
                  "Unknown Property"}
              </p>

              {/* ✅ Display Date & Time of Appointment */}
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <b>Appointment Date:</b>{" "}
                {selectedAppointment.date
                  ? new Date(selectedAppointment.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "Not specified"}
              </p>

              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <b>Time:</b>{" "}
                {selectedAppointment.time
                  ? new Date(
                      `1970-01-01T${selectedAppointment.time}`
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not specified"}
              </p>
            </div>

            {/* Client Message */}
            <div className="mb-2 p-3 border rounded bg-gray-200 dark:bg-[#18181a]">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                Client Message:
              </h3>
              <p className="text-gray-800 dark:text-gray-300 mt-2">
                {selectedAppointment.message || "No message provided."}
              </p>
            </div>

            {/* Reply Form */}
            <div>
              <p className="mb-2">
                Sending reply to <b>{selectedAppointment.email}</b>:
              </p>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                variant="success"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
