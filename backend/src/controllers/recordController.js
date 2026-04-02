/**
 * Record Controller - Handles financial record requests.
 */
const recordService = require('../services/recordService');
const { validateRecord, validateRecordUpdate } = require('../utils/validators');

class RecordController {
  /**
   * POST /records
   * Create a new financial record (ADMIN only).
   */
  async createRecord(req, res, next) {
    try {
      const errors = validateRecord(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const recordData = {
        ...req.body,
        created_by: req.user.id,
      };

      const record = await recordService.createRecord(recordData);
      res.status(201).json({ message: 'Record created successfully', record });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /records
   * Get all records with optional filters (ALL roles).
   * Query params: type, category, from, to, page, limit
   */
  async getRecords(req, res, next) {
    try {
      const { search, type, category, from, to, page, limit } = req.query;
      const result = await recordService.getRecords({ search, type, category, from, to, page, limit });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /records/:id
   * Get a single record by ID (ALL roles).
   */
  async getRecordById(req, res, next) {
    try {
      const record = await recordService.getRecordById(req.params.id);
      res.json({ record });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /records/:id
   * Update a financial record (ADMIN only).
   */
  async updateRecord(req, res, next) {
    try {
      const errors = validateRecordUpdate(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const record = await recordService.updateRecord(req.params.id, req.body);
      res.json({ message: 'Record updated successfully', record });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /records/:id
   * Delete a financial record (ADMIN only).
   */
  async deleteRecord(req, res, next) {
    try {
      const record = await recordService.deleteRecord(req.params.id);
      res.json({ message: 'Record deleted successfully', record });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecordController();
