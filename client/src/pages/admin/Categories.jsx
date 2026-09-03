import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const COLOR_PALETTE = [
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

const emptyForm = {
  name: '',
  description: '',
  is_active: true,
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [itemCounts, setItemCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axiosInstance.get('/menu/categories/'),
        axiosInstance.get('/menu/items/'),
      ])
      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.results || []
      const itemsList = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : itemsRes.data.results || []

      const counts = {}
      itemsList.forEach((item) => {
        counts[item.category] = (counts[item.category] || 0) + 1
      })

      setCategories(categoriesList)
      setItemCounts(counts)
    } catch (err) {
      setError('Could not load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setFormError('')
    setShowFormModal(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      is_active: !!cat.is_active,
    })
    setFormError('')
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingCategory(null)
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
      setFormError('Category name is required.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
      }

      if (editingCategory) {
        await axiosInstance.patch(
          `/menu/categories/${editingCategory.id}/`,
          payload
        )
      } else {
        await axiosInstance.post('/menu/categories/', payload)
      }

      closeFormModal()
      fetchAll()
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

  const openDeleteModal = (cat) => {
    setDeleteTarget(cat)
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
      await axiosInstance.delete(`/menu/categories/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchAll()
    } catch (err) {
      setDeleteError(
        'Could not delete. This category may still have menu items linked to it.'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 mt-1">Organize your menu categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Loading categories...
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No categories yet. Add your first one.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div
                    className={`p-2 rounded-md ${
                    COLOR_PALETTE[index % COLOR_PALETTE.length]
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <div className="inline-flex gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                {!cat.is_active && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {itemCounts[cat.id] || 0} items
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingCategory ? 'Edit category' : 'Add category'}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="px-3 py-2">
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
                  placeholder="e.g. Beverages"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={handleFormChange('description')}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <label className="flex items-center gap-1.5 text-xs text-gray-700 mb-3">
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
                    : editingCategory
                    ? 'Save changes'
                    : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[20rem]">
            <div className="px-3 py-2 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Delete "{deleteTarget.name}"?
              </h2>
            </div>

            <div className="px-3 py-2">
              {deleteError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {deleteError}
                </div>
              )}
              <p className="text-xs text-gray-600">
                Categories with linked menu items can't be deleted — move or
                remove those items first.
              </p>

              <div className="flex justify-end gap-1.5 mt-3">
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