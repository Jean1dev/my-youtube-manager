"use client";

import { useEffect, useState } from "react";
import type { ChannelRanking } from "@/types/youtube-rss-video";

export default function RankingPage() {
  const [ranking, setRanking] = useState<ChannelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/channels/ranking")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar ranking");
        return res.json();
      })
      .then(setRanking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando ranking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhum canal no ranking ainda.
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Marque videos como &quot;Assistir mais tarde&quot; para construir o ranking.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Canais com mais videos marcados como &quot;Assistir mais tarde&quot;
      </p>
      <ol className="flex flex-col gap-3">
        {ranking.map((entry, index) => (
          <li
            key={entry.channelName}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                index === 0
                  ? "bg-yellow-400 text-yellow-900"
                  : index === 1
                  ? "bg-zinc-300 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200"
                  : index === 2
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {index + 1}
            </span>
            <span className="flex-1 font-medium text-zinc-900 dark:text-zinc-100">
              {entry.channelName}
            </span>
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {entry.count} {entry.count === 1 ? "video" : "videos"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
