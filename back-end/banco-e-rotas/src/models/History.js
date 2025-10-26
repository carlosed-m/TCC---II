const { Pool } = require('pg'); // Import the PostgreSQL client

// Definir a classe History
class History {
    constructor() {
        this.pool = new Pool({
            // Configuração da conexão com o banco de dados
            user: 'your_username',
            host: 'localhost',
            database: 'your_database',
            password: 'your_password',
            port: 5432,
        });
    }

    // Método para obter o histórico do usuário
    async getHistory(userId) {
        const query = 'SELECT * FROM user_history WHERE user_id = $1';
        const values = [userId];
        const result = await this.pool.query(query, values);
        return result.rows;
    }

    // Método para verificar uma entrada específica do histórico
    async verifyHistory(userId, historyId) {
        const query = 'SELECT * FROM user_history WHERE user_id = $1 AND id = $2';
        const values = [userId, historyId];
        const result = await this.pool.query(query, values);
        return result.rows.length > 0;
    }
}

module.exports = new History();