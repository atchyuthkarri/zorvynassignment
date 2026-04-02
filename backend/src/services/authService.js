/**
 * Auth Service - Handles authentication business logic.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

class AuthService {
  /**
   * Authenticate user and return JWT token.
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} { user, token }
   */
  async login(email, password) {
    const result = await pool.query(
      'SELECT id, name, email, password, role, status FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    if (user.status !== 'ACTIVE') {
      const error = new Error('Account is inactive. Contact an administrator.');
      error.statusCode = 403;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}

module.exports = new AuthService();
