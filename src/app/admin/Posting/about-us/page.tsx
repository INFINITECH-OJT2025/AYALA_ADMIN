"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchAboutUsContent, updateAboutUsContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import AdminHistory from "@/components/common/HistorySection"; // ✅ Import History Section
import { Save } from "lucide-react";
import ProgramsSection from "@/components/common/ProgramsSection";

interface HistoryItem {
  title: string;
  description: string;
  image: File | null;
  preview: string | null;
}

interface ProgramItem {
  title: string;
  description: string;
  link: string;
}

export default function AdminAboutUs() {
  const [aboutUsData, setAboutUsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);

  const form = useForm({
    defaultValues: {
      hero_image: "",
      hero_title: "",
      hero_subtitle: "",
      mission_title: "",
      mission_description: "",
      vision_title: "",
      vision_description: "",
    },
  });

  useEffect(() => {
    const getContent = async () => {
      const data = await fetchAboutUsContent();
      console.log("Fetched Data:", data); // Debugging output
      if (data) {
        setAboutUsData(data);
        setHistory(data.history || []);
        setPrograms(data.programs || []);
  
        form.reset({
          hero_title: data.hero_title,
          hero_subtitle: data.hero_subtitle,
          mission_title: data.mission_title,
          mission_description: data.mission_description,
          vision_title: data.vision_title,
          vision_description: data.vision_description,
        });
  
        if (data.hero_image) {
          setPreviewMedia(data.hero_image);
          setMediaType(data.hero_image.endsWith(".mp4") ? "video" : "image");
        }
      }
      setLoading(false);
    };
    getContent();
  }, [form]);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");

      setPreviewMedia(fileURL);
      setMediaType(isVideo ? "video" : "image");
      form.setValue("hero_image", file as any);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hero_title", values.hero_title);
      formData.append("hero_subtitle", values.hero_subtitle);
      formData.append("mission_title", values.mission_title);
      formData.append("mission_description", values.mission_description);
      formData.append("vision_title", values.vision_title);
      formData.append("vision_description", values.vision_description);
  
      if (values.hero_image instanceof File) {
        formData.append("hero_image", values.hero_image);
      }
  
      // ✅ Include history data in form submission
      history.forEach((item, index) => {
        formData.append(`history[${index}][title]`, item.title);
        formData.append(`history[${index}][description]`, item.description);
        if (item.image instanceof File) {
          formData.append(`history[${index}][image]`, item.image);
        }
      });
  
      // ✅ Include programs data in form submission
      programs.forEach((program, index) => {
        formData.append(`programs[${index}][title]`, program.title);
        formData.append(`programs[${index}][description]`, program.description);
        formData.append(`programs[${index}][link]`, program.link);
      });
  
      const response = await updateAboutUsContent(formData);
      if (response) {
        toast.success("About Us updated successfully!");
      } else {
        toast.error("Failed to update About Us.");
      }
    } catch (error) {
      console.error("Error updating About Us:", error);
      toast.error("An error occurred while updating About Us.");
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className=" p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Manage About Us</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Hero Image */}
          <FormField
            control={form.control}
            name="hero_image"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Hero Media (Image or Video)
                </FormLabel>

                {previewMedia && mediaType === "image" && (
                  <img
                    src={previewMedia}
                    alt="Hero Preview"
                    className="mt-2 w-full h-64 object-cover rounded-lg shadow-md"
                  />
                )}

                {previewMedia && mediaType === "video" && (
                  <video
                    controls
                    className="mt-2 w-full h-64 object-cover rounded-lg shadow-md"
                  >
                    <source src={previewMedia} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                <FormControl>
                  <Input
                    type="file"
                    accept="image/*, video/*"
                    onChange={handleFileChange}
                    className="mt-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hero Title & Subtitle */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="hero_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Hero Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hero_subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Hero Subtitle
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mission_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Mission Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vision_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Vision Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mission_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Mission Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vision_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Vision Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#27272a]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ✅ Imported History Section */}
          <AdminHistory history={history} setHistory={setHistory} />

          <ProgramsSection programs={programs} setPrograms={setPrograms} />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="success"
              className="px-5 py-2 text-base font-medium flex items-center gap-2"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
