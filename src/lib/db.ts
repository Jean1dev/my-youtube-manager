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
    try {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db(dbName);
      return db;
    } catch (error) {
      connectionPromise = null;
      client = null;
      db = null;
      throw error;
    }
  })();
  return connectionPromise;
}
