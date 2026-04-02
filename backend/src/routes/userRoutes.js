/**
 * User Routes
 * All routes require ADMIN role.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All user management routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
