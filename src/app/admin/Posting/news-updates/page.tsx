"use client";

import { useEffect, useState } from "react";
import { fetchNews, createNews, updateNews, deleteNews } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Trash,
  Plus,
  Upload,
  Star,
  Circle,
  StarOff,
  Download,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function AdminNews() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);

  // ✅ Form state (Ensure `is_featured` & `status` are set correctly)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    is_featured: false,
    status: "draft", // ✅ Default status to prevent validation errors
    image: null as File | null,
  });

  useEffect(() => {
    const getNews = async () => {
      try {
        const data = await fetchNews();
        setNews(data);
      } catch (err) {
        setError("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      is_featured: false,
      status: "draft",
      image: null,
    });
    setSelectedNews(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("content", formData.content);
      form.append("category", formData.category);
      form.append("is_featured", formData.is_featured ? "1" : "0");
      form.append("status", formData.status);

      if (formData.image) {
        form.append("image", formData.image);
      }

      if (selectedNews) {
        await updateNews(selectedNews.id, form);
        toast.success("News Updated", {
          description: "The news post has been updated successfully.",
        });
      } else {
        await createNews(form);
        toast.success("News Created", {
          description: "A new news post has been added successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      const updatedNews = await fetchNews();
      setNews(updatedNews);
    } catch (error) {
      toast.error("Failed to save news", {
        description: "An error occurred while saving the news post.",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedNewsId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedNewsId) return;

    try {
      await deleteNews(selectedNewsId);
      setNews((prev) => prev.filter((n) => n.id !== selectedNewsId));

      toast.success("News Deleted", {
        description: "The news post has been removed successfully.",
      });
    } catch {
      toast.error("Failed to delete news", {
        description: "There was an issue deleting the news post.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedNewsId(null);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData({ ...formData, image: event.target.files[0] });
    }
  };

  const exportToPDF = (news: any[]) => {
    const doc = new jsPDF(); // Portrait mode (default)

    // Add Header
    const addHeader = () => {
      doc.setFontSize(12);
      doc.text("News Posts List - Export", 14, 10); // Title
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
    const tableColumn = ["Title", "Category", "Featured", "Status"];

    // Map news posts to table rows (with featured handling)
    const tableRows = news.map((post) => [
      post.title,
      post.category,
      post.is_featured ? "YES" : "NO", // Display star if featured, otherwise faded star
      post.status || "N/A", // Set status to "N/A" if not available
    ]);

    // Add Header
    addHeader();

    // Start Table
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });

    // Add Footer with page number
    addFooter(doc.internal.getNumberOfPages());

    // Save PDF
    doc.save("news_posts_list.pdf");
  };

  const columns = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }: { row: any }) =>
        row.original.is_featured ? (
          <Star className="text-yellow-500 w-5 h-5" /> // ⭐ Star icon for featured
        ) : (
          <StarOff className="text-gray-400 w-5 h-5" /> // ❌ Faded star for not featured
        ),
    },

    { accessorKey: "status", header: "Status" },
    {
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedNews(row.original);
              setFormData({
                title: row.original.title,
                content: row.original.content,
                category: row.original.category,
                is_featured: !!Number(row.original.is_featured), // ✅ Convert "1"/"0" or boolean properly
                status: row.original.status,
                image: null,
              });
              setIsDialogOpen(true);
            }}
          >
            <Edit className="w-4 h-4 text-blue-600" /> Edit
          </Button>

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
      <h2 className="text-2xl font-bold mb-4">Manage News Posts</h2>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="bg-white dark:bg-[#18181a]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>
              Are you sure you want to delete this news post? This action cannot
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

      <div className="flex justify-between">
        <Button
          className="mb-4"
          variant="success"
          onClick={() => {
            setSelectedNews(null);
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add News
        </Button>

        <Button onClick={() => exportToPDF(news)} variant="default">
          <Download />
          Export to PDF
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <DataTable columns={columns} data={news} />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white dark:bg-[#18181a] text-black dark:text-white rounded-lg p-6">
            <DialogHeader>
              <DialogTitle>
                {selectedNews ? "Edit News Post" : "Create News Post"}
              </DialogTitle>
            </DialogHeader>

            {/* Title */}
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />

            {/* Category Dropdown */}
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#222222] text-black dark:text-white">
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Announcements">Announcements</SelectItem>
              </SelectContent>
            </Select>

            {/* Content */}
            <Textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />

            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
              <label className="text-gray-700 dark:text-gray-300">
                Feature this post
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 flex items-center">
                <Upload className="w-5 h-5 mr-2" /> Upload Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} variant="success" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
