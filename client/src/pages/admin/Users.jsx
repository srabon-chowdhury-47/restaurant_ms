import { useEffect, useState } from 'react'
import { UserCog, Plus, Pencil, Trash2, KeyRound, X, Lock } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const ROLE_OPTIONS = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'STAFF', label: 'Staff' },
]

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'STAFF',
  password: '',
}

const emptyOwnPasswordForm = {
  old_password: '',
  new_password: '',
  confirm_password: '',
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [resetTarget, setResetTarget] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [ownPasswordForm, setOwnPasswordForm] = useState(emptyOwnPasswordForm)
  const [ownPasswordError, setOwnPasswordError] = useState('')
  const [ownPasswordSuccess, setOwnPasswordSuccess] = useState('')
  const [changingOwnPassword, setChangingOwnPassword] = useState(false)

  const currentUsername = localStorage.getItem('username') || ''
  const isSuperuser = localStorage.getItem('is_superuser') === 'true'

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axiosInstance.get('/users/users/')
      const list = Array.isArray(data) ? data : data.results || []
      setUsers(list)
    } catch (err) {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openCreateModal = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setFormError('')
    setShowFormModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setForm({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'STAFF',
      password: '',
    })
    setFormError('')
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingUser(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.username.trim()) {
      setFormError('Username is required.')
      return
    }
    if (!editingUser && !form.password) {
      setFormError('Password is required for new users.')
      return
    }

    setSubmitting(true)

    try {
      if (editingUser) {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          role: form.role,
        }
        await axiosInstance.patch(`/users/users/${editingUser.id}/`, payload)
      } else {
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          password: form.password,
        }
        await axiosInstance.post('/users/users/', payload)
      }

      closeFormModal()
      fetchUsers()
    } catch (err) {
      const data = err.response && err.response.data
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstMsg = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey]
        setFormError(firstMsg || 'Something went wrong.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Superuser: reset someone else's password (no old password needed) ---

  const openResetModal = (user) => {
    setResetTarget(user)
    setResetPassword('')
    setResetError('')
  }

  const closeResetModal = () => {
    setResetTarget(null)
    setResetPassword('')
    setResetError('')
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setResetError('')

    if (!resetPassword || resetPassword.length < 4) {
      setResetError('Enter a new password (at least 4 characters).')
      return
    }

    setResetting(true)
    try {
      await axiosInstance.post(
        `/users/users/${resetTarget.id}/reset-password/`,
        { new_password: resetPassword }
      )
      closeResetModal()
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setResetError('Only a superuser can reset another user\u2019s password.')
      } else {
        setResetError('Could not reset password. Please try again.')
      }
    } finally {
      setResetting(false)
    }
  }

  // --- Delete (superuser only) ---

  const openDeleteModal = (user) => {
    setDeleteTarget(user)
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await axiosInstance.delete(`/users/users/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchUsers()
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setDeleteError('Only a superuser can delete users.')
      } else {
        setDeleteError('Could not delete user. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }

  // --- Self: change my own password (old password required) ---

  const handleOwnPasswordChange = (field) => (e) => {
    setOwnPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleOwnPasswordSubmit = async (e) => {
    e.preventDefault()
    setOwnPasswordError('')
    setOwnPasswordSuccess('')

    if (!ownPasswordForm.old_password) {
      setOwnPasswordError('Enter your current password.')
      return
    }
    if (!ownPasswordForm.new_password || ownPasswordForm.new_password.length < 4) {
      setOwnPasswordError('New password must be at least 4 characters.')
      return
    }
    if (ownPasswordForm.new_password !== ownPasswordForm.confirm_password) {
      setOwnPasswordError('New password and confirmation do not match.')
      return
    }

    setChangingOwnPassword(true)
    try {
      await axiosInstance.post('/users/users/change-password/', {
        old_password: ownPasswordForm.old_password,
        new_password: ownPasswordForm.new_password,
      })
      setOwnPasswordSuccess('Password changed successfully.')
      setOwnPasswordForm(emptyOwnPasswordForm)
    } catch (err) {
      const data = err.response && err.response.data
      if (data && data.old_password) {
        setOwnPasswordError(
          Array.isArray(data.old_password) ? data.old_password[0] : data.old_password
        )
      } else {
        setOwnPasswordError('Could not change password. Please try again.')
      }
    } finally {
      setChangingOwnPassword(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 rounded-lg">
            <UserCog className="w-5 h-5 text-brand-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">
              Manage manager and staff accounts
              {isSuperuser && (
                <span className="ml-2 text-brand-600 font-medium">
                  · You are a super admin
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add user
        </button>
      </div>

      {/* Change my own password */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">
            Change my password
          </h2>
        </div>

        {ownPasswordError && (
          <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {ownPasswordError}
          </div>
        )}
        {ownPasswordSuccess && (
          <div className="mb-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            {ownPasswordSuccess}
          </div>
        )}

        <form
          onSubmit={handleOwnPasswordSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Current password
            </label>
            <input
              type="password"
              value={ownPasswordForm.old_password}
              onChange={handleOwnPasswordChange('old_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              New password
            </label>
            <input
              type="password"
              value={ownPasswordForm.new_password}
              onChange={handleOwnPasswordChange('new_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={ownPasswordForm.confirm_password}
              onChange={handleOwnPasswordChange('confirm_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={changingOwnPassword}
              className="px-4 py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {changingOwnPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Username
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Phone
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Role
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No users yet.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {user.username}
                    {user.username === currentUsername && (
                      <span className="ml-2 text-xs text-brand-600">(you)</span>
                    )}
                    {user.is_superuser && (
                      <span className="ml-2 text-xs text-amber-600">Super admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{user.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'MANAGER'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        title="Edit"
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isSuperuser && (
                        <button
                          onClick={() => openResetModal(user)}
                          title="Reset password"
                          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      )}
                      {isSuperuser && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          title="Delete"
                          className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingUser ? 'Edit user' : 'Add user'}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="px-5 py-4">
              {formError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={handleFormChange('username')}
                    disabled={!!editingUser}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={handleFormChange('first_name')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={handleFormChange('last_name')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleFormChange('email')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={handleFormChange('phone')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={handleFormChange('role')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingUser && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={handleFormChange('password')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingUser
                    ? 'Save changes'
                    : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Superuser: reset another user's password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Reset password for {resetTarget.username}
              </h2>
              <button
                onClick={closeResetModal}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="px-5 py-4">
              {resetError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {resetError}
                </div>
              )}

              <p className="text-xs text-gray-500 mb-3">
                As a super admin, you can set a new password without knowing
                the current one.
              </p>

              <label className="block text-xs font-medium text-gray-600 mb-1">
                New password
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal (superuser only) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Delete {deleteTarget.username}?
              </h2>
            </div>

            <div className="px-5 py-4">
              {deleteError && (
                <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
              <p className="text-sm text-gray-600">
                This can't be undone. The user will lose access immediately.
              </p>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}