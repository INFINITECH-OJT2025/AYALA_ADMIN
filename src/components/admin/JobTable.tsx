"use client";

import { useEffect, useState } from "react";
import { fetchJobs, deleteJob, updateJob } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calendar,
  Download,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  PlusIcon,
  Tag,
  Trash,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JobCreateModal from "../common/JobCreateModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function JobTable() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editJob, setEditJob] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch Jobs
  useEffect(() => {
    const getJobs = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data);
      } catch (err) {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    getJobs(); // Initial fetch

    const interval = setInterval(getJobs, 5000); // ✅ Fetch new data every 5 seconds

    return () => clearInterval(interval); // ✅ Cleanup on unmount
  }, []);

  const confirmDelete = (id: number) => {
    setSelectedJobId(id);
    setIsDeleteDialogOpen(true);
  };

  // Delete Job
  const handleDelete = async () => {
    if (!selectedJobId) return;

    try {
      await deleteJob(selectedJobId);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== selectedJobId));

      // ✅ Show Sonner toast
      toast.success("Job Deleted", {
        description: "The job listing has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting job:", error);

      // ✅ Show error toast
      toast.error("Failed to delete job", {
        description: "There was an issue deleting the job. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedJobId(null);
    }
  };

  // Open Edit Modal
  const handleEdit = (job: any) => {
    setEditJob(job);
    setEditForm({ ...job });
  };

  // Handle Edit Form Change
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle Job Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJob) return;

    try {
      await updateJob(editJob.id, editForm);
      setJobs(
        jobs.map((job) =>
          job.id === editJob.id ? { ...job, ...editForm } : job
        )
      );
      setEditJob(null);

      // ✅ Show Sonner toast notification
      toast.success("Job Updated", {
        description: `The job "${editForm.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating job:", error);

      // ✅ Show Sonner error toast
      toast.error("Failed to update job", {
        description: "There was an issue updating the job. Please try again.",
      });
    }
  };

  const exportToPDF = (jobs: any[]) => {
    const doc = new jsPDF(); // Portrait mode (default)

    // Add Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("Job Listings - Export", 14, 10); // Title
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
      "Title",
      "Location",
      "Type",
      "Slots",
      "Deadline",
      "Category",
    ];

    // Map job listings to table rows
    const tableRows = jobs.map((job) => [
      job.title,
      job.location,
      job.type,
      job.slots,
      job.deadline
        ? new Date(job.deadline).toLocaleDateString()
        : "No deadline",
      job.category,
    ]);

    // Add Header
    addHeader();

    // Start Table
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    // addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("job_listings.pdf");
  };

  // Table Columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "numbering",
      header: "No.",
      cell: ({ row }) => {
        // Use row.index to directly number from 1 upwards
        return <span>{row.index + 1}</span>;
      },
    },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "slots", header: "Slots" },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const rawDate = row.original.deadline;
        if (!rawDate) return "No deadline"; // ✅ Handle missing deadline

        const deadlineDate = new Date(rawDate);

        // Set expiration to next day at 12:00 AM
        const expirationDate = new Date(deadlineDate);
        expirationDate.setDate(expirationDate.getDate() + 1);
        expirationDate.setHours(0, 0, 0, 0); // ✅ Expire at midnight the next day

        const now = new Date();

        const isExpired = now >= expirationDate;

        return (
          <Tooltip>
            <TooltipTrigger>
              <span className={isExpired ? "text-red-600 font-semibold" : ""}>
                {format(deadlineDate, "MMMM d, yyyy")}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>
                {isExpired
                  ? "This job listing has expired."
                  : `Expires on ${format(
                      expirationDate,
                      "MMMM d, yyyy"
                    )} at 12:00 AM`}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    { accessorKey: "category", header: "Category" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => confirmDelete(row.original.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this job? This action cannot be
              undone.
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

      <JobCreateModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        Job Listings
      </h2>

      <Tabs defaultValue="list">
        <div className="flex justify-between items-center mb-2">
          {/* Left corner: Create Job button */}
          <Button onClick={() => setIsModalOpen(true)} variant="success">
            <PlusIcon />
            Create Job
          </Button>

          {/* Right corner: Export to PDF button */}
          <Button
            onClick={() => exportToPDF(jobs)}
            className="ml-auto"
            variant="default"
          >
            <Download />
            Export to PDF
          </Button>
        </div>
        <TabsList>
          <TabsTrigger value="list">
            {" "}
            <List className="w-5 h-5" />{" "}
          </TabsTrigger>
          <TabsTrigger value="grid">
            {" "}
            <LayoutGrid className="w-5 h-5" />{" "}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {loading ? (
            <div className="flex justify-center items-center">
              <p className="text-gray-500 dark:text-gray-300">
                Loading jobs...
              </p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={jobs} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="grid">
          {loading ? (
            <div className="flex justify-center items-center">
              <p className="text-gray-500 dark:text-gray-300">
                Loading jobs...
              </p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.map((job, index) => {
                const deadlineDate = job.deadline
                  ? new Date(job.deadline)
                  : null;
                const expirationDate = deadlineDate
                  ? new Date(
                      deadlineDate.getFullYear(),
                      deadlineDate.getMonth(),
                      deadlineDate.getDate() + 1
                    )
                  : null;
                const isExpired = expirationDate
                  ? new Date() >= expirationDate
                  : false;

                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-muted border border-border rounded-xl shadow-sm p-4 flex flex-col justify-between"
                  >
                    {/* Job Info */}
                    <div className="space-y-2 mb-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        {index + 1}. {job.title}
                      </h2>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{job.slots} slot(s)</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {job.deadline ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={
                                  isExpired ? "text-red-600 font-semibold" : ""
                                }
                              >
                                {format(new Date(job.deadline), "MMMM d, yyyy")}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>
                                {isExpired
                                  ? "This job listing has expired."
                                  : `Expires on ${format(
                                      expirationDate!,
                                      "MMMM d, yyyy"
                                    )} at 12:00 AM`}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span>No deadline</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>{job.category}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(job)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete(job.id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Job Modal */}
      {editJob && (
        <Dialog open={!!editJob} onOpenChange={() => setEditJob(null)}>
          <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] bg-white dark:bg-[#18181a]">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-2" method="POST">
              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Title
                  </label>
                  <Input
                    name="title"
                    value={editForm.title || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Seniority Level */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Seniority Level
                  </label>
                  <Input
                    name="seniority_level"
                    value={editForm.seniority_level || ""}
                    onChange={handleEditChange}
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Location */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={editForm.location || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Type
                  </label>
                  <Input
                    name="type"
                    value={editForm.type || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Job Slots */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Slots
                  </label>
                  <Input
                    name="slots"
                    type="number"
                    min="1"
                    value={editForm.slots || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Category
                  </label>
                  <Input
                    name="category"
                    value={editForm.category || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Salary
                  </label>
                  <Input
                    name="salary"
                    value={editForm.salary || ""}
                    onChange={handleEditChange}
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Application Deadline
                  </label>
                  <Input
                    name="deadline"
                    type="date"
                    min={new Date().toISOString().split("T")[0]} // ✅ disables past dates
                    value={editForm.deadline || ""}
                    onChange={handleEditChange}
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>
              </div>

              {/* Full-Width Fields */}
              <div className="space-y-4">
                {/* Job Description */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Description
                  </label>
                  <Textarea
                    name="description"
                    value={editForm.description || ""}
                    onChange={handleEditChange}
                    required
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Job Qualification */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Qualification
                  </label>
                  <Textarea
                    name="qualification"
                    value={editForm.qualification || ""}
                    onChange={handleEditChange}
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Function
                  </label>
                  <Textarea
                    name="job_function"
                    value={editForm.job_function || ""}
                    onChange={handleEditChange}
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold dark:text-gray-100 text-gray-700">
                    Job Image
                  </label>

                  {/* Show the existing image or the newly selected preview */}
                  {editForm.image_url && !editForm.imagePreview && (
                    <img
                      src={editForm.image_url}
                      alt="Current Image"
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                  )}

                  {editForm.imagePreview && (
                    <img
                      src={editForm.imagePreview}
                      alt="New Image Preview"
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                  )}

                  <Input
                    type="file"
                    className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditForm({
                          ...editForm,
                          image: file, // Store the file for submission
                          imagePreview: URL.createObjectURL(file), // Show the new preview
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditJob(null)}
                >
                  Cancel
                </Button>
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
