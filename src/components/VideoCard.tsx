"use client";

import Image from "next/image";
import type { YoutubeRssVideo } from "@/types/youtube-rss-video";

interface VideoCardProps {
  video: YoutubeRssVideo;
  onWatchLaterChange: (id: string, watchLater: boolean) => void;
}

export function VideoCard({ video, onWatchLaterChange }: VideoCardProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWatchLaterChange(video._id, e.target.checked);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-video w-full shrink-0 bg-zinc-100 dark:bg-zinc-800">
        {video.thumb ? (
          <Image
            src={video.thumb}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">Sem thumbnail</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        {video.channelName && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
            {video.channelName}
          </p>
        )}
        <h2 className="line-clamp-2 min-h-[2.5em] text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 sm:text-base">
          {video.title || "Sem título"}
        </h2>
        <label className="mt-auto flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={video.watchLater ?? false}
            onChange={handleChange}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600"
          />
          <span>Assistir mais tarde</span>
        </label>
      </div>
    </article>
  );
}
