/**
 * User Service - Handles user CRUD business logic.
 */
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

class UserService {
  /**
   * Create a new user.
   */
  async createUser({ name, email, password, role = 'VIEWER', status = 'ACTIVE' }) {
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, status, created_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, role, status]
    );

    return result.rows[0];
  }

  /**
   * Get all users with optional filtering.
   */
  async getAllUsers({ role, status } = {}) {
    let query = 'SELECT id, name, email, role, status, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get a single user by ID.
   */
  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Update user role and/or status.
   */
  async updateUser(id, { name, role, status }) {
    // Check if user exists
    await this.getUserById(id);

    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }

    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (fields.length === 0) {
      const error = new Error('No fields to update.');
      error.statusCode = 400;
      throw error;
    }

    params.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, status, created_at
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

module.exports = new UserService();
