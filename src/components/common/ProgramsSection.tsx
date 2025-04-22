"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface ProgramItem {
  title: string;
  description: string;
  link: string;
}

interface ProgramsSectionProps {
  programs: ProgramItem[];
  setPrograms: Dispatch<SetStateAction<ProgramItem[]>>;
}

export default function ProgramsSection({
  programs,
  setPrograms,
}: ProgramsSectionProps) {
  // ✅ Load initial data from localStorage once
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (programs.length === 0) {
      const storedPrograms = localStorage.getItem("programs");
      if (storedPrograms) {
        setPrograms(JSON.parse(storedPrograms));
      }
    }
  }, []);

  useEffect(() => {
    if (programs.length > 0) {
      localStorage.setItem("programs", JSON.stringify(programs));
    }
  }, [programs]);

  const handleProgramChange = (
    index: number,
    field: keyof ProgramItem,
    value: string
  ) => {
    const updated = [...programs];
    updated[index] = { ...updated[index], [field]: value };
    setPrograms(updated);
  };

  const addProgram = () => {
    const newPrograms = [...programs, { title: "", description: "", link: "" }];
    setPrograms(newPrograms);
  };

  const removeProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Programs</h2>
      {programs.map((program, index) => (
        <div key={index} className="border p-4 rounded-lg shadow-md relative">
          <Button
            type="button"
            onClick={() => removeProgram(index)}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs"
          >
            Remove
          </Button>

          {/* Program Title */}
          <FormItem>
            <FormLabel>Program Title</FormLabel>
            <FormControl>
              <Input
                value={program.title}
                onChange={(e) =>
                  handleProgramChange(index, "title", e.target.value)
                }
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>

          {/* Program Description */}
          <FormItem>
            <FormLabel>Program Description</FormLabel>
            <FormControl>
              <Textarea
                value={program.description}
                onChange={(e) =>
                  handleProgramChange(index, "description", e.target.value)
                }
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>

          {/* Program Link */}
          <FormItem>
            <FormLabel>Program Link</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com"
                value={program.link}
                onChange={(e) =>
                  handleProgramChange(index, "link", e.target.value)
                }
                className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
              />
            </FormControl>
          </FormItem>
        </div>
      ))}

      <Button
        type="button"
        onClick={addProgram}
        className="px-4 py-2 flex items-center gap-2"
      >
        + Add More Program
      </Button>
    </div>
  );
}
