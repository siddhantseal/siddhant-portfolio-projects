"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { sampleOrders } from "@/components/OrdersClient";

type Mode = "login" | "signup";

type DemoUser = {
  name: string;
  email: string;
  provider: string;
  avatar?: string;
  signedInAt: string;
};

type StoredUser = DemoUser & {
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

const defaultUser: DemoUser = {
  name: "Siddhant Shopper",
  email: "siddhant.demo@gmail.com",
  provider: "Google Demo",
  signedInAt: new Date().toISOString()
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

function saveSession(user: DemoUser) {
  window.localStorage.setItem("sealcart-user", JSON.stringify(user));
  broadcastAuthChange();
}

export function AccountClient({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    try {
      const rawUser = window.localStorage.getItem("sealcart-user");
      setUser(rawUser ? (JSON.parse(rawUser) as DemoUser) : null);
      setOrders(JSON.parse(window.localStorage.getItem("sealcart-orders") ?? "[]"));
    } catch {
      setUser(null);
      setOrders([]);
    }
  }, []);

  const allOrders = useMemo(() => [...orders, ...sampleOrders], [orders]);
  const recentOrders = allOrders.slice(0, 4);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function signInWithGoogleDemo() {
    const nextUser = { ...defaultUser, signedInAt: new Date().toISOString() };
    saveSession(nextUser);
    setUser(nextUser);
    setMessage("Signed in with Google demo account.");
  }

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const name = form.name.trim();

    if (!email || !password || (mode === "signup" && !name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    const storedUsers = readStoredUsers();

    if (mode === "signup") {
      const nextUser: StoredUser = {
        name,
        email,
        password,
        provider: "Email Demo",
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
      setMessage("No matching demo account found. Try signing up first or use Google demo.");
      return;
    }

    const sessionUser: DemoUser = {
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
              <strong>Demo</strong>
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
    <section className="authLayout">
      <div className="authPanel authCopy">
        <p className="eyebrow">SealCart account</p>
        <h2>Sign in to manage profile, orders, and checkout history.</h2>
        <p>
          This is a live demo authentication flow. Google demo creates a safe browser session instantly,
          while email signup lets interviewers test account creation without private credentials.
        </p>
        <div className="authHighlights">
          <span>Profile picture upload</span>
          <span>Logout and session state</span>
          <span>Past orders dashboard</span>
        </div>
      </div>

      <form className="authPanel authForm" onSubmit={submitAuth}>
        <div className="authTabs" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
            Sign up
          </button>
        </div>

        <button className="googleButton" onClick={signInWithGoogleDemo} type="button">
          <span>G</span>
          Continue with Google Demo
        </button>

        {mode === "signup" ? (
          <label>
            Full name
            <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Your name" />
          </label>
        ) : null}
        <label>
          Email
          <input value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="you@example.com" type="email" />
        </label>
        <label>
          Password
          <input value={form.password} onChange={(event) => updateForm("password", event.target.value)} placeholder="Demo password" type="password" />
        </label>
        <button className="button primary full" type="submit">
          {mode === "signup" ? "Create account" : "Login"}
        </button>
        {message ? <p className="authMessage">{message}</p> : null}
      </form>
    </section>
  );
}
