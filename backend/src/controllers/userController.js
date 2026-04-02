/**
 * User Controller - Handles user management requests.
 */
const userService = require('../services/userService');
const { validateUser, validateUserUpdate } = require('../utils/validators');

class UserController {
  /**
   * POST /users
   * Create a new user (ADMIN only).
   */
  async createUser(req, res, next) {
    try {
      const errors = validateUser(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await userService.createUser(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users
   * Get all users (ADMIN only). Supports ?role=&status= filters.
   */
  async getAllUsers(req, res, next) {
    try {
      const { role, status } = req.query;
      const users = await userService.getAllUsers({ role, status });
      res.json({ users, count: users.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id
   * Get a single user by ID (ADMIN only).
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id
   * Update user role/status (ADMIN only).
   */
  async updateUser(req, res, next) {
    try {
      const errors = validateUserUpdate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
