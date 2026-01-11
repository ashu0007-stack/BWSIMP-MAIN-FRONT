import { useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("OAuthCredentials");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  return profile;
}
