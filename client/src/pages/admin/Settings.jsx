import { useState } from 'react'
import { Lock, Settings as SettingsIcon } from 'lucide-react'
import axiosInstance from '../../apis/axiosinstance'

const emptyPasswordForm = {
  old_password: '',
  new_password: '',
  confirm_password: '',
}

export default function Settings() {
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.old_password) {
      setPasswordError('Enter your current password.')
      return
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 4) {
      setPasswordError('New password must be at least 4 characters.')
      return
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setChangingPassword(true)
    try {
      await axiosInstance.post('/users/users/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      })
      setPasswordSuccess('Password changed successfully.')
      setPasswordForm(emptyPasswordForm)
    } catch (err) {
      const data = err.response && err.response.data
      if (data && data.old_password) {
        setPasswordError(
          Array.isArray(data.old_password) ? data.old_password[0] : data.old_password
        )
      } else {
        setPasswordError('Could not change password. Please try again.')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-50 rounded-lg">
          <SettingsIcon className="w-5 h-5 text-brand-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account preferences</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Change my password</h2>
        </div>

        {passwordError && (
          <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Current password
            </label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={handlePasswordChange('old_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              New password
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange('new_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange('confirm_password')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}