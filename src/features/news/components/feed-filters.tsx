"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/ui/search-input";
import { Tag } from "@/components/ui/tag";
import { Text } from "@/components/ui/text";
import {
  NEWS_FILTER_GROUPS,
  NEWS_SPECIFIC_FILTER_TOPICS,
  parseCategorySlug,
} from "@/features/news/classification/categories";
import { cn } from "@/utils/cn";

export function FeedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = parseCategorySlug(searchParams.get("categoria") ?? undefined);
  const queryParam = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const applyFilters = (nextQuery: string, category?: string) => {
    const params = new URLSearchParams();
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);
    if (category) params.set("categoria", category);

    const path = params.size > 0 ? `/noticias?${params.toString()}` : "/noticias";
    startTransition(() => {
      router.push(path);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters(query, activeCategory);
  };

  const renderTab = (slug: string | undefined, label: string) => {
    const isActive = slug ? activeCategory === slug : !activeCategory;

    return (
      <button
        key={slug ?? "todas"}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => applyFilters(query, slug)}
        disabled={isPending}
        className={cn(
          "veraz-focus-ring shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium veraz-transition",
          isActive
            ? "border-accent text-ink"
            : "border-transparent text-ink-secondary hover:border-border-strong hover:text-ink",
          isPending && "opacity-60",
        )}
      >
        {label}
      </button>
    );
  };

  const renderChip = (slug: string, label: string) => (
    <button
      key={slug}
      type="button"
      role="listitem"
      onClick={() => applyFilters(query, slug)}
      disabled={isPending}
      className={cn(isPending && "opacity-60")}
    >
      <Tag variant={activeCategory === slug ? "accent" : "neutral"}>{label}</Tag>
    </button>
  );

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSubmit} className="max-w-xl">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => {
            setQuery("");
            applyFilters("", activeCategory);
          }}
          placeholder="Buscar noticias por titular, resumen o tema…"
          aria-label="Buscar noticias"
          disabled={isPending}
        />
      </form>

      <div className="space-y-3">
        <nav
          role="tablist"
          aria-label="Clasificación del feed"
          className="-mb-px flex gap-1 overflow-x-auto border-b border-border"
        >
          {renderTab(undefined, "Todas")}
          {NEWS_FILTER_GROUPS.map((category) => renderTab(category.slug, category.label))}
        </nav>

        <div>
          <Text variant="caption" className="mb-2 block text-ink-muted">
            Temas específicos
          </Text>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Filtrar por tema específico">
            {NEWS_SPECIFIC_FILTER_TOPICS.map((topic) =>
              renderChip(topic.slug, topic.label),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
