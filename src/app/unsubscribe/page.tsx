"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Unsubscription failed");
      }
  
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email to unsubscribe from our mailing list.
          </p>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleUnsubscribe} disabled={loading} className="w-full">
            {loading ? "Unsubscribing..." : "Unsubscribe"}
          </Button>
          {message && (
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}

