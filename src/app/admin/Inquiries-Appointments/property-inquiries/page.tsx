"use client";

import { useEffect, useState } from "react";
import {
  fetchPropertyInquiries,
  replyInquiry,
  archiveInquiry,
  unarchiveInquiry,
  deleteInquiry,
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
  User,
  Undo,
  ImageIcon,
  Inbox,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPropertyInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const getInquiries = async () => {
      try {
        const data = await fetchPropertyInquiries();
        setInquiries(data);
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

  const filteredInquiries = inquiries.filter((inquiry) =>
    filterStatus === "all" ? true : inquiry.status === filterStatus
  );

  // ✅ Handle archiving an inquiry
  const handleArchive = async (id: number) => {
    try {
      await archiveInquiry(id);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "archived" } : i))
      );

      // ✅ Show Sonner toast
      toast.info("Inquiry Archived", {
        description: "The inquiry has been moved to archived.",
      });
    } catch {
      toast.error("Failed to archive inquiry", {
        description: "There was an issue archiving the inquiry.",
      });
    }
  };

  // ✅ Handle unarchiving an inquiry
  const handleUnarchive = async (id: number) => {
    try {
      await unarchiveInquiry(id);
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "active" } : i))
      );

      // ✅ Show Sonner toast
      toast.success("Inquiry Unarchived", {
        description: "The inquiry has been restored to active.",
      });
    } catch {
      toast.error("Failed to unarchive inquiry", {
        description: "There was an issue unarchiving the inquiry.",
      });
    }
  };

  // ✅ Handle replying to an inquiry
  const handleReply = async () => {
    setLoading(true);
    if (!selectedInquiry) return;
    try {
      await replyInquiry(selectedInquiry.id, replyMessage);

      // ✅ Update the status to "replied"
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id ? { ...i, status: "replied" } : i
        )
      );

      // ✅ Show Sonner toast
      toast.success("Reply Sent", {
        description: `Your response has been sent to ${selectedInquiry.email}.`,
      });

      setSelectedInquiry(null);
      setReplyMessage("");
    } catch {
      toast.error("Failed to send reply", {
        description: "There was an issue sending the reply.",
      });
    } finally {
      setLoading(false);
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
      await deleteInquiry(selectedInquiryId);
      setInquiries((prev) => prev.filter((i) => i.id !== selectedInquiryId));

      // ✅ Show Sonner toast
      toast.success("Inquiry Deleted", {
        description: "The inquiry has been removed successfully.",
      });
    } catch {
      toast.error("Failed to delete inquiry", {
        description: "There was an issue deleting the inquiry.",
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
      doc.text("Property Inquiries List - Export", 14, 10); // Title
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
      "Property Name",
      "Last Name",
      "First Name",
      "Email",
      "Phone",
      "Status",
    ];

    // Map property inquiries to table rows (horizontal format)
    const tableRows = inquiries.map((inquiry) => [
      inquiry.property.property_name, // Accessing property name correctly
      inquiry.last_name,
      inquiry.first_name,
      inquiry.email,
      inquiry.phone,
      inquiry.status,
    ]);

    // Add Header
    addHeader();

    // Start Table

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("property_inquiries_list.pdf");
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
    { accessorKey: "status", header: "Status" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedInquiry(row.original)}
          >
            <Mail className="w-4 h-4 text-blue-600" /> Reply
          </Button>

          {row.original.status === "archived" ? (
            <Button
              size="sm"
              variant="outline"
              className="w-24 justify-center" // Fixed width
              onClick={() => handleUnarchive(row.original.id)}
            >
              <Inbox className="w-4 h-4 text-green-600" /> Unarchive
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-24 justify-center" // Fixed width
              onClick={() => handleArchive(row.original.id)}
            >
              <Archive className="w-4 h-4 text-gray-600" /> Archive
            </Button>
          )}

          <Button
            size="sm"
            variant="destructive"
            className="w-24 justify-center" // Fixed width for consistency
            onClick={() => confirmDelete(row.original.id)}
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className=" p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        Property Inquiries
      </h2>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "archived" ? "default" : "outline"}
            onClick={() => setFilterStatus("archived")}
          >
            Archived
          </Button>
        </div>

        {/* Export to PDF button aligned to the far right */}
        <div className="ml-auto">
          <Button onClick={() => exportToPDF(inquiries)} variant="default">
            <Download />
            Export to PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...Array(6)].map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-white dark:bg-[#18181a]">
                  {[...Array(6)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filteredInquiries} />
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

      {/* Reply Dialog */}
      {selectedInquiry && (
        <Dialog
          open={!!selectedInquiry}
          onOpenChange={() => setSelectedInquiry(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Inquiry</DialogTitle>
            </DialogHeader>

            <div className="mb-2 p-3 border rounded bg-gray-200 dark:bg-[#18181a]">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                Property Details:
              </h3>

              {selectedInquiry.property?.property_image ? (
                (() => {
                  // Ensure property_image is an array (if it's a string, split it)
                  const images = Array.isArray(
                    selectedInquiry.property.property_image
                  )
                    ? selectedInquiry.property.property_image
                    : selectedInquiry.property.property_image.split(",");

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
                {selectedInquiry.property?.property_name || "Unknown Property"}
              </p>
            </div>

            <div className="mb-2 p-3 border rounded bg-gray-200 dark:bg-[#18181a]">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                Client Message:
              </h3>
              <p className="text-gray-800 dark:text-gray-300 mt-2">
                {selectedInquiry.message}
              </p>
            </div>

            <div>
              <p className="mb-2">
                Sending reply to <b>{selectedInquiry.email}</b>:
              </p>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
              />
            </div>
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
    </div>
  );
}
