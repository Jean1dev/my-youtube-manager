"use client";

import { useEffect, useMemo, useState } from "react";
import { DaySection } from "@/components/DaySection";
import type { YoutubeRssVideo } from "@/types/youtube-rss-video";

interface DayGroup {
  key: string;
  label: string;
  videos: YoutubeRssVideo[];
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(date) === dayKey(today)) return "Hoje";
  if (dayKey(date) === dayKey(yesterday)) return "Ontem";
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Videos come sorted newest first, so groups keep that order.
function groupByDay(videos: YoutubeRssVideo[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const video of videos) {
    const date = new Date(video.createdAt);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.videos.push(video);
    } else {
      groups.push({ key, label: dayLabel(date), videos: [video] });
    }
  }
  return groups;
}

export default function Home() {
  const [videos, setVideos] = useState<YoutubeRssVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string> | null>(null);

  const groups = useMemo(() => groupByDay(videos), [videos]);
  // Until the user toggles something, only the most recent day is open.
  const openDays = expanded ?? new Set(groups.slice(0, 1).map((g) => g.key));

  const toggleDay = (key: string) => {
    const next = new Set(openDays);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded(next);
  };

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
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <DaySection
          key={group.key}
          label={group.label}
          videos={group.videos}
          collapsible={groups.length > 1}
          expanded={openDays.has(group.key)}
          onToggle={() => toggleDay(group.key)}
          onWatchLaterChange={handleWatchLaterChange}
        />
      ))}
    </div>
  );
}
