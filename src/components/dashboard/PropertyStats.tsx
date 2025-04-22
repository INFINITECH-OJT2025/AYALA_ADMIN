"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPropertyStats } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useTheme } from "next-themes";

interface Property {
  name: string;
  image: string;
  location: string;
  price: number;
  uniqueViews: number;
}

interface PropertyStats {
  total: number;
  forSale: number;
  forRent: number;
  totalViews: number;
  uniqueViews: number;
  mostViewed: Property | null;
}

export default function PropertyStats() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Choose stroke color based on theme
  const axisStrokeColor = isDark ? "#D1D5DB" : "#4B5563"; // gray-300 for dark, gray-700 for ligh

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchPropertyStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load property stats.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const barChartData = [
    { name: "For Sale", value: stats?.forSale || 0 },
    { name: "For Rent", value: stats?.forRent || 0 },
    { name: "Total Views", value: stats?.totalViews || 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-4">
      {/* ✅ Bar Chart for General Stats */}
      <Card className="col-span-2 lg:col-span-2 p-2 shadow-lg border dark:bg-[#27272a] rounded-xl">
        <CardHeader>
          <CardTitle>Property Overview</CardTitle>
        </CardHeader>
        <CardContent className="w-full h-64">
          {loading ? (
            <Skeleton className="w-full h-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" stroke={axisStrokeColor} />
                <YAxis stroke={axisStrokeColor} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#10B981" // emerald-500
                  radius={[5, 5, 0, 0]}
                  activeBar={{ fill: "#059669" }} // emerald-600 on hover
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ✅ Most Viewed Property with Image */}
      <Card className="col-span-2 p-4 shadow-lg border dark:bg-[#27272a] rounded-xl transition-all hover:shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle>Most Viewed Property</CardTitle>
        </CardHeader>
        <div className="flex flex-row items-center">
          <img
            src={stats?.mostViewed?.image || "/placeholder.jpg"}
            alt={stats?.mostViewed?.name || "No Image"}
            className="w-1/2 h-56 object-cover rounded-l-md"
          />
          <CardContent className="w-1/2 p-4 text-left">
            {loading ? (
              <Skeleton className="h-32 w-full rounded-lg" />
            ) : (
              <>
                <h3 className="text-2xl font-bold">
                  {stats?.mostViewed?.name || "N/A"}
                </h3>
                <p className="text-md text-gray-800 dark:text-gray-300">
                  {stats?.mostViewed?.location || "Unknown Location"}
                </p>
                <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-500">
                  ₱
                  {stats?.mostViewed?.price
                    ? Number(stats?.mostViewed?.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : "N/A"}
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <p className="text-sm font-semibold">Unique Views:</p>
                  <div className="flex items-center font-semibold text-emerald-600 dark:text-emerald-500">
                    {stats?.uniqueViews || 0}
                    <Eye className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
