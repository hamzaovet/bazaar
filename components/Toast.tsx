"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-md w-full p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center justify-between gap-3 text-xs md:text-sm font-bold transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
              t.type === "error"
                ? "bg-[#180a0a]/95 border-red-500/50 text-red-200 shadow-red-950/40"
                : t.type === "info"
                ? "bg-[#0a1018]/95 border-blue-500/50 text-blue-200 shadow-blue-950/40"
                : "bg-[#0a1810]/95 border-[#00ff66]/50 text-emerald-100 shadow-emerald-950/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "error" ? (
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <AlertCircle size={20} />
                </div>
              ) : t.type === "info" ? (
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Info size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-[#00ff66]/20 text-[#00ff66]">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <span className="leading-snug">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
