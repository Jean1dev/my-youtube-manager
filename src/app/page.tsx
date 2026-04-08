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
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">Carregando vídeos...</p>
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

  if (videos.length === 0) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400">
        Nenhum vídeo encontrado.
      </p>
    );
  }

  return (
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
  );
}
