import { NextResponse } from "next/server";
import {
  findActiveById,
  updatePart,
} from "@/repositories/playlist-progress.repository";
import { fetchPlaylistMetadata } from "@/lib/youtube-playlist";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const part = Number(body.part);

    if (!Number.isInteger(part) || part < 1) {
      return NextResponse.json(
        { error: "Parte deve ser um número inteiro >= 1" },
        { status: 400 }
      );
    }

    const existing = await findActiveById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Playlist não encontrada" },
        { status: 404 }
      );
    }

    const meta = await fetchPlaylistMetadata(existing.url, part);
    const playlist = await updatePart(id, part, meta);
    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Failed to update playlist part:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar parte" },
      { status: 500 }
    );
  }
}
