"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS, searchLanguages, getLanguageByCode } from "@/lib/languages";
import { useFavorites } from "@/hooks/use-favorites";
import type { Language } from "@/types";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (code: string) => void;
}

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const filteredLanguages = useMemo(() => searchLanguages(query), [query]);

  const favoriteLanguages = useMemo(
    () => favorites.map((code) => getLanguageByCode(code)).filter(Boolean) as Language[],
    [favorites]
  );

  const groupedLanguages = useMemo(() => {
    const groups: Record<string, Language[]> = {};
    for (const lang of filteredLanguages) {
      if (!groups[lang.category]) groups[lang.category] = [];
      groups[lang.category].push(lang);
    }
    return groups;
  }, [filteredLanguages]);

  const categoryOrder = ["popular", "european", "asian", "middle-eastern", "african", "americas", "other"];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          placeholder="Search languages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[320px]">
        <div className="flex flex-col gap-1 pr-3">
          {/* Favorites */}
          {favoriteLanguages.length > 0 && !query && (
            <>
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Favorites
              </p>
              {favoriteLanguages.map((lang) => (
                <LanguageRow
                  key={`fav-${lang.code}`}
                  language={lang}
                  isSelected={selectedLanguage === lang.code}
                  isFavorite={true}
                  onSelect={onSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
              <Separator className="my-1" />
            </>
          )}

          {/* Grouped languages */}
          {categoryOrder.map((category) => {
            const langs = groupedLanguages[category];
            if (!langs || langs.length === 0) return null;
            return (
              <div key={category}>
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </p>
                {langs.map((lang) => (
                  <LanguageRow
                    key={lang.code}
                    language={lang}
                    isSelected={selectedLanguage === lang.code}
                    isFavorite={isFavorite(lang.code)}
                    onSelect={onSelect}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            );
          })}

          {filteredLanguages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No languages found.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function LanguageRow({
  language,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  language: Language;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (code: string) => void;
  onToggleFavorite: (code: string) => void;
}) {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={() => onSelect(language.code)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(language.code);
        }
      }}
      className={`
        flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm transition-colors duration-150
        ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{language.flag}</span>
        <span className="font-medium">{language.name}</span>
        <span className={`text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {language.nativeName}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(language.code);
        }}
        className={`
          cursor-pointer p-1 transition-colors duration-150
          ${isFavorite ? "text-yellow-500" : isSelected ? "text-primary-foreground/40 hover:text-primary-foreground/70" : "text-muted-foreground/40 hover:text-yellow-500"}
        `}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  );
}
