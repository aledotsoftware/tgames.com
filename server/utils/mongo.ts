import { MongoClient, type Collection, type Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export const useMongo = async (): Promise<Db> => {
  if (db) return db

  const config = useRuntimeConfig()
  const url = config.mongoUrl || 'mongodb://mongodb:27017/tudexgames'

  client = new MongoClient(url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })

  await client.connect()
  db = client.db('tudexgames')
  return db
}

export const useGamesCollection = async (): Promise<Collection> => {
  const database = await useMongo()
  return database.collection('games')
}

export const useBugReportsCollection = async (): Promise<Collection> => {
  const database = await useMongo()
  return database.collection('bug_reports')
}

/**
 * Extracts translated fields from the embedded i18n map.
 * Falls back to the original field if translation is missing.
 */
export const applyTranslation = (doc: any, lang: string) => {
  const i18n = doc.i18n?.[lang]
  return {
    ...doc,
    _id: doc._id?.toString(),
    title: i18n?.title || doc.title,
    description: i18n?.description || doc.description,
    instructions: i18n?.instructions || doc.instructions,
    i18n: undefined
  }
}
