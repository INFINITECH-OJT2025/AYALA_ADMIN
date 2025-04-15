"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { submitProperty } from "@/lib/api";
import {
  Phone,
  MapPin,
  DollarSign,
  Home,
  Car,
  Mail,
  Contact,
  Image as ImageIcon,
  AirVent,
  Grid2X2Check,
  Building2,
  List,
  Combine,
  PencilLine,
  Banknote,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // ✅ Import Sonner
import OtherDetails from "./OtherDetails";

interface CreateListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateListingDialog({
  isOpen,
  onClose,
}: CreateListingDialogProps) {
  const form = useForm();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [otherDetails, setOtherDetails] = useState<string[]>([]);
  const unitStatus = form.watch("unit_status"); // ✅ Watch selected value

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);
    }
  };

  useEffect(() => {
    form.setValue("other_details", otherDetails);
  }, [otherDetails, form]);

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    console.log("Submitting Data:", data);
    setLoading(true);

    const formData = new FormData();
    formData.append("status", "approved"); // ✅ Auto-approve for admin

    formData.append("type_of_listing", data.type_of_listing);

    formData.append("other_details", JSON.stringify(data.other_details || []));

    const selectedFeatures = Object.keys(data.features).filter(
      (key) => data.features[key] === true
    );
    formData.append("features", JSON.stringify(selectedFeatures));

    Object.entries(data).forEach(([key, value]) => {
      if (
        key !== "features" &&
        key !== "type_of_listing" &&
        key !== "other_details"
      ) {
        formData.append(key, value as string);
      }
    });

    selectedImages.forEach((image) =>
      formData.append("property_image[]", image)
    );

    try {
      const response = await submitProperty(formData);
      console.log("Property submitted successfully", response);

      // ✅ Show toast notification on success
      // ✅ Show toast on success
      toast("Property Created", {
        description: `The property "${data.property_name}" has been successfully published.`,
        action: {
          label: "View",
          onClick: () => console.log("Redirect to property details"),
        },
      });

      onClose(); // ✅ Close dialog after submission
    } catch (error) {
      console.error("Error submitting property", error);

      // ✅ Show toast error if submission fails
      toast.error("Failed to create property", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const listingOptions = ["For Rent", "For Sale"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-4 m-4 bg-gray-100 dark:bg-[#18181a]">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] pr-4">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
            Personal Information
          </h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-2"
            >
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  rules={{ required: "First Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Contact className="inline-block mr-2" />
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  rules={{ required: "Last Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Contact className="inline-block mr-2" />
                        Last Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Mail className="inline-block mr-2" />
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  rules={{ required: "Phone Number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Phone className="inline-block mr-2" />
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                          placeholder="Phone Number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                            if (value.length <= 11) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Information */}
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-6">
                Property Information
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="property_name"
                  rules={{ required: "Property Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Home className="inline-block mr-2" />
                        Property Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Property Name"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <MapPin className="inline-block mr-2" />
                        Location <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Location"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type_of_listing"
                  rules={{ required: "Listing Type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <List className="inline-block mr-2" /> Listing Type{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {listingOptions.map((option) => (
                          <FormItem
                            key={option}
                            className="flex items-end gap-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value === option}
                                onCheckedChange={() => {
                                  form.setValue("type_of_listing", option);
                                }}
                              />
                            </FormControl>
                            <FormLabel>{option}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{ required: "Price is required" }}
                  render={({ field }) => {
                    const formatPrice = (value: string) => {
                      const numericValue = value.replace(/[^0-9.]/g, "");
                      return new Intl.NumberFormat("en-US").format(
                        parseFloat(numericValue) || 0
                      );
                    };

                    return (
                      <FormItem>
                        <FormLabel>
                          <Banknote className="inline-block mr-2" />
                          Price <span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <Input
                            className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                            placeholder="Price"
                            {...field}
                            value={
                              field.value
                                ? formatPrice(field.value.toString())
                                : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/,/g, "");
                              field.onChange(rawValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="square_meter"
                  rules={{ required: "Square Meter is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Grid2X2Check className="inline-block mr-2" /> Square
                        Meter <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Square Meter"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor_number"
                  rules={{ required: "Floor Number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Building2 className="inline-block mr-2" /> Floor Number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Floor Number"
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unit_status"
                  rules={{ required: "Unit Status is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <AirVent className="inline-block mr-2" />
                        Unit Status <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2">
                          <SelectTrigger>
                            <SelectValue placeholder="Unit Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bare">Bare</SelectItem>
                          <SelectItem value="Semi-Furnished">
                            Semi-Furnished
                          </SelectItem>
                          <SelectItem value="Fully-Furnished">
                            Fully-Furnished
                          </SelectItem>
                          <SelectItem value="Interiored">Interiored</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parking"
                  rules={{ required: "Parking option is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Car className="inline-block mr-2" /> Parking{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Parking Availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="with">With Parking</SelectItem>
                          <SelectItem value="without">
                            Without Parking
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_type"
                  rules={{ required: "Unit Type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Combine className="inline-block mr-2" /> Unit Type{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2">
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="studio type">
                            Studio type
                          </SelectItem>
                          <SelectItem value="1br">1BR</SelectItem>
                          <SelectItem value="2br">2BR</SelectItem>
                          <SelectItem value="loft">Loft</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <OtherDetails
                unitStatus={unitStatus}
                otherDetails={otherDetails}
                setOtherDetails={setOtherDetails}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PencilLine className="inline-block mr-2" /> Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter property description"
                        {...field}
                        className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-6">
                General Features and Amenities
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Pool Area",
                      "Gym Fitness Center",
                      "Underground Parking",
                      "Balcony Terrace",
                      "Security",
                      "Pet Friendly Facilities",
                      "Elevator",
                      "Concierge Services",
                      "Guest Suite",
                      "Club House",
                    ].map((feature) => (
                      <FormField
                        key={feature}
                        control={form.control}
                        name={`features.${feature}`}
                        render={({ field }) => (
                          <FormItem className="flex items-end gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>{feature}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <FormLabel>
                  <ImageIcon className="inline-block mr-2" />
                  Property Images
                </FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2 mt-2"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Selected ${index}`}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-0 right-0 p-1"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="success"
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Property"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
