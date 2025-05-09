// src/app/(auth)/forgot-password/forgot-password-content.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { ForgotPassword } from "@/components/auth/forgot-password";

export default function ForgotPasswordPageContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    return <ForgotPassword email={email} token={token} />;
}
