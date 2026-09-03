import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SidebarLayout from './layouts/SidebarLayout'
import Login from './components/login'

import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Tables from './pages/admin/Tables'
import Menu from './pages/admin/Menu'
import Categories from './pages/admin/Categories'
import Customers from './pages/admin/Customers'
import Staff from './pages/admin/Staff'
import Inventory from './pages/admin/Inventory'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'

function PrivateRoute({ children }) {
  const accessToken = localStorage.getItem('access_token')
  return accessToken ? children : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <PrivateRoute>
              <SidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}