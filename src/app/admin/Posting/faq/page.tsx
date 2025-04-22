"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/lib/api";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";

type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchFaqs = async () => {
    try {
      const data = await getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to fetch FAQs");
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async () => {
    if (!form.question || !form.answer) return;

    try {
      if (editId) {
        await updateFaq(editId, form);
        toast.success("FAQ updated successfully"); // Success message
      } else {
        await createFaq(form);
        toast.success("FAQ added successfully"); // Success message
      }
      setForm({ question: "", answer: "" });
      setEditId(null);
      fetchFaqs(); // Refresh the list after adding or updating FAQ
    } catch (error) {
      console.error("Error submitting FAQ:", error);
      toast.error("Failed to submit FAQ"); // Error message
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFaq(id);
      toast.success("FAQ deleted successfully"); // Success message
      fetchFaqs(); // Refresh the list after deleting FAQ
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ"); // Error message
    }
  };

  const handleEdit = (faq: FAQ) => {
    setForm({ question: faq.question, answer: faq.answer });
    setEditId(faq.id);
  };

  return (
    <div className="w-full p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Admin FAQ Page
      </h1>

      <div className="space-y-2">
        <Input
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        />
        <Textarea
          placeholder="Answer"
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          className="bg-gray-100 dark:bg-[#27272a] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} variant="success">
            {editId ? "Update FAQ" : "Add FAQ"}
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          FAQ List
        </h2>
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border rounded-lg p-4 mb-2 bg-white dark:bg-[#27272a] border-gray-300 dark:border-gray-600"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {faq.question}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {faq.answer}
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(faq)}
              >
                <Edit className="w-4 h-4 text-blue-600" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(faq.id)}
              >
                <Trash className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
