import { MongoClient } from "mongodb";
const globalMongo = globalThis as typeof globalThis & {
  mongoPromise?: Promise<MongoClient>;
};
export async function database() {
  if (!process.env.MONGODB_URI) throw new Error("MongoDB is not configured.");
  globalMongo.mongoPromise ??= new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .connect()
    .catch((error) => {
      globalMongo.mongoPromise = undefined;
      throw error;
    });
  return (await globalMongo.mongoPromise).db(
    process.env.MONGODB_DB || "devalaya",
  );
}
