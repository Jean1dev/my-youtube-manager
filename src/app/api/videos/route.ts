import { NextResponse } from "next/server";
import { findAll } from "@/repositories/youtube-rss-videos.repository";

export async function GET() {
  try {
    const videos = await findAll();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao listar vídeos" },
      { status: 500 }
    );
  }
}
