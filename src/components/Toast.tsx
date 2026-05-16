"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { Check } from "lucide-react";

interface Toast {
  id: number;
  text: string;
  icon?: React.ReactNode;
}

const ToastCtx = createContext<{ push: (text: string, icon?: React.ReactNode) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);

  const push = useCallback((text: string, icon?: React.ReactNode) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, text, icon }]);
    setTimeout(() => {
      setList((l) => l.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-wrap">
        {list.map((t) => (
          <div className="toast" key={t.id}>
            {t.icon ?? <Check size={14} />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
