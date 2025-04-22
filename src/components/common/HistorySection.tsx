"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface HistoryItem {
  title: string;
  description: string;
  image: File | null;
  preview: string | null; // ✅ Either new upload preview or existing image URL
}

interface HistorySectionProps {
  history: HistoryItem[];
  setHistory: (newHistory: HistoryItem[]) => void;
}

export default function HistorySection({
  history,
  setHistory,
}: HistorySectionProps) {
  const handleHistoryChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updated = [...history];
    updated[index] = { ...updated[index], [field]: value };
    setHistory(updated);
  };

  const handleHistoryImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = [...history];
      updated[index] = {
        ...updated[index],
        image: file,
        preview: URL.createObjectURL(file), // ✅ New upload preview
      };
      setHistory(updated);
    }
  };

  const addHistoryItem = () => {
    setHistory([
      ...history,
      { title: "", description: "", image: null, preview: null },
    ]);
  };

  const removeHistoryItem = (index: number) => {
    setHistory(history.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">History</h2>
      {history.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg shadow-md relative">
          <Button
            type="button"
            onClick={() => removeHistoryItem(index)}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs"
          >
            Remove
          </Button>

          {/* Title */}
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                value={item.title}
                onChange={(e) =>
                  handleHistoryChange(index, "title", e.target.value)
                }
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>

          {/* Description */}
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                value={item.description}
                onChange={(e) =>
                  handleHistoryChange(index, "description", e.target.value)
                }
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>

          {/* Image Upload with Preview */}
          <FormItem>
            <FormLabel>Image</FormLabel>
            {/* ✅ Show existing image from backend if no new upload */}
            {item.preview ? (
              <img
                src={item.preview}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-lg border"
              />
            ) : (
              item.image &&
              typeof item.image === "string" && (
                <img
                  src={`http://127.0.0.1:8000/storage/${item.image}`}
                  alt="Existing Image"
                  className="mt-2 w-full h-48 object-cover rounded-lg border"
                />
              )
            )}
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleHistoryImageChange(index, e)}
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>
        </div>
      ))}

      <Button
        type="button"
        onClick={addHistoryItem}
        className="px-4 py-2 flex items-center gap-2"
      >
        + Add More History
      </Button>
    </div>
  );
}
