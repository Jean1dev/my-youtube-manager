import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { YoutubeRssVideo, ChannelRanking } from "@/types/youtube-rss-video";

const COLLECTION = "youtube_rss_videos";
const RANKINGS_COLLECTION = "channel_rankings";

function toVideo(doc: { _id: ObjectId; title?: string; thumb?: string; channelName?: string; watchLater?: boolean }): YoutubeRssVideo {
  return {
    _id: doc._id.toString(),
    title: doc.title ?? "",
    thumb: doc.thumb ?? "",
    channelName: doc.channelName ?? "",
    watchLater: doc.watchLater ?? false,
  };
}

export async function findAll(): Promise<YoutubeRssVideo[]> {
  const database = await getDb();
  const cursor = database.collection(COLLECTION).find({}).sort({ _id: -1 });
  const docs = await cursor.toArray();
  return docs.map(toVideo);
}

export async function getChannelRanking(): Promise<ChannelRanking[]> {
  const database = await getDb();
  const docs = await database
    .collection(RANKINGS_COLLECTION)
    .find({ count: { $gt: 0 } })
    .sort({ count: -1 })
    .toArray();
  return docs.map((doc) => ({
    channelName: doc.channelName as string,
    count: doc.count as number,
  }));
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
