import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../store';
import { fetchPermissions, createPermission, updatePermission, deletePermission, bulkCreatePermissions } from '../store/permission.slice';

interface BulkPermission {
  resource: string;
  action: string;
  description?: string;
}

const PermissionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, loading } = useSelector((state: RootState) => state.permissions);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      resource: '',
      action: '',
      description: ''
    },
    validationSchema: Yup.object({
      resource: Yup.string().required('Required'),
      action: Yup.string().required('Required'),
      description: Yup.string()
    }),
    onSubmit: async (values) => {
      try {
        if (editingPermission) {
          await dispatch(updatePermission({ id: editingPermission.id, data: values })).unwrap();
        } else {
          await dispatch(createPermission(values)).unwrap();
        }
        setShowModal(false);
        formik.resetForm();
        setEditingPermission(null);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  const handleEdit = (permission: any) => {
    setEditingPermission(permission);
    formik.setValues({
      resource: permission.resource,
      action: permission.action,
      description: permission.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await dispatch(deletePermission(id)).unwrap();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleBulkCreate = async () => {
    try {
      // Parse bulk input into permission objects
      const permissions: BulkPermission[] = bulkInput
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [resource, action, ...descParts] = line.split(',').map(s => s.trim());
          return {
            resource,
            action,
            description: descParts.join(',').trim() || undefined
          };
        });

      await dispatch(bulkCreatePermissions(permissions)).unwrap();
      setShowBulkModal(false);
      setBulkInput('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc: any, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  return (
    <div className="container-xl">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Permission Management</h3>
          <div className="card-actions">
            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setEditingPermission(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              Add Permission
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowBulkModal(true)}
            >
              Bulk Add
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {Object.entries(groupedPermissions).map(([resource, perms]: [string, any]) => (
              <div key={resource} className="col-md-6 col-lg-4">
                <div className="card">
                  <div className="card-header">
                    <h4 className="card-title">{resource}</h4>
                  </div>
                  <div className="card-body">
                    <div className="list-group list-group-flush">
                      {perms.map((perm: any) => (
                        <div key={perm.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{perm.action}</strong>
                              {perm.description && (
                                <small className="d-block text-muted">
                                  {perm.description}
                                </small>
                              )}
                            </div>
                            <div>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleEdit(perm)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(perm.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permission Form Modal */}
      {showModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingPermission ? 'Edit Permission' : 'Add New Permission'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Resource</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.resource && formik.errors.resource
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="e.g., users, groups, reports"
                      {...formik.getFieldProps('resource')}
                    />
                    {formik.touched.resource && formik.errors.resource && (
                      <div className="invalid-feedback">{formik.errors.resource}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Action</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.action && formik.errors.action
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="e.g., create, view, edit, delete"
                      {...formik.getFieldProps('action')}
                    />
                    {formik.touched.action && formik.errors.action && (
                      <div className="invalid-feedback">{formik.errors.action}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe what this permission allows"
                      {...formik.getFieldProps('description')}
                    ></textarea>
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

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bulk Add Permissions</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBulkModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Enter permissions (one per line, format: resource, action, description)
                  </label>
                  <textarea
                    className="form-control font-monospace"
                    rows={10}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="users, create, Create new users
users, view, View user list
users, edit, Edit user details"
                  ></textarea>
                  <small className="form-text text-muted">
                    Description is optional. Make sure each permission is on a new line.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBulkCreate}
                  disabled={loading || !bulkInput.trim()}
                >
                  {loading ? 'Adding...' : 'Add Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;