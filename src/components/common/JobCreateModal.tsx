"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { createJob } from "@/lib/api";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

interface JobCreateModalProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JobCreateModal({
  open,
  onOpenChange,
}: JobCreateModalProps) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    type: "Full-time",
    category: "",
    salary: "",
    deadline: "",
    description: "",
    slots: "",
    qualification: "", // New field
    seniority_level: "", // New field
    job_function: "", // New field
  });

  const [categories, setCategories] = useState([
    "Real Estate Agent",
    "Property Manager",
    "Mortgage Broker",
    "Real Estate Developer",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectChange = (name: string, value: string) =>
    setForm({ ...form, [name]: value });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setForm({ ...form, category: newCategory });
      setNewCategory("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);

    try {
      const response = await createJob(formData);
      if (response.success) {
        toast.success("Job Created", {
          description: "The job listing has been successfully created.",
        });

        setForm({
          title: "",
          location: "",
          type: "Full-time",
          category: "",
          salary: "",
          deadline: "",
          description: "",
          slots: "",
          qualification: "", // New field
          seniority_level: "", // New field
          job_function: "",
        });
        setImage(null);
        setImagePreview(null);
      }
    } catch (error: any) {
      try {
        const errorData = await error.response.json();
        if (
          errorData.message ===
          "A job with this title and location already exists."
        ) {
          toast.error("Duplicate Job", {
            description: "This job already exists. Please modify the details.",
          });
        } else {
          toast.error("Job Creation Failed", {
            description:
              "There was an issue creating the job. Please try again.",
          });
        }
      } catch {
        toast.error("Job Creation Failed", {
          description: "This job already exists. Please modify",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] bg-white dark:bg-[#18181a]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            <Input
              name="seniority_level"
              placeholder="Seniority Level"
              value={form.seniority_level}
              onChange={handleChange}
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />

            <Input
              name="title"
              placeholder="Job Title"
              value={form.title}
              onChange={handleChange}
              required
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              name="slots"
              placeholder="Available Slots"
              type="number"
              min="1"
              value={form.slots}
              onChange={handleChange}
              required
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />

            <Select
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="Add New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
              />
              <Button type="button" onClick={handleNewCategory}>
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              name="salary"
              placeholder="Starting Salary"
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
              value={
                form.salary
                  ? new Intl.NumberFormat("en-US").format(
                      Number(form.salary.replace(/,/g, ""))
                    )
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, "");
                if (!isNaN(Number(raw))) {
                  setForm({ ...form, salary: raw });
                }
              }}
            />

            <Input
              name="deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.deadline}
              onChange={handleChange}
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />

            <Input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />
          </div>

          <Textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
          />

          {/* New Fields */}
          <Textarea
            name="qualification"
            placeholder="Qualifications"
            value={form.qualification}
            onChange={handleChange}
            className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
          />

          <Textarea
            name="job_function"
            placeholder="Job Function"
            value={form.job_function}
            onChange={handleChange}
            className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Image</label>
            {imagePreview && (
              <div className="relative w-28 h-28">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-white rounded-full p-1"
                >
                  <XCircle className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}
            <Input
              type="file"
              onChange={handleImageChange}
              className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
            />
          </div>

          <Button
            variant="success"
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
