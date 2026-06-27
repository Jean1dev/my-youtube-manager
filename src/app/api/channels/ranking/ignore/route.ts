import { NextRequest, NextResponse } from "next/server";
import { ignoreChannel } from "@/repositories/youtube-rss-videos.repository";

const DEFAULT_IGNORE_DAYS = 3;

export async function POST(request: NextRequest) {
  let body: { channelName?: unknown; days?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido ou ausente. Envie { \"channelName\": string }" },
      { status: 400 }
    );
  }
  if (typeof body.channelName !== "string" || body.channelName.trim() === "") {
    return NextResponse.json(
      { error: "O campo channelName é obrigatório e deve ser uma string não vazia" },
      { status: 400 }
    );
  }
  const days =
    typeof body.days === "number" && body.days > 0 ? body.days : DEFAULT_IGNORE_DAYS;
  try {
    const ignoredUntil = await ignoreChannel(body.channelName, days);
    if (!ignoredUntil) {
      return NextResponse.json(
        { error: "Canal não encontrado no ranking" },
        { status: 404 }
      );
    }
    return NextResponse.json({ channelName: body.channelName, ignoredUntil });
  } catch {
    return NextResponse.json(
      { error: "Falha ao ignorar canal" },
      { status: 500 }
    );
  }
}
