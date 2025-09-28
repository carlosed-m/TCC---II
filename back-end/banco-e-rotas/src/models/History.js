const { Pool } = require('pg'); // Import the PostgreSQL client

// Define the History model
class History {
    constructor() {
        this.pool = new Pool({
            // Database connection configuration
            user: 'your_username',
            host: 'localhost',
            database: 'your_database',
            password: 'your_password',
            port: 5432,
        });
    }

    // Method to get user history
    async getHistory(userId) {
        const query = 'SELECT * FROM user_history WHERE user_id = $1';
        const values = [userId];
        const result = await this.pool.query(query, values);
        return result.rows;
    }

    // Method to verify a specific history entry
    async verifyHistory(userId, historyId) {
        const query = 'SELECT * FROM user_history WHERE user_id = $1 AND id = $2';
        const values = [userId, historyId];
        const result = await this.pool.query(query, values);
        return result.rows.length > 0;
    }
}

module.exports = new History();