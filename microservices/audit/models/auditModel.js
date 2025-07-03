// models/auditModel.js

const pool = require('../config/db'); // Asegúrate de que la ruta sea correcta


class Audit {

    static async createExamSession({ email, sessionName }) {
        const result = await pool.query(
            `INSERT INTO exam_sessions (user_id, name)
       SELECT id, $2
         FROM users
        WHERE email = $1
       RETURNING id`,
            [email, sessionName]
        );
        return result.rows[0].id;
    }




    static async logAlert({ email, sessionId, type, description, frame }) {
        const result = await pool.query(
            `INSERT INTO alerts_audit (user_id, session_id, type, description, frame)
       SELECT id, $2, $3, $4, $5
         FROM users
        WHERE email = $1
       RETURNING *`,
            [email, sessionId, type, description, frame]
        );
        return result.rows[0];
    }


    // static async getByDateRangeByUser(userId, startDate, endDate) {
    //     const result = await pool.query(
    //         `
    // SELECT 
    //   aa.id,
    //   aa.user_id,
    //   aa.type,
    //   aa.description,
    //   aa.frame->>'dataURL'   AS frame,
    //   aa.time,
    //   es.name               AS exam_name
    // FROM alerts_audit AS aa
    // JOIN exam_sessions AS es
    //   ON aa.session_id = es.id
    // WHERE aa.user_id = $1
    //   AND aa.time BETWEEN $2 AND $3
    // ORDER BY aa.time ASC;
    // `,
    //         [userId, startDate, endDate]
    //     );
    //     return result.rows;
    // }

    static async getAllByUser(userId) {
        const result = await pool.query(
            `
        SELECT 
          aa.id,
          aa.user_id,
          aa.type,
          aa.description,
          aa.frame->>'dataURL' AS frame,
          aa.time,
          es.name AS exam_name
        FROM alerts_audit AS aa
        JOIN exam_sessions AS es
          ON aa.session_id = es.id
        WHERE aa.user_id = $1
        ORDER BY aa.time ASC;
        `,
            [userId]
        );
        return result.rows;
    }

    //     static async getByUserPaginated(userId, limit, offset) {
    //         const q = `
    //     SELECT aa.id, aa.user_id, aa.type, aa.description,
    //            aa.frame->>'dataURL' AS frame, aa.time,
    //            es.name AS exam_name
    //     FROM alerts_audit aa
    //     JOIN exam_sessions es ON aa.session_id = es.id
    //     WHERE aa.user_id = $1
    //     ORDER BY aa.time ASC
    //     LIMIT $2 OFFSET $3;
    //   `;
    //         const result = await pool.query(q, [userId, limit, offset]);
    //         return result.rows;
    //     }

    //     static async countByUser(userId) {
    //         const res = await pool.query(
    //             'SELECT COUNT(*)::int AS count FROM alerts_audit WHERE user_id = $1',
    //             [userId]
    //         );
    //         return res.rows[0];
    //     }

    static async getByUserPaginated(userId, limit, offset, startDate, endDate, examName) {
        // 1) Montamos dinámicamente las cláusulas WHERE
        const clauses = ['aa.user_id = $1'];
        const params = [userId];
        let idx = 2;

        // Filtro por rango de tiempo
        if (startDate && endDate) {
            clauses.push(`aa.time BETWEEN $${idx} AND $${idx + 1}`);
            params.push(startDate, endDate);
            idx += 2;
        }

        // Filtro por nombre de examen
        if (examName) {
            clauses.push(`es.name = $${idx}`);
            params.push(examName);
            idx += 1;
        }

        // Unimos las cláusulas
        const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

        // 2) Construimos la consulta con placeholders para LIMIT y OFFSET
        const sql = `
    SELECT
      aa.id,
      aa.user_id,
      aa.type,
      aa.description,
      aa.frame->>'dataURL' AS frame,
      aa.time,
      es.name AS exam_name
    FROM alerts_audit AS aa
    JOIN exam_sessions AS es
      ON aa.session_id = es.id
    ${where}
    ORDER BY aa.time ASC
    LIMIT $${idx} OFFSET $${idx + 1};
  `;

        // 3) Agregamos limit y offset al array de parámetros
        params.push(limit, offset);

        // 4) Ejecutamos y devolvemos filas
        const result = await pool.query(sql, params);
        return result.rows;
    }


    static async countByUser(userId, startDate, endDate, examName) {
        const clauses = ['user_id = $1'];
        const params = [userId];
        let idx = 2;

        if (startDate && endDate) {
            clauses.push(`time BETWEEN $${idx} AND $${idx + 1}`);
            params.push(startDate, endDate);
            idx += 2;
        }
        if (examName) {
            clauses.push(`session_id IN (
        SELECT id FROM exam_sessions WHERE name = $${idx}
      )`);
            params.push(examName);
        }

        const where = clauses.length
            ? 'WHERE ' + clauses.join(' AND ')
            : '';

        const sql = `
      SELECT COUNT(*)::int AS count
      FROM alerts_audit
      ${where};
    `;
        const result = await pool.query(sql, params);
        return result.rows[0].count;
    }


    static async getExamNamesByUser(userId) {
        const sql = `
      SELECT DISTINCT es.name
      FROM exam_sessions AS es
      JOIN alerts_audit AS aa
        ON aa.session_id = es.id
      WHERE aa.user_id = $1
      ORDER BY es.name;
    `;
        const res = await pool.query(sql, [userId]);
        // res.rows = [ { name: 'Examen A' }, { name: 'Examen B' }, … ]
        return res.rows.map(r => r.name);
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

    static async sendUserEvent({ userId, type, description, details }) {
        const result = await pool.query(
            `
      INSERT INTO user_events (user_id, event_type)
      VALUES ($1, $2)
      RETURNING
        id,
        user_id,
        event_type,
        occurred_at;
      `,
            [userId, type]
        );
        return result.rows[0];
    }

    //////










}



module.exports = Audit;