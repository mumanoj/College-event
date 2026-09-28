"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string }) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ type = "info", title, message }: { type?: ToastType; title?: string; message: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, title = "Success") => {
    toast({ type: "success", title, message });
  }, [toast]);

  const showError = useCallback((message: string, title = "Error") => {
    toast({ type: "error", title, message });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, showSuccess, showError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100"
                : t.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-100"
                : "bg-background border-border text-foreground"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm">
              {t.title && <p className="font-semibold">{t.title}</p>}
              <p className="opacity-90">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      showSuccess: () => {},
      showError: () => {},
    };
  }
  return context;
}
