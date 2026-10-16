"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { sampleOrders } from "@/components/OrdersClient";
import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";

type Mode = "login" | "signup";

type AccountUser = {
  name: string;
  email: string;
  provider: string;
  avatar?: string;
  signedInAt: string;
};

type StoredUser = AccountUser & {
  password: string;
};

type OrderItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  placedAt: string;
  status: string;
  eta: string;
  total: number;
  items: OrderItem[];
};

function broadcastAuthChange() {
  window.dispatchEvent(new Event("sealcart-auth-change"));
}

function readStoredUsers() {
  try {
    return JSON.parse(window.localStorage.getItem("sealcart-users") ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function saveSession(user: AccountUser) {
  window.localStorage.setItem("sealcart-user", JSON.stringify(user));
  broadcastAuthChange();
}

export function AccountClient({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const params = new URLSearchParams(window.location.search);
      const authStatus = params.get("auth");
      if (authStatus === "google-config-required") {
        setMessage("Real Google login needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.");
      } else if (authStatus === "google-failed") {
        setMessage("Google sign-in could not be completed. Please try again.");
      }

      const rawUser = window.localStorage.getItem("sealcart-user");
      let nextUser = rawUser ? (JSON.parse(rawUser) as AccountUser) : null;

      try {
        const response = await fetch("/api/auth/session");
        const session = (await response.json()) as { user?: AccountUser | null };
        if (session.user) {
          nextUser = session.user;
          saveSession(session.user);
        }
      } catch {
        // Local email accounts still work if the session endpoint is unavailable.
      }

      setUser(nextUser);
      setOrders(JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]"));
    }

    loadAccount().catch(() => {
      setUser(null);
      setOrders([]);
    });
  }, []);

  const allOrders = useMemo(() => [...orders, ...sampleOrders], [orders]);
  const recentOrders = allOrders.slice(0, 4);

  function startGoogleSignIn() {
    window.location.href = "/api/auth/google";
  }

  function submitEmailAuth(details: { mode: Mode; name: string; email: string; password: string }) {
    const email = details.email.trim().toLowerCase();
    const password = details.password.trim();
    const name = details.name.trim();
    const selectedMode = details.mode;

    if (!email || !password || (selectedMode === "signup" && !name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    const storedUsers = readStoredUsers();

    if (selectedMode === "signup") {
      const nextUser: StoredUser = {
        name,
        email,
        password,
        provider: "Email",
        signedInAt: new Date().toISOString()
      };
      const withoutDuplicate = storedUsers.filter((item) => item.email !== email);
      window.localStorage.setItem("sealcart-users", JSON.stringify([nextUser, ...withoutDuplicate]));
      const { password: _password, ...sessionUser } = nextUser;
      saveSession(sessionUser);
      setUser(sessionUser);
      setMessage("Account created and signed in.");
      return;
    }

    const foundUser = storedUsers.find((item) => item.email === email && item.password === password);
    if (!foundUser) {
      setMessage("No matching account found. Try signing up first or continue with Google.");
      return;
    }

    const sessionUser: AccountUser = {
      name: foundUser.name,
      email: foundUser.email,
      provider: foundUser.provider,
      avatar: foundUser.avatar,
      signedInAt: new Date().toISOString()
    };
    saveSession(sessionUser);
    setUser(sessionUser);
    setMessage("Welcome back.");
  }

  function updateProfileName(value: string) {
    if (!user) return;
    const nextUser = { ...user, name: value };
    setUser(nextUser);
    saveSession(nextUser);
  }

  function updateProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextUser = { ...user, avatar: String(reader.result) };
      setUser(nextUser);
      saveSession(nextUser);
      setMessage("Profile picture updated.");
    };
    reader.readAsDataURL(file);
  }

  function logout() {
    window.localStorage.removeItem("sealcart-user");
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setMessage("Signed out.");
    broadcastAuthChange();
  }

  if (user) {
    const signedInDate = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(user.signedInAt));

    return (
      <section className="accountLayout">
        <aside className="accountPanel profilePanel">
          <div className="profileAvatar">
            {user.avatar ? <img alt={`${user.name} profile`} src={user.avatar} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
          </div>
          <label className="photoUpload">
            Change profile picture
            <input accept="image/*" onChange={updateProfilePhoto} type="file" />
          </label>
          <label>
            Display name
            <input value={user.name} onChange={(event) => updateProfileName(event.target.value)} />
          </label>
          <div className="accountMeta">
            <span>{user.email}</span>
            <span>{user.provider}</span>
            <span>Signed in {signedInDate}</span>
          </div>
          <button className="button secondary full" onClick={logout} type="button">
            Logout
          </button>
        </aside>

        <div className="accountPanel">
          <div className="sectionTitle">
            <div>
              <p className="eyebrow">Account overview</p>
              <h2>Orders, profile, and shopping shortcuts</h2>
            </div>
            <Link href="/orders">View all orders</Link>
          </div>

          <div className="accountStats">
            <article>
              <span>Total orders</span>
              <strong>{allOrders.length}</strong>
            </article>
            <article>
              <span>Active orders</span>
              <strong>{allOrders.filter((order) => order.status !== "Delivered").length}</strong>
            </article>
            <article>
              <span>Saved session</span>
              <strong>Secure</strong>
            </article>
          </div>

          <div className="accountOrders">
            {recentOrders.map((order) => (
              <Link className="accountOrder" href="/orders" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.status} - {order.eta}</span>
                </div>
                <strong>Rs {order.total.toLocaleString("en-IN")}</strong>
              </Link>
            ))}
          </div>

          <div className="accountActions">
            <Link className="button primary" href="/commerce">
              Continue shopping
            </Link>
            <Link className="button secondary" href="/orders">
              Track my orders
            </Link>
          </div>
        </div>

        {message ? <p className="authMessage">{message}</p> : null}
      </section>
    );
  }

  return (
    <SignIn1
      mode={mode}
      message={message}
      onEmailAuth={submitEmailAuth}
      onGoogle={startGoogleSignIn}
      onModeChange={(nextMode) => {
        setMode(nextMode);
        setMessage("");
      }}
    />
  );
}
