import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const STATUS_BADGE = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
}

function isToday(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const [ordersRes, customersRes] = await Promise.all([
          axiosInstance.get('/orders/orders/'),
          axiosInstance.get('/customers/customers/'),
        ])
        const asList = (data) => (Array.isArray(data) ? data : data.results || [])
        setOrders(asList(ordersRes.data))
        setCustomers(asList(customersRes.data))
      } catch (err) {
        setError('Could not load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const todaysOrders = orders.filter((o) => isToday(o.created_at))

  const todaysRevenue = todaysOrders
    .filter((o) => o.status === 'COMPLETED' && o.payment_status === 'PAID')
    .reduce((sum, o) => sum + Number(o.total), 0)

  const todaysOrderCount = todaysOrders.length

  const todaysCustomerCount = todaysOrders.filter((o) => o.customer_detail).length

  const avgOrderValue = todaysOrderCount > 0
    ? todaysOrders.reduce((sum, o) => sum + Number(o.total), 0) / todaysOrderCount
    : 0

  const stats = [
    {
      label: 'Revenue Today',
      value: `৳${todaysRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Orders Today',
      value: String(todaysOrderCount),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Customers Today',
      value: String(todaysCustomerCount),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Avg. Order Today',
      value: `৳${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const popularItems = (() => {
    const counts = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        counts[item.menu_item_name] = (counts[item.menu_item_name] || 0) + item.quantity
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  })()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your restaurant performance</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className={`p-2.5 rounded-lg inline-flex ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-4">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Latest 5 orders placed</p>
              <div className="mt-4 space-y-3">
                {recentOrders.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No orders yet.</p>
                )}
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm text-gray-700">
                      Order #{order.id} —{' '}
                      {order.table_detail ? order.table_detail.name : 'Walk-in'}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Popular Items</h3>
              <p className="text-sm text-gray-500 mt-1">Top selling menu items (all time)</p>
              <div className="mt-4 space-y-3">
                {popularItems.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No sales yet.</p>
                )}
                {popularItems.map(([name, qty], i) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm text-gray-700">{name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{qty} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}