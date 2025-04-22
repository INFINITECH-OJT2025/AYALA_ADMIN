"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRecentInquiries } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

// ✅ Define the Inquiry Type
interface Inquiry {
  id: number;
  inquiry_type: string;
  first_name: string;
  last_name: string;
  status: string;
}

export default function LatestInquiries() {
  const router = useRouter(); // ✅ Use Next.js router for navigation
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInquiries() {
      const data = await fetchRecentInquiries();
      setInquiries(data.slice(0, 5)); // ✅ Limit to 5 inquiries
      setLoading(false);
    }
    loadInquiries();
  }, []);

  return (
    <Card className="col-span-2 lg:col-span-2 p-2 shadow-lg border dark:bg-[#27272a] rounded-xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Recent Inquiries</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/overview/inquiries-received")}
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquiry Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>{inquiry.inquiry_type}</TableCell>
                    <TableCell>{`${inquiry.first_name} ${inquiry.last_name}`}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          inquiry.status === "replied"
                            ? "bg-green-500 text-white"
                            : inquiry.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : inquiry.status === "archived"
                            ? "bg-red-500 text-white"
                            : "bg-gray-500 text-white"
                        }
                      >
                        {inquiry.status || "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No inquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
