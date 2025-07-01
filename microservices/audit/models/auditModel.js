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


    static async getByDateRange(email, startDate, endDate) {
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
   WHERE user_id = (
     SELECT id FROM users WHERE email = $1
   ) AND time BETWEEN $2 AND $3
   ORDER BY time ASC`,
            [email, startDate, endDate]
        );
        return result.rows;
    }


    static async getFrameById(id) {
        const result = await pool.query(
            `SELECT frame->>'image' AS dataURL
            FROM alerts_audit
            WHERE id = $1;`,
            [id]
        );
        return result.rows[0]?.dataurl;
    }



    //logLogin

    //////



    //////










}



module.exports = Audit;