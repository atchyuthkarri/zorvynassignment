/**
 * Users Page - Admin user management.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Navigate } from 'react-router-dom';
import './Users.css';

export default function Users() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Create form
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'VIEWER',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'VIEWER' });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      const errorData = err.response?.data;
      alert(errorData?.errors?.join(', ') || errorData?.error || 'Failed to create user.');
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      await userAPI.update(id, data);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user.');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>{users.length} users total</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="create-user-card">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser} className="inline-form">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser(u => ({ ...u, name: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser(u => ({ ...u, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={newUser.password}
              onChange={(e) => setNewUser(u => ({ ...u, password: e.target.value }))}
              required
              minLength={6}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser(u => ({ ...u, role: e.target.value }))}
            >
              <option value="VIEWER">Viewer</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" className="btn-submit">Create</button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-card-info">
                <span className="user-card-name">{user.name}</span>
                <span className="user-card-email">{user.email}</span>
              </div>
            </div>

            <div className="user-card-badges">
              <span className={`role-badge role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
              <span className={`status-badge status-${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </div>

            {editingUser === user.id ? (
              <div className="edit-controls">
                <select
                  defaultValue={user.role}
                  id={`role-${user.id}`}
                  className="edit-select"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select
                  defaultValue={user.status}
                  id={`status-${user.id}`}
                  className="edit-select"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="edit-buttons">
                  <button
                    className="btn-action edit"
                    onClick={() => {
                      const role = document.getElementById(`role-${user.id}`).value;
                      const status = document.getElementById(`status-${user.id}`).value;
                      handleUpdateUser(user.id, { role, status });
                    }}
                  >
                    Save
                  </button>
                  <button className="btn-action delete" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-edit-user" onClick={() => setEditingUser(user.id)}>
                Edit Role / Status
              </button>
            )}

            <div className="user-card-meta">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
