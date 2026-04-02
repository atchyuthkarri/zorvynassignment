/**
 * Record Routes
 * Read access: ALL roles.
 * Write access: ADMIN only.
 */
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All record routes require authentication
router.use(authenticate);

// Read access - all authenticated users
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);

// Write access - ADMIN only
router.post('/', authorize('ADMIN'), recordController.createRecord);
router.put('/:id', authorize('ADMIN'), recordController.updateRecord);
router.delete('/:id', authorize('ADMIN'), recordController.deleteRecord);

module.exports = router;
