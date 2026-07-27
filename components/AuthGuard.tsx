"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/services/authService";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const user = await getCurrentUserProfile();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (!user.is_active) {
        alert("Your account has been disabled.");
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}