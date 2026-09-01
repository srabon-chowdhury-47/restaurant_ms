import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

const menuItems = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: '$14.00', status: 'Active', image: '🍕' },
  { id: 2, name: 'Grilled Salmon', category: 'Main Course', price: '$24.00', status: 'Active', image: '🐟' },
  { id: 3, name: 'Caesar Salad', category: 'Salads', price: '$12.00', status: 'Active', image: '🥗' },
  { id: 4, name: 'Pasta Carbonara', category: 'Pasta', price: '$18.00', status: 'Active', image: '🍝' },
  { id: 5, name: 'Tiramisu', category: 'Desserts', price: '$9.00', status: 'Inactive', image: '🍰' },
]

export default function Menu() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
          <p className="text-gray-500 mt-1">Manage your restaurant menu items</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.image}</span>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}