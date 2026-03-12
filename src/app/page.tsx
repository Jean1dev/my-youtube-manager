"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import type { YoutubeRssVideo } from "@/types/youtube-rss-video";

export default function Home() {
  const [videos, setVideos] = useState<YoutubeRssVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar vídeos");
        return res.json();
      })
      .then(setVideos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleWatchLaterChange = async (id: string, watchLater: boolean) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === id ? { ...v, watchLater } : v))
    );
    try {
      const res = await fetch(`/api/videos/${id}/watch-later`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchLater }),
      });
      if (!res.ok) {
        setVideos((prev) =>
          prev.map((v) => (v._id === id ? { ...v, watchLater: !watchLater } : v))
        );
      }
    } catch {
      setVideos((prev) =>
        prev.map((v) => (v._id === id ? { ...v, watchLater: !watchLater } : v))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando vídeos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/95">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
          YouTube RSS
        </h1>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {videos.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Nenhum vídeo encontrado.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <li key={video._id}>
                <VideoCard
                  video={video}
                  onWatchLaterChange={handleWatchLaterChange}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
