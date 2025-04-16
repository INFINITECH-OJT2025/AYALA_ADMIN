"use client";

import { useState } from "react";
import JobTable from "@/components/admin/JobTable";
import JobCreateModal from "@/components/common/JobCreateModal";

export default function JobManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <JobTable />
      <JobCreateModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
