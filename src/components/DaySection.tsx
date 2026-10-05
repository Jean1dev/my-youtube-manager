"use client";

import { VideoCard } from "@/components/VideoCard";
import type { YoutubeRssVideo } from "@/types/youtube-rss-video";

interface DaySectionProps {
  label: string;
  videos: YoutubeRssVideo[];
  collapsible: boolean;
  expanded: boolean;
  onToggle: () => void;
  onWatchLaterChange: (id: string, watchLater: boolean) => void;
}

export function DaySection({
  label,
  videos,
  collapsible,
  expanded,
  onToggle,
  onWatchLaterChange,
}: DaySectionProps) {
  const count = `${videos.length} ${videos.length === 1 ? "vídeo" : "vídeos"}`;
  const isOpen = !collapsible || expanded;

  const headerContent = (
    <>
      {collapsible && (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="first-letter:uppercase">{label}</span>
      <span className="font-normal text-zinc-500 dark:text-zinc-400">· {count}</span>
    </>
  );

  const headerClass =
    "flex w-full items-center gap-2 border-b border-zinc-200 pb-2 text-left text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300";

  return (
    <section className="flex flex-col gap-4">
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className={`${headerClass} cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100`}
        >
          {headerContent}
        </button>
      ) : (
        <h2 className={headerClass}>{headerContent}</h2>
      )}
      {isOpen && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <li key={video._id}>
              <VideoCard video={video} onWatchLaterChange={onWatchLaterChange} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
