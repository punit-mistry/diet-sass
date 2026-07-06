"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlOrMeta = options?.ctrl || options?.meta;
      const matchesCtrl = ctrlOrMeta && (e.ctrlKey || e.metaKey);
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();

      if (options?.ctrl || options?.meta) {
        if (matchesCtrl && matchesKey) {
          e.preventDefault();
          callback();
        }
      } else if (matchesKey) {
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options?.ctrl, options?.meta, options?.shift]);
}
