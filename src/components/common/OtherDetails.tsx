"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Plus, X } from "lucide-react";

interface OtherDetailsProps {
  unitStatus: string;
  otherDetails: string[];
  setOtherDetails: (details: string[]) => void;
}

const OtherDetails: React.FC<OtherDetailsProps> = ({
  unitStatus,
  otherDetails,
  setOtherDetails,
}) => {
  if (unitStatus !== "Semi-Furnished" && unitStatus !== "Fully-Furnished") {
    return null;
  }

  const updateDetailValue = (index: number, value: string) => {
    const updatedDetails = [...otherDetails];
    updatedDetails[index] = value;
    setOtherDetails(updatedDetails);
    console.log(otherDetails);
  };

  const addDetailField = () => {
    setOtherDetails([...otherDetails, ""]);
  };

  const removeDetailField = (index: number) => {
    setOtherDetails(otherDetails.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <FormLabel>Add Other Details</FormLabel>
      {otherDetails.map((detail, index) => (
        <div key={index} className="flex items-center gap-2 mt-2">
          <Input
            type="text"
            placeholder="Enter detail"
            value={detail}
            onChange={(e) => updateDetailValue(index, e.target.value)}
            className="bg-gray-100 dark:bg-[#333333] text-black dark:text-white rounded-md p-2"
          />
          <button
            type="button"
            className="text-red-500 hover:text-red-700"
            onClick={() => removeDetailField(index)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
        onClick={addDetailField}
      >
        <Plus className="w-5 h-5 mr-1" /> Add More
      </button>
    </div>
  );
};

export default OtherDetails;
