const { Pool } = require('pg'); // Import the PostgreSQL client
const pool = require('../config/db'); // Import the database connection

// User model definition
class User {
    constructor(id, username, password, email) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }

    static async create(username, password, email) {
        const result = await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
            [username, password, email]
        );
        return new User(result.rows[0].id, result.rows[0].username, result.rows[0].password, result.rows[0].email);
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length) {
            const user = result.rows[0];
            return new User(user.id, user.username, user.password, user.email);
        }
        return null;
    }

    static async findByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length) {
            const user = result.rows[0];
            return new User(user.id, user.username, user.password, user.email);
        }
        return null;
    }

    async update(newData) {
        const { username, email } = newData;
        await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3',
            [username, email, this.id]
        );
        this.username = username;
        this.email = email;
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    }
}

module.exports = User;