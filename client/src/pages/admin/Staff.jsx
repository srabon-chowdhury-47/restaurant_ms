import { Plus, Shield, Clock } from 'lucide-react'

const staff = [
  { id: 1, name: 'Alice Brown', role: 'Manager', email: 'alice@resto.com', status: 'Active', shift: 'Full-time' },
  { id: 2, name: 'Bob Green', role: 'Chef', email: 'bob@resto.com', status: 'Active', shift: 'Full-time' },
  { id: 3, name: 'Carol White', role: 'Waiter', email: 'carol@resto.com', status: 'Active', shift: 'Part-time' },
  { id: 4, name: 'David Black', role: 'Bartender', email: 'david@resto.com', status: 'On Leave', shift: 'Full-time' },
  { id: 5, name: 'Eva Gray', role: 'Hostess', email: 'eva@resto.com', status: 'Active', shift: 'Part-time' },
]

const roleColors = {
  Manager: 'bg-purple-50 text-purple-700',
  Chef: 'bg-orange-50 text-orange-700',
  Waiter: 'bg-blue-50 text-blue-700',
  Bartender: 'bg-pink-50 text-pink-700',
  Hostess: 'bg-teal-50 text-teal-700',
}

export default function Staff() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff</h2>
          <p className="text-gray-500 mt-1">Manage your team members</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                member.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {member.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-3">{member.name}</h3>
            <div className="mt-2 space-y-2">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                {member.role}
              </span>
              <p className="text-sm text-gray-500">{member.email}</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{member.shift}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}