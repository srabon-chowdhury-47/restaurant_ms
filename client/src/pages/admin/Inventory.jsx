import { AlertTriangle, Package, Plus } from 'lucide-react'

const inventory = [
  { id: 1, item: 'Tomatoes', category: 'Vegetables', quantity: 25, unit: 'kg', minLevel: 20, status: 'OK' },
  { id: 2, item: 'Chicken Breast', category: 'Meat', quantity: 12, unit: 'kg', minLevel: 15, status: 'Low' },
  { id: 3, item: 'Olive Oil', category: 'Oils', quantity: 8, unit: 'L', minLevel: 5, status: 'OK' },
  { id: 4, item: 'Flour', category: 'Dry Goods', quantity: 45, unit: 'kg', minLevel: 30, status: 'OK' },
  { id: 5, item: 'Mozzarella', category: 'Dairy', quantity: 3, unit: 'kg', minLevel: 5, status: 'Low' },
  { id: 6, item: 'Basil', category: 'Herbs', quantity: 0.5, unit: 'kg', minLevel: 1, status: 'Critical' },
]

const statusStyles = {
  OK: 'bg-green-50 text-green-700',
  Low: 'bg-yellow-50 text-yellow-700',
  Critical: 'bg-red-50 text-red-700',
}

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500 mt-1">Track stock levels and supplies</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">142</p>
            <p className="text-sm text-gray-500">Total Items</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-sm text-gray-500">Low Stock</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-500">Critical</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Min Level</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{item.item}</td>
                <td className="px-6 py-4 text-gray-700">{item.category}</td>
                <td className="px-6 py-4 text-gray-900">{item.quantity} {item.unit}</td>
                <td className="px-6 py-4 text-gray-500">{item.minLevel} {item.unit}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}