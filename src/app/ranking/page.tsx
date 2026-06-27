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

  const handleIgnore = async (channelName: string) => {
    const optimisticUntil = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    setRanking((prev) =>
      prev.map((e) =>
        e.channelName === channelName ? { ...e, ignoredUntil: optimisticUntil } : e
      )
    );
    try {
      const res = await fetch("/api/channels/ranking/ignore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, days: 3 }),
      });
      if (!res.ok) throw new Error("Falha ao ignorar canal");
      const data: { ignoredUntil: string } = await res.json();
      setRanking((prev) =>
        prev.map((e) =>
          e.channelName === channelName
            ? { ...e, ignoredUntil: data.ignoredUntil }
            : e
        )
      );
    } catch {
      setRanking((prev) =>
        prev.map((e) =>
          e.channelName === channelName ? { ...e, ignoredUntil: null } : e
        )
      );
    }
  };

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
        {ranking.map((entry, index) => {
          const isIgnored = Boolean(entry.ignoredUntil);
          const canIgnore = index < 10;
          return (
            <li
              key={entry.channelName}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
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
              {canIgnore &&
                (isIgnored ? (
                  <span className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Ignorado até{" "}
                    {new Date(entry.ignoredUntil as string).toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIgnore(entry.channelName)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    Ignorar por 3 dias
                  </button>
                ))}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
