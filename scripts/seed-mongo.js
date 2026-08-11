import { createReadStream, existsSync } from 'fs'
import { createGunzip } from 'zlib'
import readline from 'readline'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017/tudexgames'

async function runSeed() {
  console.log('🔌 Conectando a MongoDB:', MONGO_URL)
  const client = new MongoClient(MONGO_URL, {
    serverSelectionTimeoutMS: 5000
  })
  
  try {
    await client.connect()
    const db = client.db('tudexgames')
    const gamesCol = db.collection('games')

    console.log('📐 Verificando índices...')
    await gamesCol.createIndex({ slug: 1 }, { unique: true })
    await gamesCol.createIndex({ published: 1, upvote: -1, views: -1, id: -1 })
    await gamesCol.createIndex({ published: 1, category: 1, views: -1 })
    await gamesCol.createIndex({ id: 1 }, { unique: true })
    await gamesCol.createIndex({ title: 'text' })

    const currentCount = await gamesCol.countDocuments()
    console.log(`📊 Juegos actuales en MongoDB: ${currentCount}`)

    if (currentCount > 0) {
      console.log('✅ MongoDB ya contiene juegos. Saltando auto-seed.')
      await client.close()
      return
    }

    const seedFile = './scripts/games_seed.json.gz'
    if (!existsSync(seedFile)) {
      console.log('⚠️ No se encontró el archivo de seed en:', seedFile)
      await client.close()
      return
    }

    console.log('🚀 Iniciando sembrado de 26,777 juegos desde games_seed.json.gz...')
    const fileStream = createReadStream(seedFile)
    const unzipStream = createGunzip()
    const rl = readline.createInterface({
      input: fileStream.pipe(unzipStream),
      crlfDelay: Infinity
    })

    let batch = []
    let totalInserted = 0
    const BATCH_SIZE = 1000

    for await (const line of rl) {
      if (!line.trim()) continue
      try {
        const doc = JSON.parse(line)
        if (doc._id && doc._id.$oid) {
          delete doc._id
        }
        batch.push(doc)
        if (batch.length >= BATCH_SIZE) {
          await gamesCol.insertMany(batch, { ordered: false })
          totalInserted += batch.length
          console.log(`📦 Insertados ${totalInserted} juegos...`)
          batch = []
        }
      } catch (e) {
        console.error('Error parseando línea:', e)
      }
    }

    if (batch.length > 0) {
      await gamesCol.insertMany(batch, { ordered: false })
      totalInserted += batch.length
    }

    console.log(`🎉 Sembrado completado exitosamente! Total juegos insertados: ${totalInserted}`)
    await client.close()
  } catch (err) {
    console.error('❌ Error durante el sembrado:', err.message)
  }
}

runSeed()
