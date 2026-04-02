/**
 * Dashboard Routes
 * Access: ANALYST + ADMIN roles.
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Dashboard requires authentication + ANALYST or ADMIN role
router.use(authenticate);
router.use(authorize('ANALYST', 'ADMIN'));

router.get('/summary', dashboardController.getSummary);

module.exports = router;
