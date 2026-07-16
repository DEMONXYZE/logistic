"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function homeForRole(role: string | undefined) {
  return role === "driver" ? "/driver/jobs" : "/dashboard";
}

export function useRequireAuth(redirectTo: string = "/login/shipper", allowedRoles?: string[]) {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(homeForRole(user.role));
    }
  }, [loading, user, router, redirectTo, allowedRoles]);

  return { user, token, loading };
}
