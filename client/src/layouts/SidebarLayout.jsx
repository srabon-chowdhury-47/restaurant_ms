import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'

export default function SidebarLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}