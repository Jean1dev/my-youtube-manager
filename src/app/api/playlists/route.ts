import { NextResponse } from "next/server";
import {
  findActive,
  upsertByPlaylistId,
} from "@/repositories/playlist-progress.repository";
import {
  extractPlaylistId,
  fetchPlaylistMetadata,
  normalizePlaylistUrl,
} from "@/lib/youtube-playlist";

export async function GET() {
  try {
    const playlists = await findActive();
    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Failed to list playlists:", error);
    return NextResponse.json(
      { error: "Falha ao listar playlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const part = Number(body.part);

    if (!url) {
      return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });
    }
    if (!Number.isInteger(part) || part < 1) {
      return NextResponse.json(
        { error: "Parte deve ser um número inteiro >= 1" },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      return NextResponse.json(
        { error: "URL de playlist inválida" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizePlaylistUrl(playlistId);
    const meta = await fetchPlaylistMetadata(normalizedUrl, part);
    const playlist = await upsertByPlaylistId({
      url: normalizedUrl,
      playlistId,
      part,
      title: meta.title,
      thumb: meta.thumb,
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Failed to upsert playlist:", error);
    return NextResponse.json(
      { error: "Falha ao salvar playlist" },
      { status: 500 }
    );
  }
}
