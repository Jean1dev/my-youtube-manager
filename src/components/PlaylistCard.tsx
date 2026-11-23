"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PlaylistProgress } from "@/types/playlist-progress";

interface PlaylistCardProps {
  playlist: PlaylistProgress;
  onPartChange: (id: string, part: number) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

export function PlaylistCard({
  playlist,
  onPartChange,
  onComplete,
}: PlaylistCardProps) {
  const [part, setPart] = useState(String(playlist.part));
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setPart(String(playlist.part));
  }, [playlist.part]);

  const handleSavePart = async () => {
    const next = Number(part);
    if (!Number.isInteger(next) || next < 1 || next === playlist.part) return;
    setSaving(true);
    try {
      await onPartChange(playlist._id, next);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(playlist._id);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <a
        href={playlist.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-video w-full shrink-0 bg-zinc-100 dark:bg-zinc-800"
      >
        {playlist.thumb ? (
          <Image
            src={playlist.thumb}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            Sem thumbnail
          </div>
        )}
      </a>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 min-h-[2.5em] text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 sm:text-base">
            {playlist.title || playlist.playlistId}
          </h2>
          <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Parte {playlist.part}
          </span>
        </div>
        <a
          href={playlist.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Abrir no YouTube
        </a>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Parte</span>
            <input
              type="number"
              min={1}
              value={part}
              onChange={(e) => setPart(e.target.value)}
              className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
          <button
            type="button"
            onClick={handleSavePart}
            disabled={saving || Number(part) === playlist.part}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {completing ? "Concluindo..." : "Concluir"}
          </button>
        </div>
      </div>
    </article>
  );
}
