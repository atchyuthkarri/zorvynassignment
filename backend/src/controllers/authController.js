/**
 * Auth Controller - Handles authentication requests.
 */
const authService = require('../services/authService');

class AuthController {
  /**
   * POST /auth/login
   * Login with email and password.
   */
  async login(req, res, next) {
    try {
      console.log('BODY:', req.body);
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const { user, token } = await authService.login(email, password);

      res.json({
        message: 'Login successful',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Get current authenticated user profile.
   */
  async getProfile(req, res) {
    res.json({ user: req.user });
  }
}

module.exports = new AuthController();
