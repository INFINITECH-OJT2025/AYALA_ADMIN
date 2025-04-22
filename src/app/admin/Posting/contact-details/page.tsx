"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { updateContactDetails, fetchContactDetails } from "@/lib/api";
import { Save } from "lucide-react";

interface Phone {
  title: string;
  number: string;
}

interface SocialMedia {
  platform: string;
  link: string;
}

export default function ContactDetails() {
  const [phones, setPhones] = useState<Phone[]>([{ title: "", number: "" }]);
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([
    { platform: "", link: "" },
  ]);

  // Fetch existing contact details
  useEffect(() => {
    const loadContactDetails = async () => {
      try {
        const data = await fetchContactDetails();
        if (data) {
          setPhones(data.phones || [{ title: "", number: "" }]);
          setEmail(data.email || "");
          setLocation(data.location || "");
          setSocialMedia(data.social_media || [{ platform: "", link: "" }]);
        }
      } catch (error) {
        console.error("Failed to fetch contact details", error);
      }
    };
    loadContactDetails();
  }, []);

  // Handle submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateContactDetails({
        phones,
        email,
        location,
        social_media: socialMedia,
      });
      toast.success("Contact details updated successfully!");
    } catch (error) {
      toast.error("Failed to update contact details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold">Update Contact Details</h2>
      {/* Email */}
      <div>
        <label className="font-semibold">Email</label>
        <div className="flex gap-2 mt-2 items-start">
          <Input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-[#27272a]"
          />
          <div className="w-[82px]"></div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="font-semibold">Location</label>
        <div className="flex gap-2 mt-2 items-start">
          <Input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-[#27272a]"
          />
          <div className="w-[82px]"></div>
        </div>
      </div>

      <div>
        <label className="font-semibold mt-2">Phone Numbers</label>
        {phones.map((phone, index) => (
          <div key={index} className="flex gap-2 mt-2 items-start">
            <Input
              type="text"
              placeholder="Title (e.g., Sales Inquiry)"
              value={phone.title}
              className="flex-1 bg-gray-100 dark:bg-[#27272a]"
              onChange={(e) => {
                const updatedPhones = [...phones];
                updatedPhones[index].title = e.target.value;
                setPhones(updatedPhones);
              }}
            />
            <Input
              type="text"
              placeholder="Phone Number"
              value={phone.number}
              className="flex-1 bg-gray-100 dark:bg-[#27272a]"
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                if (numericValue.length <= 11) {
                  const updatedPhones = [...phones];
                  updatedPhones[index].number = numericValue;
                  setPhones(updatedPhones);
                }
              }}
              maxLength={11}
            />

            {index > 0 ? (
              <Button
                variant="destructive"
                onClick={() => setPhones(phones.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            ) : (
              <div className="w-[82px]"></div> // width matches the button for alignment
            )}
          </div>
        ))}
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => setPhones([...phones, { title: "", number: "" }])}
        >
          + Add Phone
        </Button>
      </div>

      {/* Email */}

      {/* Social Media */}
      <div>
        <label className="font-semibold mt-2">Social Media</label>
        {socialMedia.map((social, index) => (
          <div key={index} className="flex gap-2 mt-2 items-start">
            <Input
              type="text"
              placeholder="Platform (e.g., Facebook)"
              value={social.platform}
              className="flex-1 bg-gray-100 dark:bg-[#27272a]"
              onChange={(e) => {
                const updatedSocial = [...socialMedia];
                updatedSocial[index].platform = e.target.value;
                setSocialMedia(updatedSocial);
              }}
            />
            <Input
              type="text"
              placeholder="Link (e.g., https://facebook.com/yourpage)"
              value={social.link}
              className="flex-1 bg-gray-100 dark:bg-[#27272a]"
              onChange={(e) => {
                const updatedSocial = [...socialMedia];
                updatedSocial[index].link = e.target.value;
                setSocialMedia(updatedSocial);
              }}
            />
            {index > 0 ? (
              <Button
                variant="destructive"
                onClick={() =>
                  setSocialMedia(socialMedia.filter((_, i) => i !== index))
                }
              >
                Remove
              </Button>
            ) : (
              <div className="w-[82px]"></div>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          className="mt-2"
          onClick={() =>
            setSocialMedia([...socialMedia, { platform: "", link: "" }])
          }
        >
          + Add Social Media
        </Button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          variant="success"
          className="px-5 py-2 text-base font-medium flex items-center gap-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          <Save className="w-5 h-5" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
