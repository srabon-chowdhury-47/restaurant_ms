import { useEffect, useState } from 'react'
import { Grid3X3, Plus, Users2, Pencil, Trash2, X } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'CLEANING', label: 'Cleaning' },
]

const STATUS_STYLES = {
  AVAILABLE: {
    border: 'border-green-200',
    badge: 'bg-green-50 text-green-700 border border-green-200',
  },
  OCCUPIED: {
    border: 'border-red-200',
    badge: 'bg-red-50 text-red-700 border border-red-200',
  },
  RESERVED: {
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  CLEANING: {
    border: 'border-yellow-200',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  },
}

const emptyForm = {
  name: '',
  zone: '',
  capacity: 2,
  status: 'AVAILABLE',
  is_active: true,
}

export default function Tables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchTables = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axiosInstance.get('/tables/tables/')
      const list = Array.isArray(data) ? data : data.results || []
      setTables(list)
    } catch (err) {
      setError('Could not load tables.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const openCreateModal = () => {
    setEditingTable(null)
    setForm(emptyForm)
    setFormError('')
    setShowFormModal(true)
  }

  const openEditModal = (table) => {
    setEditingTable(table)
    setForm({
      name: table.name || '',
      zone: table.zone || '',
      capacity: table.capacity || 2,
      status: table.status || 'AVAILABLE',
      is_active: !!table.is_active,
    })
    setFormError('')
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingTable(null)
    setForm(emptyForm)
    setFormError('')
  }

  const handleFormChange = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) {
      setFormError('Table name is required.')
      return
    }
    if (!form.capacity || Number(form.capacity) < 1) {
      setFormError('Enter a valid seat capacity.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        zone: form.zone.trim(),
        capacity: Number(form.capacity),
        status: form.status,
        is_active: form.is_active,
      }

      if (editingTable) {
        await axiosInstance.patch(`/tables/tables/${editingTable.id}/`, payload)
      } else {
        await axiosInstance.post('/tables/tables/', payload)
      }

      closeFormModal()
      fetchTables()
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

  // Quick status change directly from the card, without opening the modal
  const handleQuickStatusChange = async (table, newStatus) => {
    try {
      await axiosInstance.patch(`/tables/tables/${table.id}/`, {
        status: newStatus,
      })
      fetchTables()
    } catch (err) {
      setError('Could not update status.')
    }
  }

  const openDeleteModal = (table) => {
    setDeleteTarget(table)
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
      await axiosInstance.delete(`/tables/tables/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchTables()
    } catch (err) {
      setDeleteError('Could not delete table. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-50 rounded-md">
            <Grid3X3 className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Tables
            </h1>
            <p className="text-xs text-gray-500">
              {tables.length} tables · manage seating and zones
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add table
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading tables...
        </div>
      )}

      {!loading && tables.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No tables yet. Add your first one.
        </div>
      )}

      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tables.map((table) => {
            const style = STATUS_STYLES[table.status] || STATUS_STYLES.AVAILABLE
            return (
              <div
                key={table.id}
                className={`bg-white rounded-lg border ${style.border} p-4`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    {table.name}
                  </h3>
                  <select
                    value={table.status}
                    onChange={(e) => handleQuickStatusChange(table, e.target.value)}
                    className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-brand-600 ${style.badge}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {table.zone && (
                  <p className="text-xs text-gray-500 mt-0.5">{table.zone}</p>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Users2 className="w-3.5 h-3.5" />
                  {table.capacity} seats
                </div>

                {!table.is_active && (
                  <span className="inline-flex mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                    Inactive
                  </span>
                )}

                <div className="flex items-center justify-end gap-0.5 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(table)}
                    title="Edit"
                    className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(table)}
                    title="Delete"
                    className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingTable ? 'Edit table' : 'Add table'}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="px-4 py-3">
              {formError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleFormChange('name')}
                  placeholder="e.g. Table 9"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Zone
                </label>
                <input
                  type="text"
                  value={form.zone}
                  onChange={handleFormChange('zone')}
                  placeholder="e.g. Main Hall, Patio, Bar"
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleFormChange('capacity')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={handleFormChange('status')}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-gray-700 mb-4">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleFormChange('is_active')}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                Active
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingTable
                    ? 'Save changes'
                    : 'Create table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Delete {deleteTarget.name}?
              </h2>
            </div>

            <div className="px-4 py-3">
              {deleteError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {deleteError}
                </div>
              )}
              <p className="text-xs text-gray-600">This can't be undone.</p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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