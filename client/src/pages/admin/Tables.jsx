import { Plus, Users } from 'lucide-react'

const tables = [
  { id: 1, name: 'Table 1', seats: 4, status: 'Available', zone: 'Main Hall' },
  { id: 2, name: 'Table 2', seats: 2, status: 'Occupied', zone: 'Main Hall' },
  { id: 3, name: 'Table 3', seats: 6, status: 'Reserved', zone: 'Main Hall' },
  { id: 4, name: 'Table 4', seats: 4, status: 'Available', zone: 'Patio' },
  { id: 5, name: 'Table 5', seats: 8, status: 'Occupied', zone: 'Patio' },
  { id: 6, name: 'Table 6', seats: 2, status: 'Available', zone: 'Bar' },
  { id: 7, name: 'Table 7', seats: 4, status: 'Cleaning', zone: 'Main Hall' },
  { id: 8, name: 'Table 8', seats: 6, status: 'Available', zone: 'Private Room' },
]

const statusStyles = {
  Available: 'bg-green-50 text-green-700 border-green-200',
  Occupied: 'bg-red-50 text-red-700 border-red-200',
  Reserved: 'bg-blue-50 text-blue-700 border-blue-200',
  Cleaning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default function Tables() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tables</h2>
          <p className="text-gray-500 mt-1">Manage restaurant seating and zones</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
              statusStyles[table.status].split(' ')[2]
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{table.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{table.zone}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[table.status]}`}>
                {table.status}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{table.seats} seats</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}