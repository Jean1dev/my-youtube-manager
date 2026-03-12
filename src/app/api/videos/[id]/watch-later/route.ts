import { NextRequest, NextResponse } from "next/server";
import { updateWatchLater } from "@/repositories/youtube-rss-videos.repository";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { watchLater?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido ou ausente. Envie { \"watchLater\": true | false }" },
      { status: 400 }
    );
  }
  if (typeof body.watchLater !== "boolean") {
    return NextResponse.json(
      { error: "O campo watchLater é obrigatório e deve ser um boolean" },
      { status: 400 }
    );
  }
  try {
    const video = await updateWatchLater(id, body.watchLater);
    if (!video) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar watch later" },
      { status: 500 }
    );
  }
}