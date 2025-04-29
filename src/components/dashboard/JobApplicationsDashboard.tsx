"use client";

import { useEffect, useState } from "react";
import { fetchJobStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface JobStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function JobApplicationsDashboard() {
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      console.log("Loading job stats..."); // ✅ Debug log

      try {
        const data = await fetchJobStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching job stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Job Applications",
      key: "total",
      color: "text-blue-600 dark:text-blue-400",
      icon: <Briefcase className="text-blue-500 w-10 h-10" />,
    },
    {
      title: "Pending",
      key: "pending",
      color: "text-yellow-600 dark:text-yellow-400",
      icon: <Clock className="text-yellow-500 w-10 h-10" />,
    },
    // {
    //   title: "Approved",
    //   key: "approved",
    //   color: "text-emerald-600 dark:text-emerald-400",
    //   icon: <CheckCircle className="text-emerald-500 w-10 h-10" />,
    // },    
    {
      title: "Rejected",
      key: "rejected",
      color: "text-red-600 dark:text-red-400",
      icon: <XCircle className="text-red-500 w-10 h-10" />,
    },
  ] as const;

  return (
    <div className="p-4 space-y-6">
      {/* ✅ Dashboard Cards with Skeleton Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className="shadow-md flex flex-col items-center p-4 dark:bg-[#27272a]"
          >
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              card.icon
            )}
            <CardHeader>
              {loading ? (
                <Skeleton className="h-6 w-32 rounded-md" />
              ) : (
                <CardTitle className="text-primary text-center">
                  {card.title}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-10 w-16 rounded-md" />
              ) : (
                <p className={`text-4xl font-bold ${card.color}`}>
                  {stats ? stats[card.key] : 0}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
