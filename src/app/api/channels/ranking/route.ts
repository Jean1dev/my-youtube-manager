import { NextResponse } from "next/server";
import { getChannelRanking } from "@/repositories/youtube-rss-videos.repository";

export async function GET() {
  try {
    const ranking = await getChannelRanking();
    return NextResponse.json(ranking);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao carregar ranking de canais" },
      { status: 500 }
    );
  }
}
