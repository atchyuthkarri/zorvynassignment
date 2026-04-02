/**
 * Record Form Page - Create / Edit a financial record.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordAPI } from '../services/api';
import './RecordForm.css';

export default function RecordForm() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      const res = await recordAPI.getById(id);
      const rec = res.data.record;
      setFormData({
        amount: rec.amount,
        type: rec.type,
        category: rec.category,
        date: rec.date?.split('T')[0] || rec.date,
        notes: rec.notes || '',
      });
    } catch (err) {
      setErrors([err.response?.data?.error || 'Failed to load record.']);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      if (isEditing) {
        await recordAPI.update(id, formData);
      } else {
        await recordAPI.create(formData);
      }
      navigate('/records');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors([errorData?.error || 'Something went wrong.']);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    navigate('/records');
    return null;
  }

  if (fetchLoading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  const categories = [
    'Salary', 'Freelance', 'Investment', 'Rent', 'Utilities',
    'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Other'
  ];

  return (
    <div className="record-form-page">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Record' : 'Add New Record'}</h1>
        <p>{isEditing ? 'Update the financial record details' : 'Create a new financial record'}</p>
      </div>

      <div className="form-card">
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/records')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
