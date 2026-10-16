"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DemoUser = {
  name: string;
  email: string;
  provider: string;
  avatar?: string;
};

function readUser() {
  try {
    const rawUser = window.localStorage.getItem("sealcart-user");
    return rawUser ? (JSON.parse(rawUser) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function AuthStatus() {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(readUser());

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("sealcart-auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("sealcart-auth-change", syncUser);
    };
  }, []);

  if (!user) {
    return (
      <Link className="headerAuth" href="/login">
        Sign in
      </Link>
    );
  }

  return (
    <Link className="headerAuth signedIn" href="/account" title={user.email}>
      {user.avatar ? <img alt="" src={user.avatar} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
      <strong>{user.name.split(" ")[0]}</strong>
    </Link>
  );
}
