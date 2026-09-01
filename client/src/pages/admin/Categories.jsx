import { Plus, Pencil, Trash2, Tag } from 'lucide-react'

const categories = [
  { id: 1, name: 'Pizza', items: 8, color: 'bg-red-100 text-red-700' },
  { id: 2, name: 'Pasta', items: 6, color: 'bg-yellow-100 text-yellow-700' },
  { id: 3, name: 'Salads', items: 5, color: 'bg-green-100 text-green-700' },
  { id: 4, name: 'Main Course', items: 12, color: 'bg-blue-100 text-blue-700' },
  { id: 5, name: 'Desserts', items: 7, color: 'bg-purple-100 text-purple-700' },
  { id: 6, name: 'Beverages', items: 15, color: 'bg-orange-100 text-orange-700' },
]

export default function Categories() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 mt-1">Organize your menu categories</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${cat.color}`}>
                <Tag className="w-5 h-5" />
              </div>
              <div className="inline-flex gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mt-4">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{cat.items} items</p>
          </div>
        ))}
      </div>
    </div>
  )
}