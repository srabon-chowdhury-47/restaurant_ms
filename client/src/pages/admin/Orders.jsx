import { Search, Filter, Eye } from 'lucide-react'

const orders = [
  { id: '#1024', customer: 'John Doe', table: 'Table 5', items: 4, total: '$86.00', status: 'Pending', time: '14:32' },
  { id: '#1023', customer: 'Sarah Smith', table: 'Takeaway', items: 2, total: '$34.50', status: 'Completed', time: '14:15' },
  { id: '#1022', customer: 'Mike Johnson', table: 'Table 12', items: 6, total: '$142.00', status: 'Preparing', time: '13:58' },
  { id: '#1021', customer: 'Emily Davis', table: 'Delivery', items: 3, total: '$67.25', status: 'Completed', time: '13:40' },
  { id: '#1020', customer: 'Chris Wilson', table: 'Table 3', items: 5, total: '$98.00', status: 'Pending', time: '13:22' },
]

const statusStyles = {
  Pending: 'bg-yellow-50 text-yellow-700',
  Preparing: 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
}

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500 mt-1">Manage and track all orders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          + New Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Table/Type</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-700">{order.table}</td>
                  <td className="px-6 py-4 text-gray-700">{order.items}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.time}</td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
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