import { useEffect, useState } from 'react'
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  X,
  ImageOff,
  Tags,
} from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const emptyForm = {
  category: '',
  name: '',
  description: '',
  price: '',
  is_available: true,
  is_active: true,
  image: null,
}

const emptyCategoryForm = {
  name: '',
  description: '',
  is_active: true,
}

export default function Menu() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [categoryFilter, setCategoryFilter] = useState('all')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // --- Category modal state ---
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormError, setCategoryFormError] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(false)
  const [deleteCategoryError, setDeleteCategoryError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/menu/items/'),
        axiosInstance.get('/menu/categories/'),
      ])
      const itemsList = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : itemsRes.data.results || []
      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data.results || []
      setItems(itemsList)
      setCategories(categoriesList)
    } catch (err) {
      setError('Could not load menu data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // ============================================================
  // Menu item handlers
  // ============================================================

  const openCreateModal = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setImagePreview(null)
    setFormError('')
    setShowFormModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setForm({
      category: item.category || '',
      name: item.name || '',
      description: item.description || '',
      price: item.price != null ? String(item.price) : '',
      is_available: !!item.is_available,
      is_active: !!item.is_active,
      image: null,
    })
    setImagePreview(item.image || null)
    setFormError('')
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingItem(null)
    setForm(emptyForm)
    setImagePreview(null)
    setFormError('')
  }

  const handleFormChange = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setForm((prev) => ({ ...prev, image: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.category) {
      setFormError('Choose a category.')
      return
    }
    if (!form.name.trim()) {
      setFormError('Name is required.')
      return
    }
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Enter a valid price.')
      return
    }

    setSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('category', form.category)
      payload.append('name', form.name.trim())
      payload.append('description', form.description.trim())
      payload.append('price', form.price)
      payload.append('is_available', form.is_available)
      payload.append('is_active', form.is_active)
      if (form.image) {
        payload.append('image', form.image)
      }

      if (editingItem) {
        await axiosInstance.patch(`/menu/items/${editingItem.id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await axiosInstance.post('/menu/items/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
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

  const openDeleteModal = (item) => {
    setDeleteTarget(item)
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
      await axiosInstance.delete(`/menu/items/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchAll()
    } catch (err) {
      setDeleteError('Could not delete item. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // ============================================================
  // Category handlers
  // ============================================================

  const openCreateCategoryModal = () => {
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
    setCategoryFormError('')
    setShowCategoryModal(true)
  }

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat)
    setCategoryForm({
      name: cat.name || '',
      description: cat.description || '',
      is_active: !!cat.is_active,
    })
    setCategoryFormError('')
    setShowCategoryModal(true)
  }

  const closeCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
    setCategoryFormError('')
  }

  const handleCategoryFormChange = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setCategoryFormError('')

    if (!categoryForm.name.trim()) {
      setCategoryFormError('Category name is required.')
      return
    }

    setSavingCategory(true)

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        is_active: categoryForm.is_active,
      }

      if (editingCategory) {
        await axiosInstance.patch(
          `/menu/categories/${editingCategory.id}/`,
          payload
        )
      } else {
        await axiosInstance.post('/menu/categories/', payload)
      }

      closeCategoryModal()
      fetchAll()
    } catch (err) {
      const data = err.response && err.response.data
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstMsg = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey]
        setCategoryFormError(firstMsg || 'Something went wrong.')
      } else {
        setCategoryFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSavingCategory(false)
    }
  }

  const openDeleteCategoryModal = (cat) => {
    setDeleteCategoryTarget(cat)
    setDeleteCategoryError('')
  }

  const closeDeleteCategoryModal = () => {
    setDeleteCategoryTarget(null)
    setDeleteCategoryError('')
  }

  const handleDeleteCategoryConfirm = async () => {
    setDeletingCategory(true)
    setDeleteCategoryError('')
    try {
      await axiosInstance.delete(`/menu/categories/${deleteCategoryTarget.id}/`)
      closeDeleteCategoryModal()
      fetchAll()
    } catch (err) {
      setDeleteCategoryError(
        'Could not delete. This category may still have menu items linked to it.'
      )
    } finally {
      setDeletingCategory(false)
    }
  }

  const filteredItems =
    categoryFilter === 'all'
      ? items
      : items.filter((item) => String(item.category) === String(categoryFilter))

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-50 rounded-md">
            <UtensilsCrossed className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">Menu</h1>
            <p className="text-xs text-gray-500">
              {categories.length} categories · {items.length} items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateCategoryModal}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Tags className="w-3.5 h-3.5" />
            Category
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Category chips + filter, single row */}
      {categories.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === 'all'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(String(cat.id))}
              onDoubleClick={() => openEditCategoryModal(cat)}
              title="Double-click to edit"
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                categoryFilter === String(cat.id)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : cat.is_active
                  ? 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  : 'text-gray-400 border-gray-100 bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading menu items...
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          No menu items yet.
        </div>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col"
            >
              <div className="h-24 bg-gray-100 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-6 h-6 text-gray-300" />
                )}
              </div>

              <div className="p-2.5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-xs font-semibold text-gray-900 leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-xs font-semibold text-brand-700 whitespace-nowrap">
                    ৳{item.price}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{item.category_name}</p>

                <div className="flex items-center gap-1 mt-1.5">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.is_available
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  {!item.is_active && (
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-0.5 mt-auto pt-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit"
                    className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    title="Delete"
                    className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit item modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingItem ? 'Edit item' : 'Add item'}
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
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={handleFormChange('category')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={handleFormChange('description')}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleFormChange('price')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-1.5 h-16 w-16 object-cover rounded border border-gray-200"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={handleFormChange('is_available')}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                  />
                  Available
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={handleFormChange('is_active')}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                  />
                  Active
                </label>
              </div>

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
                    : editingItem
                    ? 'Save changes'
                    : 'Create item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete item confirmation modal */}
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

      {/* Category create/edit modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                {editingCategory ? 'Edit category' : 'Add category'}
              </h2>
              <button
                onClick={closeCategoryModal}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="px-4 py-3">
              {categoryFormError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {categoryFormError}
                </div>
              )}

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange('name')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  placeholder="e.g. Beverages"
                />
              </div>

              <div className="mb-2.5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange('description')}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <label className="flex items-center gap-1.5 text-xs text-gray-700 mb-3">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={handleCategoryFormChange('is_active')}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                Active
              </label>

              <div className="flex items-center justify-between gap-2">
                {editingCategory ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeCategoryModal()
                      openDeleteCategoryModal(editingCategory)
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete category
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeCategoryModal}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {savingCategory
                      ? 'Saving...'
                      : editingCategory
                      ? 'Save changes'
                      : 'Create category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete category confirmation modal */}
      {deleteCategoryTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Delete "{deleteCategoryTarget.name}"?
              </h2>
            </div>

            <div className="px-4 py-3">
              {deleteCategoryError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {deleteCategoryError}
                </div>
              )}
              <p className="text-xs text-gray-600">
                Categories with linked menu items can't be deleted — move or
                remove those items first.
              </p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeDeleteCategoryModal}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategoryConfirm}
                  disabled={deletingCategory}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingCategory ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}