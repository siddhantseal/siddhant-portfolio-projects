"use client";

import * as React from "react";
import { useState } from "react";

type AuthMode = "login" | "signup";

type SignIn1Props = {
  mode?: AuthMode;
  message?: string;
  onModeChange?: (mode: AuthMode) => void;
  onEmailAuth?: (details: { mode: AuthMode; name: string; email: string; password: string }) => void;
  onGoogle?: () => void;
};

const shopperAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80"
];

const SignIn1 = ({ mode = "login", message, onModeChange, onEmailAuth, onGoogle }: SignIn1Props) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const switchMode = (nextMode: AuthMode) => {
    setError("");
    onModeChange?.(nextMode);
  };

  const handleSignIn = () => {
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onEmailAuth?.({ mode, name, email, password });
  };

  return (
    <section className="modernSignInShell">
      <div className="modernSignInAmbient one" />
      <div className="modernSignInAmbient two" />

      <div className="modernSignInCard">
        <div className="modernLogo" aria-hidden="true">
          S
        </div>

        <p className="modernEyebrow">SealCart secure account</p>
        <h2>{mode === "signup" ? "Create your shopping profile." : "Welcome back to SealCart."}</h2>
        <p className="modernIntro">
          Manage your profile picture, previous orders, checkout sessions, and account details from one clean dashboard.
        </p>

        <div className="modernAuthTabs" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">
            Login
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} type="button">
            Sign up
          </button>
        </div>

        <div className="modernFields">
          {mode === "signup" ? (
            <input
              placeholder="Full name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          ) : null}
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error || message ? <div className="modernError">{error || message}</div> : null}
        </div>

        <button onClick={handleSignIn} className="modernPrimaryAction" type="button">
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <button className="modernGoogleAction" onClick={onGoogle} type="button">
          <span>G</span>
          Continue with Google
        </button>

        <div className="modernSwitch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => switchMode(mode === "login" ? "signup" : "login")} type="button">
            {mode === "login" ? "Sign up, it's free!" : "Login instead"}
          </button>
        </div>
      </div>

      <div className="modernSocialProof">
        <p>
          Join <strong>thousands</strong> of shoppers browsing deals, tracking orders, and managing accounts.
        </p>
        <div className="modernAvatarStack" aria-hidden="true">
          {shopperAvatars.map((avatar) => (
            <img alt="" key={avatar} src={avatar} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { SignIn1 };

export default SignIn1;
