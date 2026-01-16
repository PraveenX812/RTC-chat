const { query } = require('./db');

const initDb = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS matches (
                id SERIAL PRIMARY KEY,
                user_a_id TEXT NOT NULL,
                user_b_id TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                started_at TIMESTAMP DEFAULT NOW(),
                ended_at TIMESTAMP
            );
        `);
        console.log('DB table matches created.');
    } catch (error) {
        console.log('DB connection failed');
    }
};

module.exports = initDb;
