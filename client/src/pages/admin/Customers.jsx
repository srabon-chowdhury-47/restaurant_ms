import { Search, Mail, Phone, User } from 'lucide-react'

const customers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', visits: 24, total: '$1,240' },
  { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 234 567 891', visits: 18, total: '$980' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 892', visits: 32, total: '$1,560' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234 567 893', visits: 12, total: '$620' },
  { id: 5, name: 'Chris Wilson', email: 'chris@example.com', phone: '+1 234 567 894', visits: 8, total: '$340' },
]

export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <p className="text-gray-500 mt-1">Manage your customer database</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Visits</th>
                <th className="px-6 py-3">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{customer.visits}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{customer.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}