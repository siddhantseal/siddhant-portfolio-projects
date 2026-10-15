"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("sealcart-theme");
    const shouldEnable = stored === "dark";
    setEnabled(shouldEnable);
    document.body.classList.toggle("themeDark", shouldEnable);
  }, []);

  function updateTheme(nextEnabled: boolean) {
    setEnabled(nextEnabled);
    document.body.classList.toggle("themeDark", nextEnabled);
    window.localStorage.setItem("sealcart-theme", nextEnabled ? "dark" : "light");
  }

  return (
    <label className="themeSwitch">
      <input
        aria-label="Enable dark mode"
        checked={enabled}
        onChange={(event) => updateTheme(event.target.checked)}
        type="checkbox"
      />
      <span>Dark</span>
    </label>
  );
}
