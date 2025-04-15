"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getTestimonials,
  updateTestimonialStatus,
  deleteTestimonial,
} from "@/lib/api";
import TestimonialDetailsModal from "@/components/common/TestimonialDetailsModal";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Eye, Trash } from "lucide-react";

// Defining the Testimonial type inline
type Testimonial = {
  id: number;
  name: string;
  status: string; // Keep as string for display purposes
  rating: number;
  experience: string;
  photo: string | null;
  media: string[];
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for the delete dialog
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null); // Store the id of the testimonial to delete

  // Fetching the testimonials data from the API
  const fetchData = async () => {
    try {
      const data = await getTestimonials();
      console.log("Fetched testimonials: ", data); // Log the data to check the status
      setTestimonials(data);
    } catch (err) {
      toast.error("Failed to load testimonials");
    }
  };

  // UseEffect to fetch data once on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle the status toggle (Publish/Unpublish)
  const handlePublishToggle = async (id: number, currentStatus: string) => {
    const newStatus =
      currentStatus === "published" ? "unpublished" : "published"; // Use strings for API
    try {
      await updateTestimonialStatus(id, newStatus); // Pass the string status
      toast.success(`Testimonial ${newStatus} successfully`);
      fetchData(); // Refetch the data after update
    } catch (err) {
      toast.error("Failed to update testimonial status");
    }
  };

  // Handle opening delete dialog
  const openDeleteDialog = (id: number) => {
    setTestimonialToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle deleting a testimonial
  const handleDelete = async () => {
    if (testimonialToDelete === null) return;
    try {
      await deleteTestimonial(testimonialToDelete);
      toast.success("Deleted successfully");
      fetchData(); // Refetch the data after deletion
      setIsDeleteDialogOpen(false); // Close the modal after successful deletion
    } catch (err) {
      toast.error("Failed to delete testimonial");
    }
  };

  return (
<div className="p-6 w-full">
  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
    Client Testimonials
  </h2>
  <div className="overflow-x-auto border rounded-lg">
    <table className="min-w-full text-sm text-gray-900 dark:text-gray-100">
      <thead className=" text-gray-800 dark:text-gray-100">
        <tr>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-center">Rating</th>
          <th className="p-2 text-center">Status</th>
          <th className="p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {testimonials.map((item) => (
          <tr key={item.id} className="border-t">
            <td className="p-2">{item.name}</td>
            <td className="p-2 text-center">{item.rating} ★</td>
            <td className="p-2 text-center">
              {item.status === "published" ? "Published" : "Unpublished"}
            </td>
            <td className="p-2 flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setSelected(item)}
              >
                <Eye />
              </Button>
              <Button
                variant={item.status === "published" ? "secondary" : "default"}
                onClick={() => handlePublishToggle(item.id, item.status)}
              >
                {item.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => openDeleteDialog(item.id)}
              >
                <Trash className="w-4 h-4" /> Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this testimonial? This action
              cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)} // Close the modal on cancel
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pass selected testimonial data to the modal component */}
      {selected && (
        <TestimonialDetailsModal
          open={!!selected}
          onClose={() => setSelected(null)} // Close modal on close button
          testimonial={selected}
        />
      )}
    </div>
  );
}
