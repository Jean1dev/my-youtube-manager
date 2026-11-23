export function extractPlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("youtube.com") && !parsed.hostname.includes("youtu.be")) {
      return null;
    }
    const list = parsed.searchParams.get("list");
    return list && list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

export function normalizePlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

function videoThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export async function fetchPlaylistMetadata(
  url: string,
  part?: number
): Promise<{ title: string; thumb: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Accept: "text/html",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return { title: "", thumb: "" };
    const html = await res.text();
    const title =
      matchMeta(html, "og:title") ||
      matchMeta(html, "twitter:title") ||
      matchPlaylistTitle(html) ||
      "";
    const videoIds = extractPlaylistVideoIds(html);
    const partIndex = typeof part === "number" && part >= 1 ? part - 1 : -1;
    const partVideoId =
      partIndex >= 0 && partIndex < videoIds.length ? videoIds[partIndex] : null;
    const thumb = partVideoId
      ? videoThumbUrl(partVideoId)
      : decodeHtmlEntities(
          matchMeta(html, "og:image") || matchMeta(html, "twitter:image") || ""
        );
    return { title: decodeHtmlEntities(title), thumb };
  } catch (error) {
    console.error("Failed to fetch playlist metadata:", error);
    return { title: "", thumb: "" };
  }
}

function extractPlaylistVideoIds(html: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const playlistVideoPattern =
    /"playlistVideoRenderer"\s*:\s*\{[^{}]*?"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/g;
  let match: RegExpExecArray | null;
  while ((match = playlistVideoPattern.exec(html)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  if (ids.length > 0) return ids;

  const fallback = /"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/g;
  while ((match = fallback.exec(html)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function matchPlaylistTitle(html: string): string {
  const match = html.match(
    /"playlistMetadataRenderer"\s*:\s*\{\s*"title"\s*:\s*"((?:\\.|[^"\\])*)"/
  );
  if (!match?.[1]) return "";
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
}

function matchMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
