import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { YoutubeRssVideo } from "@/types/youtube-rss-video";

const COLLECTION = "youtube_rss_videos";

function toVideo(doc: { _id: ObjectId; title?: string; thumb?: string; watchLater?: boolean }): YoutubeRssVideo {
  return {
    _id: doc._id.toString(),
    title: doc.title ?? "",
    thumb: doc.thumb ?? "",
    watchLater: doc.watchLater ?? false,
  };
}

export async function findAll(): Promise<YoutubeRssVideo[]> {
  const database = await getDb();
  const cursor = database.collection(COLLECTION).find({});
  const docs = await cursor.toArray();
  return docs.map(toVideo);
}

export async function updateWatchLater(id: string, watchLater: boolean): Promise<YoutubeRssVideo | null> {
  const database = await getDb();
  const result = await database.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { watchLater } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toVideo(result as { _id: ObjectId; title?: string; thumb?: string; watchLater?: boolean });
}
