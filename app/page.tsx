"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "manager") {
      router.replace("/dashboard");
    } else {
      router.replace("/products");
    }
  }, [ready, user, router]);

  return null;
}
