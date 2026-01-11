"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("OAuthCredentials");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }

    // Prevent back navigation after logout
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      const tokenCheck = sessionStorage.getItem("OAuthCredentials");
      if (!tokenCheck) window.location.href = "/login";
    });
  }, [router]);

  if (!checked) return null; // Wait until auth check done

  return <>{children}</>;
}
