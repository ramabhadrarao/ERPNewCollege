import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../store';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/user.slice';
import { fetchGroups } from '../store/group.slice';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);
  const { groups } = useSelector((state: RootState) => state.groups);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchGroups());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      groupIds: [] as number[],
      isActive: true
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Must be at least 6 characters'),
      groupIds: Yup.array().min(1, 'Select at least one group')
    }),
    onSubmit: async (values) => {
      try {
        if (editingUser) {
          await dispatch(updateUser({ id: editingUser.id, data: values })).unwrap();
        } else {
          await dispatch(createUser(values)).unwrap();
        }
        setShowModal(false);
        formik.resetForm();
        setEditingUser(null);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    formik.setValues({
      username: user.username,
      email: user.email,
      password: '',
      groupIds: user.groups.map((g: any) => g.id),
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="container-xl">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">User Management</h3>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingUser(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              Add New User
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-vcenter">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Groups</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.groups.map((g: any) => g.name).join(', ')}
                    </td>
                    <td>
                      <span className={`badge bg-${user.isActive ? 'success' : 'danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.username && formik.errors.username
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('username')}
                    />
                    {formik.touched.username && formik.errors.username && (
                      <div className="invalid-feedback">{formik.errors.username}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${
                        formik.touched.email && formik.errors.email
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="invalid-feedback">{formik.errors.email}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        formik.touched.password && formik.errors.password
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('password')}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <div className="invalid-feedback">{formik.errors.password}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Groups</label>
                    <select
                      multiple
                      className={`form-select ${
                        formik.touched.groupIds && formik.errors.groupIds
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('groupIds')}
                    >
                      {groups.map((group: any) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.groupIds && formik.errors.groupIds && (
                      <div className="invalid-feedback">{formik.errors.groupIds}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        {...formik.getFieldProps('isActive')}
                        checked={formik.values.isActive}
                      />
                      <span className="form-check-label">Active</span>
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link link-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;