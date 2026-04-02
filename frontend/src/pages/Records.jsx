/**
 * Records Page - Lists financial records with filtering.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../services/api';
import './Records.css';

export default function Records() {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await recordAPI.getAll(params);
      setRecords(res.data.records);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', from: '', to: '' });
    setTimeout(() => fetchRecords(1), 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await recordAPI.delete(id);
      fetchRecords(pagination.page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete record.');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="records-page">
      <div className="page-header">
        <div>
          <h1>Financial Records</h1>
          <p>{pagination.total || 0} total records</p>
        </div>
        {isAdmin && (
          <Link to="/records/new" className="btn-primary">
            + Add Record
          </Link>
        )}
      </div>

      {/* Filters */}
      <form className="filters-bar" onSubmit={handleFilter}>
        <select
          value={filters.type}
          onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
          className="filter-input"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="text"
          placeholder="Category..."
          value={filters.category}
          onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          className="filter-input"
        />

        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
          className="filter-input"
        />

        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
          className="filter-input"
        />

        <button type="submit" className="btn-filter">Search</button>
        <button type="button" className="btn-clear" onClick={clearFilters}>Clear</button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="page-loading"><div className="spinner"></div></div>
      ) : records.length === 0 ? (
        <div className="empty-state-section">
          <p>No records found. {isAdmin ? 'Create your first record!' : 'Check back later.'}</p>
        </div>
      ) : (
        <>
          <div className="records-table-wrapper">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Created By</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>
                    <td><span className="category-badge">{record.category}</span></td>
                    <td>
                      <span className={`type-badge type-${record.type}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={`amount-cell type-${record.type}`}>
                      {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                    </td>
                    <td className="notes-cell">{record.notes || '—'}</td>
                    <td>{record.created_by_name || 'Unknown'}</td>
                    {isAdmin && (
                      <td>
                        <div className="action-buttons">
                          <Link to={`/records/edit/${record.id}`} className="btn-action edit">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(record.id)} className="btn-action delete">
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchRecords(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchRecords(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
