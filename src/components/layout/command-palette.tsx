"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { navItems, bottomNavItems } from "@/lib/constants/navigation";

const allItems = [...navItems, ...bottomNavItems];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      query
        ? allItems.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          )
        : allItems,
    [query]
  );

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [router, onOpenChange]
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        navigate(filtered[selectedIndex].href);
      }
    },
    [filtered, selectedIndex, navigate]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setQuery("");
        setSelectedIndex(0);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and navigate to pages
        </DialogDescription>

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--content-muted)]" strokeWidth={1.5} />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-[var(--content-primary)] placeholder:text-[var(--content-muted)] outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[var(--border-default)] bg-[var(--surface-bg)] px-1.5 font-mono text-[10px] text-[var(--content-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--content-muted)]">
              No results found.
            </p>
          ) : (
            <ul>
              {filtered.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        index === selectedIndex
                          ? "bg-[var(--accent-light)] text-[var(--accent-primary)]"
                          : "text-[var(--content-secondary)] hover:bg-[var(--surface-bg)]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto text-xs text-[var(--content-muted)]">
                        {item.href}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
