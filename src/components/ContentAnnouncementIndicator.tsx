import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getRecentContentAnnouncements,
  getUnreadContentAnnouncements,
  readSeenContentPaths,
  serializeSeenContentPaths,
  type ContentAnnouncement,
} from "@/lib/content-announcements";
import { isExternalUrl } from "@/lib/navigation";

const STORAGE_KEY = "content-announcements:v1";

export function ContentAnnouncementIndicator({
  announcements,
}: {
  announcements: ContentAnnouncement[];
}) {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [autoTooltipOpen, setAutoTooltipOpen] = useState(false);
  const [autoTooltipDismissed, setAutoTooltipDismissed] = useState(false);
  const [dismissalPending, setDismissalPending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<
    ContentAnnouncement[]
  >([]);
  const [seenPaths, setSeenPaths] = useState<string[]>([]);

  useEffect(() => {
    const storedPaths = readSeenContentPaths(
      window.localStorage,
      STORAGE_KEY,
    );
    const unread = getUnreadContentAnnouncements(
      getRecentContentAnnouncements(announcements),
      storedPaths,
    );

    setSeenPaths(storedPaths);
    setUnreadAnnouncements(unread);
    setHasUnread(unread.length > 0);
  }, [announcements]);

  useEffect(() => {
    if (!hasUnread || autoTooltipDismissed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const showTimeout = window.setTimeout(() => {
      setAutoTooltipOpen(true);
    }, 1500);
    const hideTimeout = window.setTimeout(() => {
      setAutoTooltipOpen(false);
    }, 4500);

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [autoTooltipDismissed, hasUnread]);

  useEffect(() => {
    if (!dismissalPending) return;

    const fallbackTimeout = window.setTimeout(() => {
      setUnreadAnnouncements([]);
      setDismissalPending(false);
    }, 300);

    return () => {
      window.clearTimeout(fallbackTimeout);
    };
  }, [dismissalPending]);

  const handleTooltipOpenChange = (nextOpen: boolean) => {
    setTooltipOpen(nextOpen);

    if (nextOpen) {
      setAutoTooltipOpen(false);
      setAutoTooltipDismissed(true);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setTooltipOpen(false);
      setAutoTooltipOpen(false);
      setAutoTooltipDismissed(true);
      setDismissalPending(false);
    }

    if (nextOpen && hasUnread) {
      const openedPaths = unreadAnnouncements.map(({ href }) => href);
      const nextSeenPaths = [...new Set([...seenPaths, ...openedPaths])];

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          serializeSeenContentPaths(seenPaths, openedPaths),
        );
      } catch {
        // The indicator still works for this session when storage is blocked.
      }

      setSeenPaths(nextSeenPaths);
      setHasUnread(false);
    }

    if (!nextOpen && !hasUnread) {
      setDismissalPending(true);
    }
  };

  if (unreadAnnouncements.length === 0) return null;

  return (
    <div className="pointer-events-auto fixed right-5 top-5 z-40 sm:right-8 sm:top-8">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Tooltip
          open={!open && (tooltipOpen || autoTooltipOpen)}
          onOpenChange={handleTooltipOpenChange}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground active:scale-[0.96]"
                aria-label="What's new"
              >
                <span className="relative flex size-2" aria-hidden="true">
                  {hasUnread ? (
                    <span className="absolute inline-flex size-full rounded-full bg-foreground/40 motion-safe:animate-ping" />
                  ) : null}
                  <span className="relative inline-flex size-2 rounded-full bg-foreground" />
                </span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="left" sideOffset={8}>
            What's new
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="w-72 p-2"
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.currentTarget.dataset.state === "closed" &&
              dismissalPending
            ) {
              setUnreadAnnouncements([]);
              setDismissalPending(false);
            }
          }}
        >
          <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
            What's new
          </p>
          <ul>
            {unreadAnnouncements.map((announcement) => {
              const external = isExternalUrl(announcement.href);

              return (
                <li key={announcement.href}>
                  <a
                    href={announcement.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="block rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block text-[11px] font-medium capitalize text-muted-foreground">
                      {announcement.type}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium leading-snug">
                      {announcement.title}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
