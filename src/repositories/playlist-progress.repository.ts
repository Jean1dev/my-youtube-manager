import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { PlaylistProgress } from "@/types/playlist-progress";

const COLLECTION = "playlist_progress";

interface PlaylistDoc {
  _id: ObjectId;
  url: string;
  playlistId: string;
  part: number;
  title?: string;
  thumb?: string;
  completed?: boolean;
  updatedAt: Date;
  createdAt: Date;
}

function toPlaylist(doc: PlaylistDoc): PlaylistProgress {
  return {
    _id: doc._id.toString(),
    url: doc.url,
    playlistId: doc.playlistId,
    part: doc.part,
    title: doc.title ?? "",
    thumb: doc.thumb ?? "",
    completed: doc.completed ?? false,
    updatedAt: doc.updatedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function findActive(): Promise<PlaylistProgress[]> {
  const database = await getDb();
  const docs = await database
    .collection(COLLECTION)
    .find({ completed: { $ne: true } })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map((doc) => toPlaylist(doc as unknown as PlaylistDoc));
}

export async function upsertByPlaylistId(input: {
  url: string;
  playlistId: string;
  part: number;
  title: string;
  thumb: string;
}): Promise<PlaylistProgress> {
  const database = await getDb();
  const now = new Date();
  const existing = await database
    .collection(COLLECTION)
    .findOne({ playlistId: input.playlistId });

  if (existing) {
    const result = await database.collection(COLLECTION).findOneAndUpdate(
      { playlistId: input.playlistId },
      {
        $set: {
          url: input.url,
          part: input.part,
          title: input.title || (existing.title as string) || "",
          thumb: input.thumb || (existing.thumb as string) || "",
          completed: false,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );
    return toPlaylist(result as unknown as PlaylistDoc);
  }

  const doc = {
    url: input.url,
    playlistId: input.playlistId,
    part: input.part,
    title: input.title || "",
    thumb: input.thumb || "",
    completed: false,
    updatedAt: now,
    createdAt: now,
  };
  const inserted = await database.collection(COLLECTION).insertOne(doc);
  return toPlaylist({ _id: inserted.insertedId, ...doc });
}

export async function findActiveById(
  id: string
): Promise<PlaylistProgress | null> {
  const database = await getDb();
  const doc = await database.collection(COLLECTION).findOne({
    _id: new ObjectId(id),
    completed: { $ne: true },
  });
  if (!doc) return null;
  return toPlaylist(doc as unknown as PlaylistDoc);
}

export async function updatePart(
  id: string,
  part: number,
  meta?: { title?: string; thumb?: string }
): Promise<PlaylistProgress | null> {
  const database = await getDb();
  const existing = await findActiveById(id);
  if (!existing) return null;

  const result = await database.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        part,
        title: meta?.title || existing.title || "",
        thumb: meta?.thumb || existing.thumb || "",
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toPlaylist(result as unknown as PlaylistDoc);
}

export async function markCompleted(
  id: string
): Promise<PlaylistProgress | null> {
  const database = await getDb();
  const result = await database.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id), completed: { $ne: true } },
    { $set: { completed: true, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  if (!result) return null;
  return toPlaylist(result as unknown as PlaylistDoc);
}
