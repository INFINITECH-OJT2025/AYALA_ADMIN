"use client";

import { useEffect, useState } from "react";
import {
  fetchInquiries,
  replyInquiries,
  archiveInquiries,
  unarchiveInquiries,
  deleteInquiries,
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
import { Mail, Archive, Trash, Inbox, User, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const getInquiries = async () => {
      try {
        const data = await fetchInquiries();
        setInquiries(data);
        setFilteredInquiries(data);
      } catch (err) {
        setError("Failed to load inquiries.");
      } finally {
        setLoading(false);
      }
    };

    getInquiries(); // Initial fetch

    const interval = setInterval(getInquiries, 5000); // ✅ Auto-refresh every 5 seconds

    return () => clearInterval(interval); // ✅ Cleanup on unmount
  }, []);

  // ✅ Apply filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredInquiries(inquiries);
    } else if (filter === "archived") {
      setFilteredInquiries(
        inquiries.filter((inq) => inq.status === "archived")
      );
    } else {
      setFilteredInquiries(
        inquiries.filter((inq) => inq.status !== "archived")
      );
    }
  }, [filter, inquiries]);

  // ✅ Handle sending reply
  const handleReply = async () => {
    if (!selectedInquiry) return;

    try {
      await replyInquiries(selectedInquiry.id, replyMessage);

      // ✅ Update the status to "replied"
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id ? { ...i, status: "replied" } : i
        )
      );

      // ✅ Show Sonner toast notification
      toast.success("Reply Sent", {
        description: `Your response has been sent to ${selectedInquiry.email}. The status is now marked as 'Replied'.`,
      });

      setSelectedInquiry(null);
      setReplyMessage("");
    } catch {
      toast.error("Failed to send reply", {
        description: "There was an issue sending the reply. Please try again.",
      });
    }
  };

  // ✅ Handle archiving/unarchiving
  const handleToggleArchive = async (id: number, isArchived: boolean) => {
    try {
      let updatedStatus = isArchived ? "active" : "archived";

      // ✅ Ensure API is correctly updating the inquiry status
      const response = isArchived
        ? await unarchiveInquiries(id)
        : await archiveInquiries(id);

      if (!response) throw new Error("Failed to update inquiry status");

      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: updatedStatus } : i))
      );

      // ✅ Show success toast
      toast.success(
        `Inquiry ${updatedStatus === "archived" ? "Archived" : "Unarchived"}`,
        {
          description: `The inquiry has been ${updatedStatus}.`,
        }
      );
    } catch (error) {
      console.error("Error updating inquiry status:", error);

      toast.error("Failed to update inquiry", {
        description:
          "There was an issue updating the status. Please try again.",
      });
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedInquiryId(id);
    setIsDeleteDialogOpen(true);
  };

  // ✅ Handle deleting an inquiry
  const handleDelete = async () => {
    if (!selectedInquiryId) return;

    try {
      await deleteInquiries(selectedInquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== selectedInquiryId));

      // ✅ Show Sonner toast notification
      toast.success("Inquiry Deleted", {
        description: "The inquiry has been removed successfully.",
      });
    } catch {
      toast.error("Failed to delete inquiry", {
        description:
          "There was an issue deleting the inquiry. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedInquiryId(null);
    }
  };

  const exportToPDF = (inquiries: any[]) => {
    const doc = new jsPDF(); // Portrait mode (default)

    // Add Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("General Inquiries List - Export", 14, 10); // Title
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 160, 10); // Date
      doc.setLineWidth(0.5);
      doc.line(14, 15, 200, 15); // Horizontal line below header
    };

    // Add Footer with page number
    const addFooter = (pageNumber: number) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      ); // Page number
      doc.text("AyalaLand", 160, doc.internal.pageSize.height - 10); // Footer text
    };

    // Define Table Headers
    const tableColumn = [
      "Inquiry Type",
      "Last Name",
      "First Name",
      "Email",
      "Phone",
      "Status",
    ];

    // Map inquiries to table rows
    const tableRows = inquiries.map((inquiry) => [
      inquiry.inquiry_type,
      inquiry.last_name,
      inquiry.first_name,
      inquiry.email,
      inquiry.phone,
      inquiry.status || "N/A", // Set status to "N/A" if not available
    ]);

    // Add Header
    addHeader();

    // Start Table
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("general_inquiries_list.pdf");
  };

  // ✅ Table Columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "numbering",
      header: "No.",
      cell: ({ row }) => {
        return <span>{row.index + 1}</span>;
      },
    },
    { accessorKey: "inquiry_type", header: "Type" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "status", header: "Status" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* Reply Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-24 flex items-center justify-center"
            onClick={() => setSelectedInquiry(row.original)}
          >
            <Mail className="w-4 h-4 text-blue-600" /> Reply
          </Button>

          {/* Archive / Unarchive Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-32 flex items-center justify-center whitespace-nowrap"
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
                <span className="ml-1">Unarchive</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-gray-600" />
                <span className="ml-1">Archive</span>
              </>
            )}
          </Button>

          {/* Delete Button */}
          <Button
            size="sm"
            variant="destructive"
            className="w-24 flex items-center justify-center"
            onClick={() => confirmDelete(row.original.id)}
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        General Inquiries
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

        <Button
          onClick={() => exportToPDF(inquiries)}
          className="ml-auto"
          variant="default"
        >
          <Download />
          Export to PDF
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <p className="text-gray-500 dark:text-gray-300">
            Loading inquiries...
          </p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filteredInquiries} />
        </div>
      )}

      {/* ✅ Reply Dialog */}
      {selectedInquiry && (
        <Dialog
          open={!!selectedInquiry}
          onOpenChange={() => setSelectedInquiry(null)}
        >
          <DialogContent className="max-w-lg md:max-w-2xl">
            {" "}
            {/* Expands dialog for better readability */}
            <DialogHeader>
              <DialogTitle>Reply to Inquiry</DialogTitle>
            </DialogHeader>
            {/* ✅ Display the Client's Message (Handles Long Text) */}
            <div className="bg-gray-200 dark:bg-[#18181a] p-4 rounded-md border border-gray-300 dark:border-gray-700 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />{" "}
                {/* Profile Icon */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  Client Message:
                </h3>
              </div>

              {/* ✅ Message Box - Prevents Layout Breaking */}
              <div className="text-gray-600 dark:text-gray-300 p-2 bg-gray-200 dark:bg-[#18181a] rounded-md border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto">
                {selectedInquiry?.message || "No message provided."}
              </div>
            </div>
            {/* ✅ Reply Section */}
            <div>
              <p className="mb-2">
                Sending reply to <b>{selectedInquiry.email}</b>:
              </p>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="min-h-[120px] bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2" // Adjusts for better typing experience
              />
            </div>
            {/* ✅ Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedInquiry(null)}
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

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this inquiry? This action cannot
              be undone.
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
    </div>
  );
}
