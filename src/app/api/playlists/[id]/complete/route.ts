import { NextResponse } from "next/server";
import { markCompleted } from "@/repositories/playlist-progress.repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlist = await markCompleted(id);
    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist não encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Failed to complete playlist:", error);
    return NextResponse.json(
      { error: "Falha ao concluir playlist" },
      { status: 500 }
    );
  }
}
