/**
 * Dashboard Service - Handles aggregation queries for the dashboard.
 */
const pool = require('../db/pool');

class DashboardService {
  /**
   * Get complete dashboard summary with:
   * - Total income, total expense, net balance
   * - Category-wise totals
   * - Recent 5 transactions
   */
  async getSummary() {
    // Run all queries in parallel for performance
    const [totals, categoryTotals, recentTransactions] = await Promise.all([
      this.getTotals(),
      this.getCategoryTotals(),
      this.getRecentTransactions(),
    ]);

    return {
      ...totals,
      categoryTotals,
      recentTransactions,
    };
  }

  /**
   * Get total income, total expense, and net balance.
   */
  async getTotals() {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
          0
        ) AS net_balance
      FROM records
      WHERE is_deleted = FALSE
    `);

    const row = result.rows[0];
    return {
      totalIncome: parseFloat(row.total_income),
      totalExpense: parseFloat(row.total_expense),
      netBalance: parseFloat(row.net_balance),
    };
  }

  /**
   * Get category-wise income and expense totals.
   */
  async getCategoryTotals() {
    const result = await pool.query(`
      SELECT
        category,
        type,
        SUM(amount) AS total,
        COUNT(*) AS count
      FROM records
      WHERE is_deleted = FALSE
      GROUP BY category, type
      ORDER BY total DESC
    `);

    return result.rows.map(row => ({
      category: row.category,
      type: row.type,
      total: parseFloat(row.total),
      count: parseInt(row.count),
    }));
  }

  /**
   * Get the 5 most recent transactions.
   */
  async getRecentTransactions() {
    const result = await pool.query(`
      SELECT r.id, r.amount, r.type, r.category, r.date, r.notes,
             r.created_at, u.name AS created_by_name
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.is_deleted = FALSE
      ORDER BY r.date DESC, r.created_at DESC
      LIMIT 5
    `);

    return result.rows;
  }
}

module.exports = new DashboardService();
