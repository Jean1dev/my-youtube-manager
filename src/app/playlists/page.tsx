"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PlaylistCard } from "@/components/PlaylistCard";
import type { PlaylistProgress } from "@/types/playlist-progress";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [part, setPart] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/playlists")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar playlists");
        return res.json();
      })
      .then(setPlaylists)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const partNumber = Number(part);
    if (!url.trim()) {
      setFormError("Informe a URL da playlist");
      return;
    }
    if (!Number.isInteger(partNumber) || partNumber < 1) {
      setFormError("Parte deve ser um número inteiro >= 1");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), part: partNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Falha ao salvar playlist");
        return;
      }
      setPlaylists((prev) => {
        const without = prev.filter((p) => p.playlistId !== data.playlistId);
        return [data, ...without];
      });
      setUrl("");
      setPart("1");
    } catch {
      setFormError("Falha ao salvar playlist");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePartChange = async (id: string, nextPart: number) => {
    const previous = playlists;
    setPlaylists((prev) =>
      prev
        .map((p) =>
          p._id === id
            ? { ...p, part: nextPart, updatedAt: new Date().toISOString() }
            : p
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    );
    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: nextPart }),
      });
      if (!res.ok) {
        setPlaylists(previous);
        return;
      }
      const data: PlaylistProgress = await res.json();
      setPlaylists((prev) => {
        const without = prev.filter((p) => p._id !== id);
        return [data, ...without];
      });
    } catch {
      setPlaylists(previous);
    }
  };

  const handleComplete = async (id: string) => {
    const previous = playlists;
    setPlaylists((prev) => prev.filter((p) => p._id !== id));
    try {
      const res = await fetch(`/api/playlists/${id}/complete`, {
        method: "POST",
      });
      if (!res.ok) {
        setPlaylists(previous);
      }
    } catch {
      setPlaylists(previous);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">
          Carregando playlists...
        </p>
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

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          URL da playlist
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="flex w-full flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400 sm:w-28">
          Parte
          <input
            type="number"
            min={1}
            value={part}
            onChange={(e) => setPart(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {formError && (
        <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
      )}

      {playlists.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Nenhuma playlist em andamento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onPartChange={handlePartChange}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
