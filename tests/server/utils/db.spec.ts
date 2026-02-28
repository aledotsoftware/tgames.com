import { describe, it, expect, vi, beforeEach } from 'vitest'
import mysql from 'mysql2/promise'

// Mocks
vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn().mockReturnValue({ isMock: true }),
  },
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  database: {
    host: 'test-host',
    port: 3307,
    user: 'test-user',
    pass: 'test-pass',
    name: 'test-db'
  }
}))

describe('useDB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should initialize a database pool with config values', async () => {
    const dbModule = await import('../../../server/utils/db?cache-bust=' + Date.now())
    const dbUseDB = dbModule.useDB

    const pool = dbUseDB()

    expect(mysql.createPool).toHaveBeenCalledTimes(1)
    expect(mysql.createPool).toHaveBeenCalledWith({
      host: 'test-host',
      port: 3307,
      user: 'test-user',
      password: 'test-pass',
      database: 'test-db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: false
    })

    expect(pool).toEqual({ isMock: true })
  })

  it('should return the same pool instance on subsequent calls', async () => {
    const dbModule = await import('../../../server/utils/db?cache-bust=' + Date.now())
    const dbUseDB = dbModule.useDB

    const pool1 = dbUseDB()
    const pool2 = dbUseDB()

    expect(pool1).toBe(pool2)
    // createPool should only be called once per module load
    expect(mysql.createPool).toHaveBeenCalledTimes(1)
  })
})
