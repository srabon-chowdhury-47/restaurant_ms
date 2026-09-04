import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Reports() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const [ordersRes, menuRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/orders/orders/'),
          axiosInstance.get('/menu/items/'),
          axiosInstance.get('/menu/categories/'),
        ])
        const asList = (data) => (Array.isArray(data) ? data : data.results || [])
        setOrders(asList(ordersRes.data))
        setMenuItems(asList(menuRes.data))
        setCategories(asList(categoriesRes.data))
      } catch (err) {
        setError('Could not load report data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // --- Sales overview: last 7 days, revenue from COMPLETED + PAID orders ---
  const salesLast7Days = (() => {
    const today = startOfDay(new Date())
    const days = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)
      days.push(day)
    }

    return days.map((day) => {
      const dayTotal = orders
        .filter(
          (o) =>
            o.status === 'COMPLETED' &&
            o.payment_status === 'PAID' &&
            startOfDay(o.created_at).getTime() === day.getTime()
        )
        .reduce((sum, o) => sum + Number(o.total), 0)

      return {
        label: DAY_LABELS[day.getDay()],
        value: dayTotal,
      }
    })
  })()

  const maxDayValue = Math.max(1, ...salesLast7Days.map((d) => d.value))

  // --- Revenue by category, from COMPLETED + PAID orders' line items ---
  const revenueByCategory = (() => {
    const menuItemToCategory = {}
    menuItems.forEach((m) => {
      menuItemToCategory[m.id] = m.category_name || 'Uncategorized'
    })

    const totals = {}
    orders
      .filter((o) => o.status === 'COMPLETED' && o.payment_status === 'PAID')
      .forEach((o) => {
        o.items.forEach((item) => {
          const catName = menuItemToCategory[item.menu_item] || 'Uncategorized'
          totals[catName] = (totals[catName] || 0) + Number(item.line_total)
        })
      })

    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])
    const grandTotal = entries.reduce((sum, [, v]) => sum + v, 0)

    return entries.map(([label, amount]) => ({
      label,
      amount,
      percent: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
    }))
  })()

  // --- Key metrics ---
  const completedPaidOrders = orders.filter(
    (o) => o.status === 'COMPLETED' && o.payment_status === 'PAID'
  )

  const totalOrders = orders.length

  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length
  const cancellationRate =
    totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : '0.0'

  const avgOrderValue =
    completedPaidOrders.length > 0
      ? (
          completedPaidOrders.reduce((sum, o) => sum + Number(o.total), 0) /
          completedPaidOrders.length
        ).toFixed(2)
      : '0.00'

  const repeatCustomerRate = (() => {
    const ordersByCustomer = {}
    orders.forEach((o) => {
      if (!o.customer_detail) return
      const id = o.customer_detail.id
      ordersByCustomer[id] = (ordersByCustomer[id] || 0) + 1
    })
    const customerIds = Object.keys(ordersByCustomer)
    if (customerIds.length === 0) return '0.0'
    const repeatCount = customerIds.filter((id) => ordersByCustomer[id] > 1).length
    return ((repeatCount / customerIds.length) * 100).toFixed(1)
  })()

  const metrics = [
    { label: 'Total Orders', value: String(totalOrders) },
    { label: 'Avg. Order Value', value: `৳${avgOrderValue}` },
    { label: 'Repeat Customer Rate', value: `${repeatCustomerRate}%` },
    { label: 'Cancellation Rate', value: `${cancellationRate}%` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500 mt-1">Analytics and business insights</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading reports...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Last 7 days</span>
                </div>
              </div>

              {salesLast7Days.every((d) => d.value === 0) ? (
                <p className="text-sm text-gray-400 text-center py-16">
                  No completed & paid sales in the last 7 days.
                </p>
              ) : (
                <div className="h-48 flex items-end justify-between gap-2">
                  {salesLast7Days.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full max-w-[40px] bg-brand-500 rounded-t-lg transition-all"
                        style={{
                          height: `${Math.max(4, (d.value / maxDayValue) * 160)}px`,
                        }}
                        title={`৳${d.value.toFixed(2)}`}
                      />
                      <span className="text-xs text-gray-500">{d.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>

              {revenueByCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16">
                  No completed & paid sales yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {revenueByCategory.map((cat) => (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{cat.label}</span>
                        <span className="font-medium text-gray-900">
                          ৳{cat.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}