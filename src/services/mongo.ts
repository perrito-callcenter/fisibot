import 'dotenv/config';
import * as mongoDB from 'mongodb';
import RegisteredMember from '@models/registeredMember';

const { MONGO_URI } = process.env;

export const collections: {
  registrations?: mongoDB.Collection<RegisteredMember>;
} = {};

export async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env');
  }
  try {
    const mongoClient = new mongoDB.MongoClient(MONGO_URI);

    await mongoClient.connect();

    console.log('Databases:');
    const dbs = await mongoClient.db().admin().listDatabases();
    dbs.databases.forEach(({ name: dbname }) => console.log(` - ${dbname}`));

    const db: mongoDB.Db = mongoClient.db('fisibot-discord');

    const COLLECTION_NAME = 'registrations';

    collections.registrations = db.collection<RegisteredMember>(COLLECTION_NAME);

    if (collections.registrations) {
      console.log(`🐢 Successfully connected to database ${db.databaseName}`);
    }
  }
  catch (error) {
    console.error(error);
  }
}