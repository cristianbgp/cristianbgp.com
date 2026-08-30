import {
  CheckIcon,
  ChevronDownIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  INITIAL_ARTICLE_FILTERS,
  countActiveArticleFilters,
  matchesArticleFilters,
  parseArticleFilterSearch,
  serializeArticleFilterSearch,
  type ArticleFilters as Filters,
  type ArticleStatus,
} from "@/lib/articles";
import { cn } from "@/lib/utils";

type FilterOption = { label: string; value: string };

const EMPTY_FILTERS: Filters = { languages: [], statuses: [], tags: [] };
const TAG_SEARCH_THRESHOLD = 8;
const STATUS_OPTIONS = [
  { label: "Current", value: "current" },
  { label: "Archived", value: "archived" },
] as const;

function toggleSelection<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((selectedValue) => selectedValue !== value)
    : [...values, value];
}

function FilterRow({
  checked,
  children,
  onClick,
}: {
  checked: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border text-primary-foreground transition-colors",
          "rounded-[4px]",
          checked ? "border-primary bg-primary" : "border-border bg-background",
        )}
        aria-hidden="true"
      >
        {checked ? <CheckIcon className="size-2.5" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

function ActiveFilterToken({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md border bg-muted/35 pl-2 pr-1 text-xs text-foreground">
      <span className="max-w-32 truncate">{children}</span>
      <button
        type="button"
        className="flex size-5 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${children} filter`}
        onClick={onRemove}
      >
        <XIcon className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}

export function ArticleFilters({
  languages,
  tags,
  total,
  initialVisibleTotal,
}: {
  languages: FilterOption[];
  tags: string[];
  total: number;
  initialVisibleTotal: number;
}) {
  const [filters, setFilters] = useState<Filters>(INITIAL_ARTICLE_FILTERS);
  const [query, setQuery] = useState("");
  const [visibleTotal, setVisibleTotal] = useState(initialVisibleTotal);
  const [urlHydrated, setUrlHydrated] = useState(false);
  const shouldPushHistory = useRef(false);
  const statusHeadingId = useId();
  const languageHeadingId = useId();
  const tagsHeadingId = useId();
  const activeFilterCount = countActiveArticleFilters(filters);
  const selectedLanguages = languages.filter((language) =>
    filters.languages.includes(language.value),
  );
  const filterOptions = useMemo(
    () => ({
      languages: languages.map((language) => language.value),
      tags,
    }),
    [languages, tags],
  );
  const visibleTags = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return tags;

    return tags.filter((tag) =>
      tag.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query, tags]);

  useEffect(() => {
    const restoreFiltersFromUrl = () => {
      shouldPushHistory.current = false;
      setFilters(
        parseArticleFilterSearch(window.location.search, filterOptions),
      );
      setUrlHydrated(true);
    };

    restoreFiltersFromUrl();
    window.addEventListener("popstate", restoreFiltersFromUrl);
    return () => window.removeEventListener("popstate", restoreFiltersFromUrl);
  }, [filterOptions]);

  useEffect(() => {
    if (!urlHydrated) return;
    delete document.documentElement.dataset.articleFiltersPending;
  }, [urlHydrated]);

  useEffect(() => {
    if (!shouldPushHistory.current) return;

    const search = serializeArticleFilterSearch(
      filters,
      window.location.search,
    );
    const nextUrl = `${window.location.pathname}${search}${window.location.hash}`;
    window.history.pushState(null, "", nextUrl);
    shouldPushHistory.current = false;
  }, [filters]);

  useEffect(() => {
    const items = [
      ...document.querySelectorAll<HTMLElement>("[data-article-item]"),
    ];
    const noResults = document.querySelector<HTMLElement>("[data-no-results]");
    let nextVisibleTotal = 0;

    items.forEach((item) => {
      const matches = matchesArticleFilters(
        {
          archived: item.dataset.articleGroup === "archive",
          lang: item.dataset.language ?? "",
          tags: JSON.parse(item.dataset.tags ?? "[]") as string[],
        },
        filters,
      );

      item.hidden = !matches;
      if (matches) nextVisibleTotal += 1;
    });

    if (noResults) noResults.hidden = nextVisibleTotal !== 0;
    setVisibleTotal(nextVisibleTotal);
  }, [activeFilterCount, filters]);

  const updateFilters = (update: (current: Filters) => Filters) => {
    shouldPushHistory.current = true;
    setFilters(update);
  };

  const clearFilters = () => {
    updateFilters(() => EMPTY_FILTERS);
    setQuery("");
  };

  const toggleLanguage = (language: string) => {
    updateFilters((current) => ({
      ...current,
      languages: toggleSelection(current.languages, language),
    }));
  };

  const toggleStatus = (status: ArticleStatus) => {
    updateFilters((current) => ({
      ...current,
      statuses: toggleSelection(current.statuses, status),
    }));
  };

  const toggleTag = (tag: string) => {
    updateFilters((current) => ({
      ...current,
      tags: toggleSelection(current.tags, tag),
    }));
  };

  return (
    <div
      className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y bg-transparent py-1.5 pr-2"
      data-article-filters
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-2 text-muted-foreground shadow-none",
                activeFilterCount > 0 && "text-foreground",
              )}
            >
              <ListFilterIcon className="size-3.5" aria-hidden="true" />
              <span>Filter</span>
              {activeFilterCount > 0 ? (
                <span className="flex min-w-4 items-center justify-center rounded-sm bg-muted px-1 text-[10px] font-semibold leading-4">
                  {activeFilterCount}
                </span>
              ) : (
                <ChevronDownIcon
                  className="size-3.5 opacity-55"
                  aria-hidden="true"
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            collisionPadding={16}
            className="w-[min(18rem,calc(100vw-2rem))] p-1.5"
          >
            <section aria-labelledby={statusHeadingId}>
              <h2
                id={statusHeadingId}
                className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                Status
              </h2>
              <div role="group" aria-labelledby={statusHeadingId}>
                {STATUS_OPTIONS.map((status) => (
                  <FilterRow
                    key={status.value}
                    checked={filters.statuses.includes(status.value)}
                    onClick={() => toggleStatus(status.value)}
                  >
                    {status.label}
                  </FilterRow>
                ))}
              </div>
            </section>

            <div className="mx-2 my-1.5 border-t" aria-hidden="true" />

            <section aria-labelledby={languageHeadingId}>
              <h2
                id={languageHeadingId}
                className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                Language
              </h2>
              <div role="group" aria-labelledby={languageHeadingId}>
                {languages.map((language) => (
                  <FilterRow
                    key={language.value}
                    checked={filters.languages.includes(language.value)}
                    onClick={() => toggleLanguage(language.value)}
                  >
                    {language.label}
                  </FilterRow>
                ))}
              </div>
            </section>

            <div className="mx-2 my-1.5 border-t" aria-hidden="true" />

            {tags.length > TAG_SEARCH_THRESHOLD ? (
              <label className="mb-1 flex h-8 items-center gap-2 border-b px-2 text-muted-foreground">
                <SearchIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only">Search tags</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tags"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
            ) : null}

            <section aria-labelledby={tagsHeadingId}>
              <div className="flex items-center justify-between px-2 pb-1 pt-1">
                <h2
                  id={tagsHeadingId}
                  className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Tags
                </h2>
                {filters.tags.length > 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    {filters.tags.length} selected
                  </span>
                ) : null}
              </div>
              <div
                role="group"
                aria-labelledby={tagsHeadingId}
                className="max-h-52 overflow-y-auto overscroll-contain"
              >
                {visibleTags.map((tag) => (
                  <FilterRow
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </FilterRow>
                ))}
                {visibleTags.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                    No tags found
                  </p>
                ) : null}
              </div>
            </section>
          </PopoverContent>
        </Popover>

        {filters.statuses.map((status) => (
          <ActiveFilterToken key={status} onRemove={() => toggleStatus(status)}>
            {STATUS_OPTIONS.find((option) => option.value === status)?.label}
          </ActiveFilterToken>
        ))}
        {selectedLanguages.map((language) => (
          <ActiveFilterToken
            key={language.value}
            onRemove={() => toggleLanguage(language.value)}
          >
            {language.label}
          </ActiveFilterToken>
        ))}
        {filters.tags.map((tag) => (
          <ActiveFilterToken key={tag} onRemove={() => toggleTag(tag)}>
            {tag}
          </ActiveFilterToken>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span aria-live="polite">
          {activeFilterCount > 0
            ? `${visibleTotal} of ${total}`
            : `${total} articles`}
        </span>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            className="rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={clearFilters}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
