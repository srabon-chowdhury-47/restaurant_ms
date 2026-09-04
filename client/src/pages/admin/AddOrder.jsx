import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, X, ImageOff } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

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

export default function AddOrder() {
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [tables, setTables] = useState([])
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [activeCategory, setActiveCategory] = useState('all')

  const [cart, setCart] = useState([]) // [{ menu_item, name, price, quantity }]

  const [customer, setCustomer] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const [table, setTable] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentStatus, setPaymentStatus] = useState('PAID') // walk-in default
  const [paymentStatusTouched, setPaymentStatusTouched] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')
  const [discountType, setDiscountType] = useState('NONE')
  const [discountValue, setDiscountValue] = useState('')
  const [notes, setNotes] = useState('')

  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [customersRes, tablesRes, categoriesRes, menuRes] = await Promise.all([
          axiosInstance.get('/customers/customers/'),
          axiosInstance.get('/tables/tables/'),
          axiosInstance.get('/menu/categories/'),
          axiosInstance.get('/menu/items/'),
        ])
        const asList = (data) => (Array.isArray(data) ? data : data.results || [])
        setCustomers(asList(customersRes.data))
        setTables(asList(tablesRes.data))
        setCategories(asList(categoriesRes.data))
        setMenuItems(asList(menuRes.data))
      } catch (err) {
        setLoadError('Could not load menu data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Smart default: walk-in (no customer) -> PAID, registered customer -> UNPAID.
  // Only applies while the staff hasn't manually overridden the value.
  useEffect(() => {
    if (paymentStatusTouched) return
    setPaymentStatus(customer ? 'UNPAID' : 'PAID')
  }, [customer, paymentStatusTouched])

  // Clear the reference field whenever the method no longer needs one
  useEffect(() => {
    if (paymentMethod === 'CASH') {
      setPaymentReference('')
    }
  }, [paymentMethod])

  // Clear the discount value whenever discount type is set back to none
  useEffect(() => {
    if (discountType === 'NONE') {
      setDiscountValue('')
    }
  }, [discountType])

  const handlePaymentStatusChange = (e) => {
    setPaymentStatusTouched(true)
    setPaymentStatus(e.target.value)
  }

  const addToCart = (menuItem) => {
    setCart((prev) => {
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
  }

  const incrementQty = (menuItemId) => {
    setCart((prev) =>
      prev.map((c) =>
        String(c.menu_item) === String(menuItemId)
          ? { ...c, quantity: c.quantity + 1 }
          : c
      )
    )
  }

  const decrementQty = (menuItemId) => {
    setCart((prev) =>
      prev
        .map((c) =>
          String(c.menu_item) === String(menuItemId)
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }

  const removeFromCart = (menuItemId) => {
    setCart((prev) => prev.filter((c) => String(c.menu_item) !== String(menuItemId)))
  }

  const cartSubtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  const discountAmount = (() => {
    const value = Number(discountValue) || 0
    if (discountType === 'PERCENT') {
      return (cartSubtotal * value) / 100
    }
    if (discountType === 'FLAT') {
      return Math.min(value, cartSubtotal)
    }
    return 0
  })()

  const cartTotal = cartSubtotal - discountAmount

  const filteredItems = menuItems.filter((m) => {
    if (!m.is_active) return false
    if (activeCategory === 'all') return true
    return String(m.category) === String(activeCategory)
  })

  const cartQtyFor = (menuItemId) => {
    const found = cart.find((c) => String(c.menu_item) === String(menuItemId))
    return found ? found.quantity : 0
  }

  const filteredCustomers = (() => {
    const q = customerSearch.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
    )
  })()

  const selectedCustomerName = (() => {
    const found = customers.find((c) => String(c.id) === String(customer))
    return found ? found.name : ''
  })()

  const selectCustomer = (c) => {
    setCustomer(c ? String(c.id) : '')
    setCustomerSearch(c ? c.name : '')
    setShowCustomerDropdown(false)
  }

  const isMfs = MFS_METHODS.includes(paymentMethod)
  const isCard = paymentMethod === 'CARD'
  const needsReference = isMfs || isCard

  const handleSubmit = async () => {
    setFormError('')

    if (cart.length === 0) {
      setFormError('Add at least one item to the order.')
      return
    }
    if (discountType === 'PERCENT' && Number(discountValue) > 100) {
      setFormError('Percentage discount cannot exceed 100.')
      return
    }
    if (isMfs && !paymentReference.trim()) {
      setFormError('Enter the sender\u2019s MFS number.')
      return
    }
    if (isCard && !/^\d{4}$/.test(paymentReference.trim())) {
      setFormError('Card reference must be exactly 4 digits.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        customer: customer || null,
        table: table || null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_reference: needsReference ? paymentReference.trim() : '',
        discount_type: discountType,
        discount_value: discountValue || '0',
        notes: notes.trim(),
        items: cart.map((c) => ({
          menu_item: c.menu_item,
          quantity: c.quantity,
        })),
      }

      await axiosInstance.post('/orders/orders/', payload)
      navigate('/orders')
    } catch (err) {
      const data = err.response && err.response.data
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0]
        const firstMsg = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey]
        setFormError(firstMsg || 'Something went wrong.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New order</h1>
      </div>

      {loadError && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: menu browser */}
        <div className="lg:col-span-2">
          <div className="flex items-center flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === 'all'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === String(cat.id)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Loading menu...
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No items in this category.
            </div>
          )}

          {!loading && filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredItems.map((item) => {
                const qty = cartQtyFor(item.id)
                const unavailable = !item.is_available
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !unavailable && addToCart(item)}
                    disabled={unavailable}
                    className={`relative text-left bg-white border rounded-md overflow-hidden transition-shadow ${
                      unavailable
                        ? 'border-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {qty > 0 && (
                      <span className="absolute top-1 right-1 z-10 bg-brand-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {qty}
                      </span>
                    )}
                    <div className="h-16 bg-gray-100 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 leading-tight truncate">
                        {item.name}
                      </p>
                      <p className="text-xs font-semibold text-brand-700 mt-0.5">
                        ৳{item.price}
                      </p>
                      {unavailable && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Unavailable</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: cart + order details */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-2.5">Order details</h2>

            {formError && (
              <div className="mb-2.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <div className="relative">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  value={customer ? selectedCustomerName : customerSearch}
                  onChange={(e) => {
                    setCustomer('')
                    setCustomerSearch(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                  placeholder="Walk-in (search name/phone)"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                />

                {showCustomerDropdown && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    <button
                      type="button"
                      onMouseDown={() => selectCustomer(null)}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                    >
                      Walk-in (no customer)
                    </button>
                    {filteredCustomers.length === 0 && (
                      <p className="px-2.5 py-2 text-xs text-gray-400">No matches.</p>
                    )}
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => selectCustomer(c)}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50"
                      >
                        <span className="text-gray-900">{c.name}</span>
                        {c.phone && (
                          <span className="text-gray-400 ml-1.5">{c.phone}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Table
                </label>
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">No table</option>
                  {tables
                    .filter((t) => t.status === 'AVAILABLE')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Cart */}
            <div className="border-t border-gray-100 pt-2.5 mb-2.5 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No items added yet
                </p>
              ) : (
                <div className="space-y-1.5">
                  {cart.map((c) => (
                    <div
                      key={c.menu_item}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 truncate">{c.name}</p>
                        <p className="text-[11px] text-gray-400">
                          ৳{c.price} × {c.quantity} = ৳{(c.price * c.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => decrementQty(c.menu_item)}
                          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs w-4 text-center">{c.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementQty(c.menu_item)}
                          className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(c.menu_item)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Discount
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {DISCOUNT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={discountType === 'NONE'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Payment method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {PAYMENT_METHODS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  Payment status
                </label>
                <select
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>

            {needsReference && (
              <div className="mb-2.5">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  {isCard ? 'Last 4 digits of card' : `${paymentMethod} sender number`}
                </label>
                <input
                  type="text"
                  maxLength={isCard ? 4 : 20}
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={isCard ? 'e.g. 4242' : 'e.g. 01712345678'}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-2.5 mb-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{cartSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 text-sm mt-1">
                <span>Total</span>
                <span>৳{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Placing order...' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}