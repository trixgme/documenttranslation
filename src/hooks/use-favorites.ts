"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "doc-translate-favorite-languages";

function getStoredFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  // Keep in sync with localStorage changes from other tabs
  useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(STORAGE_KEY) || "[]",
    () => "[]"
  );

  const toggleFavorite = useCallback((languageCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(languageCode)
        ? prev.filter((c) => c !== languageCode)
        : [...prev, languageCode];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (languageCode: string) => favorites.includes(languageCode),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
