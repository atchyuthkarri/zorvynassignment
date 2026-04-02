/**
 * Record Service - Handles financial record CRUD and filtering.
 */
const pool = require('../db/pool');

class RecordService {
  /**
   * Create a new financial record.
   */
  async createRecord({ amount, type, category, date, notes, created_by }) {
    const result = await pool.query(
      `INSERT INTO records (amount, type, category, date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, amount, type, category, date, notes, created_by, created_at`,
      [parseFloat(amount), type, category.trim(), date, notes?.trim() || null, created_by]
    );

    return result.rows[0];
  }

  /**
   * Get records with optional filtering.
   * Supports: search, type, category, date range (from, to), pagination.
   */
  async getRecords({ search, type, category, from, to, page = 1, limit = 10 } = {}) {
    let query = `
      SELECT r.id, r.amount, r.type, r.category, r.date, r.notes,
             r.created_by, r.created_at, u.name as created_by_name
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.is_deleted = FALSE
    `;
    let countQuery = 'SELECT COUNT(*) FROM records r WHERE r.is_deleted = FALSE';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (r.category ILIKE $${paramIndex} OR r.notes ILIKE $${paramIndex})`;
      countQuery += ` AND (r.category ILIKE $${paramIndex} OR r.notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      query += ` AND r.type = $${paramIndex}`;
      countQuery += ` AND r.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category) {
      query += ` AND r.category ILIKE $${paramIndex}`;
      countQuery += ` AND r.category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (from) {
      query += ` AND r.date >= $${paramIndex}`;
      countQuery += ` AND r.date >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      query += ` AND r.date <= $${paramIndex}`;
      countQuery += ` AND r.date <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY r.date DESC, r.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const limitOffsetParams = [...params, parseInt(limit), offset];

    const [recordsResult, countResult] = await Promise.all([
      pool.query(query, limitOffsetParams),
      pool.query(countQuery, params),
    ]);

    return {
      data: recordsResult.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count)
    };
  }

  /**
   * Get a single record by ID.
   */
  async getRecordById(id) {
    const result = await pool.query(
      `SELECT r.*, u.name as created_by_name
       FROM records r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.id = $1 AND r.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Record not found.');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Update a financial record.
   */
  async updateRecord(id, { amount, type, category, date, notes }) {
    // Check if record exists
    await this.getRecordById(id);

    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (amount !== undefined) {
      fields.push(`amount = $${paramIndex++}`);
      params.push(parseFloat(amount));
    }
    if (type !== undefined) {
      fields.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      params.push(category.trim());
    }
    if (date !== undefined) {
      fields.push(`date = $${paramIndex++}`);
      params.push(date);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      params.push(notes?.trim() || null);
    }

    if (fields.length === 0) {
      const error = new Error('No fields to update.');
      error.statusCode = 400;
      throw error;
    }

    params.push(id);
    const query = `
      UPDATE records SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND is_deleted = FALSE
      RETURNING id, amount, type, category, date, notes, created_by, created_at
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Soft Delete a financial record.
   */
  async deleteRecord(id) {
    const record = await this.getRecordById(id);

    await pool.query('UPDATE records SET is_deleted = TRUE WHERE id = $1', [id]);

    return record;
  }
}

module.exports = new RecordService();
