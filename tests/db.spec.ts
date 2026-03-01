import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mysql from 'mysql2/promise';

vi.mock('mysql2/promise', () => {
    return {
        default: {
            createPool: vi.fn(() => ({ isMockPool: true }))
        }
    };
});

// Mock console.log to keep test output clean
const originalConsoleLog = console.log;

describe('useDB', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        console.log = vi.fn();

        vi.stubGlobal('useRuntimeConfig', () => ({
            database: {
                host: 'test-host',
                port: 3306,
                user: 'test-user',
                pass: 'test-pass',
                name: 'test-db'
            }
        }));
    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('should initialize the database pool with runtime config on first call', async () => {
        const { useDB } = await import('../server/utils/db');
        const pool1 = useDB();

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(mysql.createPool).toHaveBeenCalledWith({
            host: 'test-host',
            port: 3306,
            user: 'test-user',
            password: 'test-pass',
            database: 'test-db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            namedPlaceholders: false
        });
        expect(pool1).toEqual({ isMockPool: true });
    });

    it('should return the existing pool on subsequent calls without re-initializing', async () => {
        const { useDB } = await import('../server/utils/db');
        const pool1 = useDB();
        const pool2 = useDB();
        const pool3 = useDB();

        expect(mysql.createPool).toHaveBeenCalledTimes(1);
        expect(pool1).toBe(pool2);
        expect(pool2).toBe(pool3);
    });
});
