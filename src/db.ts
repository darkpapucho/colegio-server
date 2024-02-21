import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
config()

export const mongoClient = new MongoClient(process.env.MONGO_URI!)
