import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../store';
import { fetchGroups, createGroup, updateGroup, deleteGroup } from '../store/group.slice';
import { fetchPermissions } from '../store/permission.slice';

const GroupManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, loading } = useSelector((state: RootState) => state.groups);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchPermissions());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      permissionIds: [] as number[],
      isActive: true
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      description: Yup.string(),
      permissionIds: Yup.array().min(1, 'Select at least one permission')
    }),
    onSubmit: async (values) => {
      try {
        if (editingGroup) {
          await dispatch(updateGroup({ id: editingGroup.id, data: values })).unwrap();
        } else {
          await dispatch(createGroup(values)).unwrap();
        }
        setShowModal(false);
        formik.resetForm();
        setEditingGroup(null);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  const handleEdit = (group: any) => {
    setEditingGroup(group);
    formik.setValues({
      name: group.name,
      description: group.description || '',
      permissionIds: group.permissions.map((p: any) => p.id),
      isActive: group.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await dispatch(deleteGroup(id)).unwrap();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Group permissions by resource for better organization
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
          <h3 className="card-title">Group Management</h3>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingGroup(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              Add New Group
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-vcenter">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.description}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <div className="text-wrap">
                        {group.permissions.map((p: any) => (
                          <span key={p.id} className="badge bg-blue me-1 mb-1">
                            {p.resource}.{p.action}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge bg-${group.isActive ? 'success' : 'danger'}`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleEdit(group)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(group.id)}
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

      {/* Group Form Modal */}
      {showModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingGroup ? 'Edit Group' : 'Add New Group'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.name && formik.errors.name
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('name')}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="invalid-feedback">{formik.errors.name}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      {...formik.getFieldProps('description')}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Permissions</label>
                    <div className="row g-2">
                      {Object.entries(groupedPermissions).map(([resource, perms]: [string, any]) => (
                        <div key={resource} className="col-lg-6">
                          <div className="card">
                            <div className="card-header">
                              <h4 className="card-title">{resource}</h4>
                            </div>
                            <div className="card-body">
                              {perms.map((perm: any) => (
                                <label key={perm.id} className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={formik.values.permissionIds.includes(perm.id)}
                                    onChange={(e) => {
                                      const newPermissions = e.target.checked
                                        ? [...formik.values.permissionIds, perm.id]
                                        : formik.values.permissionIds.filter(
                                            (id) => id !== perm.id
                                          );
                                      formik.setFieldValue('permissionIds', newPermissions);
                                    }}
                                  />
                                  <span className="form-check-label">
                                    {perm.action}
                                    <small className="d-block text-muted">
                                      {perm.description}
                                    </small>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formik.touched.permissionIds && formik.errors.permissionIds && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.permissionIds}
                      </div>
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

export default GroupManagement;