import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../store';
import { MenuItem, fetchMenus, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems } from '../store/menu.slice';

const MenuManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { menus, loading } = useSelector((state: RootState) => state.menus);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      resource: '',
      icon: '',
      path: '',
      parentId: '' as string | number,
      order: 0,
      isActive: true
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      resource: Yup.string().required('Required'),
      path: Yup.string().required('Required'),
      order: Yup.number().min(0, 'Must be positive')
    }),
    onSubmit: async (values) => {
      try {
        const submitData = {
          ...values,
          parentId: values.parentId ? Number(values.parentId) : null,
          order: values.order || 0
        };

        if (editingMenu) {
          await dispatch(updateMenuItem({ id: editingMenu.id, data: submitData })).unwrap();
        } else {
          await dispatch(createMenuItem(submitData)).unwrap();
        }
        setShowModal(false);
        formik.resetForm();
        setEditingMenu(null);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    formik.setValues({
      name: menu.name,
      resource: menu.resource,
      icon: menu.icon || '',
      path: menu.path,
      parentId: menu.parentId?.toString() || '',
      order: menu.order || 0,
      isActive: menu.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await dispatch(deleteMenuItem(id)).unwrap();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <React.Fragment key={item.id}>
        <tr>
          <td>
            <div style={{ marginLeft: `${level * 20}px` }}>
              {item.icon && <i className={`icon icon-${item.icon} me-2`}></i>}
              {item.name}
            </div>
          </td>
          <td>{item.resource}</td>
          <td>{item.path}</td>
          <td>{item.order || 0}</td>
          <td>
            <span className={`badge bg-${item.isActive ? 'success' : 'danger'}`}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <button
              className="btn btn-sm btn-primary me-2"
              onClick={() => handleEdit(item)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </button>
          </td>
        </tr>
        {item.children && renderMenuItems(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Flatten menu structure for parent selection
  const flattenMenus = (items: MenuItem[], result: MenuItem[] = []): MenuItem[] => {
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        flattenMenus(item.children, result);
      }
    });
    return result;
  };

  const flatMenus = flattenMenus(menus);

  return (
    <div className="container-xl">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Menu Management</h3>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingMenu(null);
                formik.resetForm();
                setShowModal(true);
              }}
            >
              Add Menu Item
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-vcenter">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Resource</th>
                  <th>Path</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderMenuItems(menus)}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Menu Form Modal */}
      {showModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
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
                    <label className="form-label">Resource</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.resource && formik.errors.resource
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('resource')}
                    />
                    {formik.touched.resource && formik.errors.resource && (
                      <div className="invalid-feedback">{formik.errors.resource}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Icon (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., users, settings, dashboard"
                      {...formik.getFieldProps('icon')}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Path</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.path && formik.errors.path
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="/path/to/page"
                      {...formik.getFieldProps('path')}
                    />
                    {formik.touched.path && formik.errors.path && (
                      <div className="invalid-feedback">{formik.errors.path}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Parent Menu</label>
                    <select
                      className="form-select"
                      {...formik.getFieldProps('parentId')}
                    >
                      <option value="">No Parent (Top Level)</option>
                      {flatMenus.map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Order</label>
                    <input
                      type="number"
                      className={`form-control ${
                        formik.touched.order && formik.errors.order
                          ? 'is-invalid'
                          : ''
                      }`}
                      {...formik.getFieldProps('order')}
                    />
                    {formik.touched.order && formik.errors.order && (
                      <div className="invalid-feedback">{formik.errors.order}</div>
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

export default MenuManagement;