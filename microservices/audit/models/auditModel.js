// models/auditModel.js

const pool = require('../config/db'); // Asegúrate de que la ruta sea correcta


class Audit {
    static async logAlert({ email, alertId, type, description, frame }) {
        const result = await pool.query(
            `INSERT INTO alerts_audit (user_id, alert_id, type, description, frame)
       SELECT id, $2, $3, $4, $5
         FROM users
        WHERE email = $1
       RETURNING *`,
            [email, alertId, type, description, frame]
        );
        return result.rows[0];

    }


    static async getByDateRangeByUser(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT 
         id,
         user_id,
         alert_id,
         type,
         description,
         frame->>'dataURL' AS frame,
         time
       FROM alerts_audit
      WHERE user_id = $1
        AND time BETWEEN $2 AND $3
      ORDER BY time ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }


    static async getFrameById(id, userId) {
    const result = await pool.query(
      `SELECT frame
         FROM alerts_audit
        WHERE id = $1
          AND user_id = $2`,
      [id, userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    // row.frame es tu JSONB: puede ser un string, un objeto, etc.
    const frame = row.frame;

    // Caso 1: ya era una cadena Data-URL
    if (typeof frame === 'string' && frame.startsWith('data:')) {
      return frame;
    }
    // Caso 2: era un objeto con clave dataURL, image o src
    if (typeof frame === 'object') {
      return frame.dataURL || frame.image || frame.src || null;
    }
    // Caso 3: era un string base64 puro
    if (typeof frame === 'string') {
      return `data:image/jpeg;base64,${frame}`;
    }
    return null;
  }



    //logLogin

    //////



    //////










}



module.exports = Audit;