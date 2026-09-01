import { BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500 mt-1">Analytics and business insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last 7 days</span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full max-w-[40px] bg-brand-500 rounded-t-lg"
                  style={{ height: `${h * 2}px` }}
                />
                <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Main Course', value: 45, amount: '$5,600' },
              { label: 'Pizza', value: 25, amount: '$3,100' },
              { label: 'Beverages', value: 15, amount: '$1,860' },
              { label: 'Desserts', value: 10, amount: '$1,240' },
              { label: 'Salads', value: 5, amount: '$620' },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{cat.label}</span>
                  <span className="font-medium text-gray-900">{cat.amount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Avg. Table Turnover', value: '45 min' },
            { label: 'Customer Satisfaction', value: '4.8/5' },
            { label: 'Repeat Customer Rate', value: '62%' },
            { label: 'Waste Ratio', value: '3.2%' },
          ].map((metric) => (
            <div key={metric.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}