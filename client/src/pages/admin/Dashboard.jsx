import { TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react'

const stats = [
  { label: 'Total Revenue', value: '$12,450', change: '+12%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Total Orders', value: '1,284', change: '+8%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Customers', value: '856', change: '+5%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Avg. Order', value: '$42.50', change: '+3%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your restaurant performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-4">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500 mt-1">Latest 5 orders placed today</p>
          <div className="mt-4 space-y-3">
            {['Order #1024 - Table 5', 'Order #1023 - Takeaway', 'Order #1022 - Table 12', 'Order #1021 - Delivery', 'Order #1020 - Table 3'].map((order) => (
              <div key={order} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{order}</span>
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
          <p className="text-sm text-gray-500 mt-1">Top selling menu items today</p>
          <div className="mt-4 space-y-3">
            {['Margherita Pizza', 'Grilled Salmon', 'Caesar Salad', 'Pasta Carbonara', 'Tiramisu'].map((item, i) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{124 - i * 15} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}