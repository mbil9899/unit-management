"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export default function RoleGuard({
  allow,
  children,
}: {
  allow: (user: any) => boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && !allow(user)) {
      router.replace("/dashboard");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!allow(user)) {
    return null;
  }

  return <>{children}</>;
}