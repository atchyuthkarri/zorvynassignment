/**
 * Dashboard Controller - Handles dashboard summary requests.
 */
const dashboardService = require('../services/dashboardService');

class DashboardController {
  /**
   * GET /dashboard/summary
   * Get complete dashboard summary (ANALYST + ADMIN).
   */
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.json({ summary });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
