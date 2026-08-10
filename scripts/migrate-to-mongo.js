/**
 * scripts/migrate-to-mongo.js
 * Migra todos los juegos de MySQL a MongoDB
 * embebiendo las traducciones en el campo i18n de cada documento.
 *
 * Uso:
 *   node scripts/migrate-to-mongo.js
 *
 * Variables de entorno (opcionales, usa defaults de Docker):
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB
 *   MONGO_URL
 */

import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'

const BATCH_SIZE = 500

const mysqlConfig = {
  host:     process.env.MYSQL_HOST || '127.0.0.1',
  port:     Number(process.env.MYSQL_PORT) || 3307,
  user:     process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || 'root',
  database: process.env.MYSQL_DB   || 'tudexgames',
  waitForConnections: true,
  connectionLimit: 5
}

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tudexgames'

async function migrate() {
  console.log('🔌 Conectando a MySQL...')
  const pool = mysql.createPool(mysqlConfig)

  console.log('🔌 Conectando a MongoDB...')
  const mongo = new MongoClient(MONGO_URL)
  await mongo.connect()

  const db = mongo.db('tudexgames')
  const gamesCol = db.collection('games')

  // Crear índices
  console.log('📐 Creando índices en MongoDB...')
  await gamesCol.createIndex({ slug: 1 }, { unique: true })
  await gamesCol.createIndex({ published: 1, upvote: -1, views: -1, id: -1 })
  await gamesCol.createIndex({ published: 1, category: 1, views: -1 })
  await gamesCol.createIndex({ id: 1 }, { unique: true })
  await gamesCol.createIndex({ title: 'text' })
  console.log('✅ Índices creados')

  // Contar juegos
  const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM games WHERE published = 1')
  console.log(`🎮 Total de juegos a migrar: ${total}`)

  let offset = 0
  let migrated = 0

  while (offset < total) {
    // Leer batch de juegos
    const [games] = await pool.query(
      `SELECT id, slug, title, description, instructions, category, source,
              game_type, url, thumb_1, thumb_2, thumb_small,
              width, height, tags, views, upvote, downvote,
              published, is_mobile, is_premium, last_modified, data, fields, extra_fields
       FROM games
       WHERE published = 1
       ORDER BY id
       LIMIT ? OFFSET ?`,
      [BATCH_SIZE, offset]
    )

    if (games.length === 0) break

    const ids = games.map(g => g.id)

    // Leer todas las traducciones de este batch
    const [translations] = await pool.query(
      `SELECT content_id, language, field, translation
       FROM translations
       WHERE content_id IN (?) AND content_type = 'game' AND field IN ('title', 'description', 'instructions')`,
      [ids]
    )

    // Construir mapa: id → { lang → { field → value } }
    const i18nMap = {}
    for (const t of translations) {
      if (!i18nMap[t.content_id]) i18nMap[t.content_id] = {}
      if (!i18nMap[t.content_id][t.language]) i18nMap[t.content_id][t.language] = {}
      i18nMap[t.content_id][t.language][t.field] = t.translation
    }

    // Construir documentos MongoDB
    const docs = games.map(g => ({
      id:           g.id,
      slug:         g.slug,
      title:        g.title,
      description:  g.description,
      instructions: g.instructions,
      category:     g.category,
      source:       g.source,
      game_type:    g.game_type,
      url:          g.url,
      thumb_1:      g.thumb_1,
      thumb_2:      g.thumb_2,
      thumb_small:  g.thumb_small,
      width:        g.width,
      height:       g.height,
      tags:         g.tags ? g.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      views:        g.views   || 0,
      upvote:       g.upvote  || 0,
      downvote:     g.downvote|| 0,
      published:    g.published,
      is_mobile:    g.is_mobile,
      is_premium:   g.is_premium,
      last_modified: g.last_modified ? new Date(g.last_modified) : null,
      i18n:         i18nMap[g.id] || {}   // ← traducciones embebidas
    }))

    // Upsert batch en MongoDB
    const ops = docs.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $set: doc },
        upsert: true
      }
    }))

    await gamesCol.bulkWrite(ops, { ordered: false })

    migrated += games.length
    offset   += BATCH_SIZE
    const pct = Math.round((migrated / total) * 100)
    process.stdout.write(`\r⚙️  Migrados: ${migrated}/${total} (${pct}%)   `)
  }

  console.log(`\n✅ Migración completada: ${migrated} juegos`)

  // Verificación rápida
  const count = await gamesCol.countDocuments()
  console.log(`🔍 Verificación: ${count} documentos en MongoDB`)

  const sample = await gamesCol.findOne({}, { projection: { slug: 1, title: 1, 'i18n.es': 1, 'i18n.fr': 1 } })
  if (sample) {
    console.log('📄 Muestra:', JSON.stringify(sample, null, 2))
  }

  await pool.end()
  await mongo.close()
  console.log('🎉 ¡Listo!')
}

migrate().catch(err => {
  console.error('❌ Error en migración:', err)
  process.exit(1)
})
