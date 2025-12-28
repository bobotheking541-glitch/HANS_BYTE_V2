/*/ lib/database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Sequelize } = require('sequelize');

class DatabaseManager {
    static instance = null;

    static async getInstance() {
        if (!DatabaseManager.instance) {
            const DATABASE_URL = process.env.DATABASE_URL || './database.db';

            if (DATABASE_URL === './database.db') {
                // SQLite (local file)
                DatabaseManager.instance = await open({
                    filename: DATABASE_URL,
                    driver: sqlite3.Database
                });

                // Create users table if it doesn't exist
                await DatabaseManager.instance.exec(`
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        name TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                console.log('SQLite database ready.');
            } else {
                // Postgres or other DBs via Sequelize
                DatabaseManager.instance = new Sequelize(DATABASE_URL, {
                    dialect: 'postgres',
                    ssl: true,
                    protocol: 'postgres',
                    dialectOptions: {
                        native: true,
                        ssl: { require: true, rejectUnauthorized: false },
                    },
                    logging: false,
                });

                await DatabaseManager.instance.sync()
                    .then(() => console.log('Postgres database synchronized.'))
                    .catch((err) => console.error('Error synchronizing database:', err));
            }
        }
        return DatabaseManager.instance;
    }
}

// Export a ready-to-use promise
const DATABASE = DatabaseManager.getInstance();

module.exports = { DATABASE };
*/