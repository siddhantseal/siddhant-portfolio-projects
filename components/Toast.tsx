"use client";

import { useRef, useState } from "react";

type ToastTone = "success" | "danger" | "info";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  function showToast(message: string, tone: ToastTone = "success") {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setToast({
      id: Date.now(),
      message,
      tone
    });

    timeoutRef.current = window.setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 2600);
  }

  function ToastViewport() {
    if (!toast) return null;

    return (
      <div className={`toastPop ${toast.tone}`} role="status" aria-live="polite" key={toast.id}>
        <span />
        <strong>{toast.message}</strong>
      </div>
    );
  }

  return { showToast, ToastViewport };
}
