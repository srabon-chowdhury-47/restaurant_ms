import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  is_active: true,
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axiosInstance.get('/customers/customers/')
      const list = Array.isArray(data) ? data : data.results || []
      setCustomers(list)
    } catch (err) {
      setError('Could not load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const openCreateModal = () => {
    setEditingCustomer(null)
    setForm(emptyForm)
    setFormError('')
    setShowFormModal(true)
  }

  const openEditModal = (customer) => {
    setEditingCustomer(customer)
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      is_active: !!customer.is_active,
    })
    setFormError('')
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingCustomer(null)
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
      setFormError('Name is required.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim(),
        is_active: form.is_active,
      }

      if (editingCustomer) {
        await axiosInstance.patch(
          `/customers/customers/${editingCustomer.id}/`,
          payload
        )
      } else {
        await axiosInstance.post('/customers/customers/', payload)
      }

      closeFormModal()
      fetchCustomers()
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

  const openDeleteModal = (customer) => {
    setDeleteTarget(customer)
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
      await axiosInstance.delete(`/customers/customers/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchCustomers()
    } catch (err) {
      setDeleteError('Could not delete customer. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-50 rounded-md">
            <Users className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Customers
            </h1>
            <p className="text-xs text-gray-500">{customers.length} total</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add customer
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, email..."
          className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">
                Name
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">
                Phone
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">
                Email
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">
                Address
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">
                Status
              </th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 text-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-sm">
                  Loading customers...
                </td>
              </tr>
            )}

            {!loading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-sm">
                  No customers found.
                </td>
              </tr>
            )}

            {!loading &&
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-900 font-medium">
                    {customer.name}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {customer.phone || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {customer.email || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate">
                    {customer.address || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        customer.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => openEditModal(customer)}
                        title="Edit"
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(customer)}
                        title="Delete"
                        className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingCustomer ? 'Edit customer' : 'Add customer'}
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
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={handleFormChange('phone')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleFormChange('email')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={handleFormChange('address')}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
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
                    : editingCustomer
                    ? 'Save changes'
                    : 'Create customer'}
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