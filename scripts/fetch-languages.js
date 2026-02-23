import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../i18n/locales');
const localesConfigFile = path.resolve(__dirname, '../i18n/locales.json');

// Ensure locales directory exists
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
}

async function getLanguages(mock = false) {
    if (mock) {
        console.log('Using mock data for languages...');
        return ['es', 'en', 'it', 'ar', 'zh', 'de', 'fr', 'hi', 'ja', 'ko', 'nl', 'pt', 'ru', 'sv', 'tr'];
    }

    let pool;
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'tudexgames',
        });

        const [rows] = await pool.query('SELECT DISTINCT language FROM translations');
        return rows.map(r => r.language);
    } catch (error) {
        console.error('Error connecting to database:', error);
        // Fallback to existing languages if DB fails? Or just return empty array and fail later?
        // Since this script is critical for config, let's log error and try to continue with minimal set if possible,
        // or just rethrow to fail build.
        // Given existing setup: es, en, it are default.
        console.warn('Falling back to default languages (es, en, it) due to DB error.');
        return ['es', 'en', 'it'];
    } finally {
        if (pool) await pool.end();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const mock = args.includes('--mock');

    const languages = await getLanguages(mock);

    if (!languages || languages.length === 0) {
        console.error('No languages found!');
        process.exit(1);
    }

    console.log(`Found languages: ${languages.join(', ')}`);

    const localesConfig = languages.map(lang => {
        const fileName = `${lang}.json`;
        const filePath = path.join(localesDir, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`Creating empty translation file for ${lang}...`);
            fs.writeFileSync(filePath, '{}');
        }

        return {
            code: lang,
            file: fileName
        };
    });

    console.log(`Writing locales config to ${localesConfigFile}...`);
    fs.writeFileSync(localesConfigFile, JSON.stringify(localesConfig, null, 2));
    console.log('Done.');
}

main();
