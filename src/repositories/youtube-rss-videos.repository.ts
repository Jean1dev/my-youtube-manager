import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { YoutubeRssVideo, ChannelRanking } from "@/types/youtube-rss-video";

const COLLECTION = "youtube_rss_videos";
const RANKINGS_COLLECTION = "channel_rankings";
const DEFAULT_IGNORE_DAYS = 3;

function toVideo(doc: { _id: ObjectId; title?: string; thumb?: string; channelName?: string; watchLater?: boolean }): YoutubeRssVideo {
  return {
    _id: doc._id.toString(),
    title: doc.title ?? "",
    thumb: doc.thumb ?? "",
    channelName: doc.channelName ?? "",
    watchLater: doc.watchLater ?? false,
  };
}

export async function getIgnoredChannelNames(): Promise<string[]> {
  const database = await getDb();
  const docs = await database
    .collection(RANKINGS_COLLECTION)
    .find({ ignoredUntil: { $gt: new Date() } })
    .project({ channelName: 1 })
    .toArray();
  return docs.map((doc) => doc.channelName as string);
}

export async function findAll(): Promise<YoutubeRssVideo[]> {
  const database = await getDb();
  const ignored = await getIgnoredChannelNames();
  const filter = ignored.length > 0 ? { channelName: { $nin: ignored } } : {};
  const cursor = database.collection(COLLECTION).find(filter).sort({ _id: -1 });
  const docs = await cursor.toArray();
  return docs.map(toVideo);
}

export async function getChannelRanking(): Promise<ChannelRanking[]> {
  const database = await getDb();
  const now = new Date();
  const docs = await database
    .collection(RANKINGS_COLLECTION)
    .find({ count: { $gt: 0 } })
    .sort({ count: -1 })
    .toArray();
  return docs.map((doc) => {
    const ignoredUntil = doc.ignoredUntil as Date | undefined;
    const active = ignoredUntil instanceof Date && ignoredUntil > now;
    return {
      channelName: doc.channelName as string,
      count: doc.count as number,
      ignoredUntil: active ? ignoredUntil.toISOString() : null,
    };
  });
}

export async function ignoreChannel(
  channelName: string,
  days: number = DEFAULT_IGNORE_DAYS
): Promise<string | null> {
  const database = await getDb();
  const ignoredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const result = await database.collection(RANKINGS_COLLECTION).findOneAndUpdate(
    { channelName },
    { $set: { ignoredUntil } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return ignoredUntil.toISOString();
}

export async function updateWatchLater(id: string, watchLater: boolean): Promise<YoutubeRssVideo | null> {
  const database = await getDb();
  const result = await database.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { watchLater } },
    { returnDocument: "after" }
  );
  if (!result) return null;

  const video = toVideo(result as { _id: ObjectId; title?: string; thumb?: string; channelName?: string; watchLater?: boolean });

  if (video.channelName) {
    const delta = watchLater ? 1 : -1;
    await database.collection(RANKINGS_COLLECTION).updateOne(
      { channelName: video.channelName },
      { $inc: { count: delta } },
      { upsert: true }
    );
    // Remove channels that reach 0 or below
    await database.collection(RANKINGS_COLLECTION).deleteMany({ count: { $lte: 0 } });
  }

  return video;
}
