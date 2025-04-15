"use client";

import { useEffect, useState } from "react";
import { fetchInquiryStats } from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

// Define colors for each inquiry type
const COLORS = [
  "#3b82f6", // blue-500
  "#facc15", // yellow-400
  "#ef4444", // red-500
  "#10B981", // emerald-500 (✅ replaced green)
  "#9333ea", // purple-600
  "#14b8a6", // teal-500
];

export default function InquiryStats() {
  const [data, setData] = useState<{ inquiry_type: string; count: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const stats = await fetchInquiryStats();
      setData(stats);
      setLoading(false);
    }
    loadStats();
  }, []);

  const totalInquiries = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="col-span-2 lg:col-span-2 p-2 shadow-lg border dark:bg-[#1f1f21] rounded-xl">
      <CardHeader className="items-center pb-0">
        <CardTitle>Most Popular Inquiry Types</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        {loading ? (
          <Skeleton className="w-full h-[220px] rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={235}>
            <PieChart>
              {" "}
              <Pie
                data={data}
                dataKey="count"
                nameKey="inquiry_type"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalInquiries}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Inquiries
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Inquiries <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Most requested inquiry types
        </div>
      </CardFooter>
    </Card>
  );
}
