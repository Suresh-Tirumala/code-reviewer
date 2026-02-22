import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'ai_code_reviewer';

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to your .env file.');
  }

  return { uri, dbName };
};

export const connectToDatabase = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  const { uri, dbName } = getMongoConfig();

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
};

export const getCollection = async (collectionName) => {
  const db = await connectToDatabase();
  return db.collection(collectionName);
};
