// models/userModel.js

const pool = require('../config/db'); // Asegúrate de que la ruta sea correcta
const bcrypt = require('bcryptjs');

class User{
    static async create({ username, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        return result.rows[0];
    }


    static async findUser(identifier) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [identifier]
        );
        return result.rows[0];
    }

    static async updatePassword(email, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING *',
            [hashedPassword, email]
        );
        return result.rows[0];
    }
}



module.exports = User;