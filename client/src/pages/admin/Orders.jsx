import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Plus,
  X,
  Trash2,
  Eye,
  Pencil,
  Printer,
  Minus,
  ImageOff,
} from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const STATUS_BADGE = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
}

const PAYMENT_BADGE = {
  PAID: 'bg-green-50 text-green-700',
  UNPAID: 'bg-gray-100 text-gray-500',
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'CARD', label: 'Card' },
]

const MFS_METHODS = ['BKASH', 'NAGAD', 'ROCKET']

const DISCOUNT_TYPES = [
  { value: 'NONE', label: 'No discount' },
  { value: 'PERCENT', label: '%' },
  { value: 'FLAT', label: '৳' },
]

const RESTAURANT_INFO = {
  name: 'RestoPOS Demo Kitchen',
  phone: '+880 1XXX-XXXXXX',
  address: '123 Demo Street, Jessore, Bangladesh',
}

export default function Orders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [statusFilter, setStatusFilter] = useState('all')

  const [viewOrder, setViewOrder] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // --- Edit modal state ---
  const [editOrder, setEditOrder] = useState(null)
  const [editCart, setEditCart] = useState([])
  const [editPaymentMethod, setEditPaymentMethod] = useState('CASH')
  const [editPaymentStatus, setEditPaymentStatus] = useState('UNPAID')
  const [editPaymentReference, setEditPaymentReference] = useState('')
  const [editDiscountType, setEditDiscountType] = useState('NONE')
  const [editDiscountValue, setEditDiscountValue] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editMenuItemToAdd, setEditMenuItemToAdd] = useState('')
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [ordersRes, menuRes] = await Promise.all([
        axiosInstance.get('/orders/orders/'),
        axiosInstance.get('/menu/items/'),
      ])
      const asList = (data) => (Array.isArray(data) ? data : data.results || [])
      setOrders(asList(ordersRes.data))
      setMenuItems(asList(menuRes.data))
    } catch (err) {
      setError('Could not load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // ============================================================
  // Quick status/payment change from the table
  // ============================================================

  const handleQuickStatusChange = async (order, field, value) => {
    try {
      await axiosInstance.patch(`/orders/orders/${order.id}/`, { [field]: value })
      fetchAll()
    } catch (err) {
      setError('Could not update order.')
    }
  }

  // ============================================================
  // Delete
  // ============================================================

  const openDeleteModal = (order) => {
    setDeleteTarget(order)
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await axiosInstance.delete(`/orders/orders/${deleteTarget.id}/`)
      closeDeleteModal()
      fetchAll()
    } catch (err) {
      setDeleteError('Could not delete order. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // ============================================================
  // Print (receipt-style)
  // ============================================================

  const handlePrint = (order) => {
    const win = window.open('', '_blank', 'width=380,height=600')
    if (!win) return

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding:2px 0;">${item.menu_item_name}</td>
          <td style="padding:2px 0;text-align:center;">${item.quantity}</td>
          <td style="padding:2px 0;text-align:right;">${item.line_total}</td>
        </tr>`
      )
      .join('')

    const html = `
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <style>
            @page { margin: 8px; }
            body {
              font-family: 'Courier New', monospace;
              width: 280px;
              margin: 0 auto;
              font-size: 12px;
              color: #000;
            }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            .totals td { padding: 2px 0; }
            .totals .label { text-align: left; }
            .totals .value { text-align: right; }
            .bold { font-weight: bold; }
            .small { font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size:14px;">${RESTAURANT_INFO.name}</div>
          <div class="center small">${RESTAURANT_INFO.phone}</div>
          <div class="center small">${RESTAURANT_INFO.address}</div>
          <div class="line"></div>

          <div class="small">Order #${order.id}</div>
          <div class="small">${new Date(order.created_at).toLocaleString()}</div>
          <div class="small">Customer: ${
            order.customer_detail ? order.customer_detail.name : 'Walk-in'
          }</div>
          ${
            order.table_detail
              ? `<div class="small">Table: ${order.table_detail.name}</div>`
              : ''
          }
          <div class="line"></div>

          <table>
            <thead>
              <tr class="small bold">
                <td>Item</td>
                <td style="text-align:center;">Qty</td>
                <td style="text-align:right;">Amt</td>
              </tr>
            </thead>
            <tbody class="small">
              ${itemsHtml}
            </tbody>
          </table>
          <div class="line"></div>

          <table class="totals small">
            <tr>
              <td class="label">Subtotal</td>
              <td class="value">৳${order.subtotal}</td>
            </tr>
            <tr>
              <td class="label">Discount</td>
              <td class="value">-৳${order.discount_amount}</td>
            </tr>
            <tr class="bold" style="font-size:13px;">
              <td class="label">Total</td>
              <td class="value">৳${order.total}</td>
            </tr>
          </table>
          <div class="line"></div>

          <div class="small">Payment: ${order.payment_method} (${order.payment_status})</div>
          ${
            order.payment_reference
              ? `<div class="small">Ref: ${order.payment_reference}</div>`
              : ''
          }
          <div class="line"></div>

          <div class="center small">Thank you for dining with us!</div>
        </body>
      </html>
    `

    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  // ============================================================
  // Edit modal
  // ============================================================

  const openEditModal = (order) => {
    setEditOrder(order)
    setEditCart(
      order.items.map((item) => ({
        menu_item: item.menu_item,
        name: item.menu_item_name,
        price: Number(item.unit_price),
        quantity: item.quantity,
      }))
    )
    setEditPaymentMethod(order.payment_method)
    setEditPaymentStatus(order.payment_status)
    setEditPaymentReference(order.payment_reference || '')
    setEditDiscountType(order.discount_type)
    setEditDiscountValue(
      order.discount_type === 'NONE' ? '' : String(order.discount_value)
    )
    setEditNotes(order.notes || '')
    setEditMenuItemToAdd('')
    setEditError('')
  }

  const closeEditModal = () => {
    setEditOrder(null)
    setEditCart([])
    setEditError('')
  }

  const addEditItem = () => {
    if (!editMenuItemToAdd) return
    const menuItem = menuItems.find((m) => String(m.id) === String(editMenuItemToAdd))
    if (!menuItem) return

    setEditCart((prev) => {
      const existing = prev.find((c) => String(c.menu_item) === String(menuItem.id))
      if (existing) {
        return prev.map((c) =>
          String(c.menu_item) === String(menuItem.id)
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      }
      return [
        ...prev,
        {
          menu_item: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          quantity: 1,
        },
      ]
    })
    setEditMenuItemToAdd('')
  }

  const incEditQty = (menuItemId) => {
    setEditCart((prev) =>
      prev.map((c) =>
        String(c.menu_item) === String(menuItemId)
          ? { ...c, quantity: c.quantity + 1 }
          : c
      )
    )
  }

  const decEditQty = (menuItemId) => {
    setEditCart((prev) =>
      prev
        .map((c) =>
          String(c.menu_item) === String(menuItemId)
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }

  const removeEditItem = (menuItemId) => {
    setEditCart((prev) => prev.filter((c) => String(c.menu_item) !== String(menuItemId)))
  }

  const editSubtotal = editCart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  const editDiscountAmount = (() => {
    const value = Number(editDiscountValue) || 0
    if (editDiscountType === 'PERCENT') {
      return (editSubtotal * value) / 100
    }
    if (editDiscountType === 'FLAT') {
      return Math.min(value, editSubtotal)
    }
    return 0
  })()

  const editTotal = editSubtotal - editDiscountAmount

  const editIsMfs = MFS_METHODS.includes(editPaymentMethod)
  const editIsCard = editPaymentMethod === 'CARD'
  const editNeedsReference = editIsMfs || editIsCard

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')

    if (editCart.length === 0) {
      setEditError('An order must have at least one item.')
      return
    }
    if (editDiscountType === 'PERCENT' && Number(editDiscountValue) > 100) {
      setEditError('Percentage discount cannot exceed 100.')
      return
    }
    if (editIsMfs && !editPaymentReference.trim()) {
      setEditError('Enter the sender\u2019s MFS number.')
      return
    }
    if (editIsCard && !/^\d{4}$/.test(editPaymentReference.trim())) {
      setEditError('Card reference must be exactly 4 digits.')
      return
    }

    setSavingEdit(true)

    try {
      const payload = {
        payment_method: editPaymentMethod,
        payment_status: editPaymentStatus,
        payment_reference: editNeedsReference ? editPaymentReference.trim() : '',
        discount_type: editDiscountType,
        discount_value: editDiscountValue || '0',
        notes: editNotes.trim(),
        items: editCart.map((c) => ({
          menu_item: c.menu_item,
          quantity: c.quantity,
        })),
      }

      await axiosInstance.patch(`/orders/orders/${editOrder.id}/`, payload)
      closeEditModal()
      fetchAll()
    } catch (err) {
      const data = err.response && err.response.data
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstMsg = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey]
        setEditError(firstMsg || 'Something went wrong.')
      } else {
        setEditError('Something went wrong. Please try again.')
      }
    } finally {
      setSavingEdit(false)
    }
  }

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter)

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-50 rounded-md">
            <ShoppingCart className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Orders
            </h1>
            <p className="text-xs text-gray-500">{orders.length} total</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/orders/add')}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New order
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            statusFilter === 'all'
              ? 'bg-brand-600 text-white border-brand-600'
              : 'text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">#</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Customer</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Table</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Received by</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Total</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Status</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 text-xs">Payment</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 text-xs">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading && filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">
                  No orders found.
                </td>
              </tr>
            )}

            {!loading &&
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-900 font-medium">
                    #{order.id}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {order.customer_detail ? order.customer_detail.name : 'Walk-in'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {order.table_detail ? order.table_detail.name : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {order.received_by_detail ? order.received_by_detail.username : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-900 font-medium">
                    ৳{order.total}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleQuickStatusChange(order, 'status', e.target.value)
                      }
                      className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-brand-600 ${
                        STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={order.payment_status}
                      onChange={(e) =>
                        handleQuickStatusChange(order, 'payment_status', e.target.value)
                      }
                      className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 focus:outline-none focus:ring-1 focus:ring-brand-600 ${
                        PAYMENT_BADGE[order.payment_status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => setViewOrder(order)}
                        title="View"
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(order)}
                        title="Edit"
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(order)}
                        title="Delete"
                        className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* View order modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Order #{viewOrder.id}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePrint(viewOrder)}
                  title="Print receipt"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <span className="text-gray-400">Customer:</span>{' '}
                  {viewOrder.customer_detail ? viewOrder.customer_detail.name : 'Walk-in'}
                </div>
                <div>
                  <span className="text-gray-400">Table:</span>{' '}
                  {viewOrder.table_detail ? viewOrder.table_detail.name : '—'}
                </div>
                <div>
                  <span className="text-gray-400">Received by:</span>{' '}
                  {viewOrder.received_by_detail
                    ? viewOrder.received_by_detail.username
                    : '—'}
                </div>
                <div>
                  <span className="text-gray-400">Payment:</span>{' '}
                  {viewOrder.payment_method} · {viewOrder.payment_status}
                </div>
                {viewOrder.payment_reference && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Ref:</span>{' '}
                    {viewOrder.payment_reference}
                  </div>
                )}
              </div>

              <table className="w-full text-xs mb-3">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="text-left py-1.5 font-medium text-gray-600">Item</th>
                    <th className="text-left py-1.5 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-1.5 font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1.5 text-gray-800">{item.menu_item_name}</td>
                      <td className="py-1.5 text-gray-800">{item.quantity}</td>
                      <td className="py-1.5 text-right text-gray-800">
                        ৳{item.line_total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-gray-100 pt-2.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{viewOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-৳{viewOrder.discount_amount}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 mt-1">
                  <span>Total</span>
                  <span>৳{viewOrder.total}</span>
                </div>
              </div>

              {viewOrder.notes && (
                <p className="text-xs text-gray-500 mt-3">
                  <span className="text-gray-400">Notes:</span> {viewOrder.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit order modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Edit order #{editOrder.id}
              </h2>
              <button
                onClick={closeEditModal}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="px-4 py-3">
              {editError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {editError}
                </div>
              )}

              {/* Add item */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Add item
                </label>
                <div className="flex gap-2">
                  <select
                    value={editMenuItemToAdd}
                    onChange={(e) => setEditMenuItemToAdd(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="">Select a menu item</option>
                    {menuItems
                      .filter((m) => m.is_active)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — ৳{m.price}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={addEditItem}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Cart */}
              <div className="mb-3 border border-gray-200 rounded-md overflow-hidden">
                {editCart.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No items</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-2.5 py-1.5 font-medium text-gray-600">Item</th>
                        <th className="text-left px-2.5 py-1.5 font-medium text-gray-600 w-24">Qty</th>
                        <th className="text-right px-2.5 py-1.5 font-medium text-gray-600">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {editCart.map((c) => (
                        <tr key={c.menu_item}>
                          <td className="px-2.5 py-1.5 text-gray-800">{c.name}</td>
                          <td className="px-2.5 py-1.5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => decEditQty(c.menu_item)}
                                className="p-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center">{c.quantity}</span>
                              <button
                                type="button"
                                onClick={() => incEditQty(c.menu_item)}
                                className="p-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-2.5 py-1.5 text-right text-gray-800">
                            ৳{(c.price * c.quantity).toFixed(2)}
                          </td>
                          <td className="px-1">
                            <button
                              type="button"
                              onClick={() => removeEditItem(c.menu_item)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Discount type
                  </label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => {
                      setEditDiscountType(e.target.value)
                      if (e.target.value === 'NONE') setEditDiscountValue('')
                    }}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {DISCOUNT_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Discount value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={editDiscountType === 'NONE'}
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Payment method
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => {
                      setEditPaymentMethod(e.target.value)
                      if (e.target.value === 'CASH') setEditPaymentReference('')
                    }}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Payment status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>

              {editNeedsReference && (
                <div className="mb-2.5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {editIsCard
                      ? 'Last 4 digits of card'
                      : `${editPaymentMethod} sender number`}
                  </label>
                  <input
                    type="text"
                    maxLength={editIsCard ? 4 : 20}
                    value={editPaymentReference}
                    onChange={(e) => setEditPaymentReference(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-2.5 mb-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{editSubtotal.toFixed(2)}</span>
                </div>
                {editDiscountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span>-৳{editDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 mt-1">
                  <span>Total</span>
                  <span>৳{editTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Delete order #{deleteTarget.id}?
              </h2>
            </div>

            <div className="px-4 py-3">
              {deleteError && (
                <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                  {deleteError}
                </div>
              )}
              <p className="text-xs text-gray-600">This can't be undone.</p>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}