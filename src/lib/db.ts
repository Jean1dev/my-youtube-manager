import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = "agiobot";

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    return db;
  })();
  return connectionPromise;
}