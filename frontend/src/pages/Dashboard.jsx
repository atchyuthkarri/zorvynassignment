/**
 * Dashboard Page - Shows financial summary with aggregated data.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { Navigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { canAccessDashboard } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccessDashboard) {
    return <Navigate to="/records" replace />;
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Financial overview at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <span className="card-label">Total Income</span>
            <span className="card-value">{formatCurrency(summary.totalIncome)}</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <span className="card-label">Total Expense</span>
            <span className="card-value">{formatCurrency(summary.totalExpense)}</span>
          </div>
        </div>

        <div className="summary-card balance">
          <div className="card-icon">💎</div>
          <div className="card-content">
            <span className="card-label">Net Balance</span>
            <span className={`card-value ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(summary.netBalance)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Category Breakdown */}
        <div className="dashboard-section">
          <h2>Category Breakdown</h2>
          <div className="category-list">
            {summary.categoryTotals.length === 0 ? (
              <p className="empty-state">No data available</p>
            ) : (
              summary.categoryTotals.map((cat, i) => (
                <div key={i} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{cat.category}</span>
                    <span className={`category-type type-${cat.type}`}>
                      {cat.type}
                    </span>
                  </div>
                  <div className="category-stats">
                    <span className="category-total">
                      {formatCurrency(cat.total)}
                    </span>
                    <span className="category-count">
                      {cat.count} {cat.count === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-section">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {summary.recentTransactions.length === 0 ? (
              <p className="empty-state">No transactions yet</p>
            ) : (
              summary.recentTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-left">
                    <span className={`tx-indicator ${tx.type}`}></span>
                    <div className="tx-details">
                      <span className="tx-category">{tx.category}</span>
                      <span className="tx-date">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <span className={`tx-amount type-${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
