import React, { useState, useEffect } from 'react'
import { User, SystemSettings } from '../types'
import { apiService } from '../services/api'
import { 
  UserIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAmericasIcon,
  DatabaseIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  PaintBrushIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    title: '',
    department: '',
    timezone: 'America/New_York'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    taskReminders: true,
    meetingReminders: true,
    systemUpdates: false
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    allowedIPs: '',
    passwordExpiry: '90'
  })

  const [systemSettings, setSystemSettings] = useState({
    companyName: 'Real Estate Pro',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'en'
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System', icon: CogIcon },
    { id: 'integrations', name: 'Integrations', icon: CloudIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon }
  ]

  const handleSave = async (section: string) => {
    setLoading(true)
    setSaveMessage('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              value={profileData.title}
              onChange={(e) => setProfileData({...profileData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={profileData.department}
              onChange={(e) => setProfileData({...profileData, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Sales">Sales</option>
              <option value="Management">Management</option>
              <option value="Admin">Administration</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('profile')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  {getNotificationDescription(key)}
                </div>
              </div>
              <button
                onClick={() => setNotificationSettings({
                  ...notificationSettings,
                  [key]: !value
                })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notifications')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save Notifications'}
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
            </div>
            <button
              onClick={() => setSecuritySettings({
                ...securitySettings,
                twoFactorEnabled: !securitySettings.twoFactorEnabled
              })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
            <select
              value={securitySettings.passwordExpiry}
              onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Addresses</label>
            <textarea
              value={securitySettings.allowedIPs}
              onChange={(e) => setSecuritySettings({...securitySettings, allowedIPs: e.target.value})}
              placeholder="Enter IP addresses (one per line). Leave empty to allow all IPs."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('security')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save Security'}
        </button>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={systemSettings.companyName}
              onChange={(e) => setSystemSettings({...systemSettings, companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
            <textarea
              value={systemSettings.companyAddress}
              onChange={(e) => setSystemSettings({...systemSettings, companyAddress: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
            <input
              type="tel"
              value={systemSettings.companyPhone}
              onChange={(e) => setSystemSettings({...systemSettings, companyPhone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
            <input
              type="email"
              value={systemSettings.companyEmail}
              onChange={(e) => setSystemSettings({...systemSettings, companyEmail: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select
              value={systemSettings.defaultCurrency}
              onChange={(e) => setSystemSettings({...systemSettings, defaultCurrency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select
              value={systemSettings.timeFormat}
              onChange={(e) => setSystemSettings({...systemSettings, timeFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={systemSettings.language}
              onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('system')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save System'}
        </button>
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${integration.color}`}>
                    <integration.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {integration.connected ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  integration.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </span>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    integration.connected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-3 gap-4">
              {['Light', 'Dark', 'Auto'].map((theme) => (
                <div
                  key={theme}
                  className="relative cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <label className="font-medium text-gray-900">{theme}</label>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="theme"
                      defaultChecked={theme === 'Light'}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Compact Mode</div>
              <div className="text-sm text-gray-500">Use more compact spacing throughout the interface</div>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('appearance')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save Appearance'}
        </button>
      </div>
    </div>
  )

  const getNotificationDescription = (key: string) => {
    const descriptions = {
      emailNotifications: 'Receive email notifications for important updates',
      pushNotifications: 'Receive push notifications on your device',
      leadAlerts: 'Get notified when new leads are assigned to you',
      taskReminders: 'Receive reminders for upcoming tasks',
      meetingReminders: 'Get notified about upcoming meetings',
      systemUpdates: 'Receive notifications about system updates and maintenance'
    }
    return descriptions[key as keyof typeof descriptions] || ''
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex h-full bg-white rounded-lg shadow">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {saveMessage && (
                <div className={`mb-4 p-4 rounded-md ${
                  saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  {saveMessage}
                </div>
              )}

              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'system' && renderSystemTab()}
              {activeTab === 'integrations' && renderIntegrationsTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Mock integrations data
const mockIntegrations = [
  {
    id: 'email',
    name: 'Email Service',
    description: 'Connect your email service for automated campaigns',
    icon: EnvelopeIcon,
    color: 'bg-blue-100 text-blue-600',
    connected: true
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    description: 'Send SMS notifications and reminders',
    icon: DevicePhoneMobileIcon,
    color: 'bg-green-100 text-green-600',
    connected: false
  },
  {
    id: 'calendar',
    name: 'Calendar Sync',
    description: 'Sync events with Google Calendar or Outlook',
    icon: GlobeAmericasIcon,
    color: 'bg-purple-100 text-purple-600',
    connected: true
  },
  {
    id: 'storage',
    name: 'Cloud Storage',
    description: 'Store documents in cloud storage services',
    icon: CloudIcon,
    color: 'bg-yellow-100 text-yellow-600',
    connected: false
  },
  {
    id: 'analytics',
    name: 'Analytics Platform',
    description: 'Advanced analytics and reporting tools',
    icon: ChartBarIcon,
    color: 'bg-red-100 text-red-600',
    connected: false
  },
  {
    id: 'esignature',
    name: 'E-Signature',
    description: 'Digital document signing integration',
    icon: DocumentTextIcon,
    color: 'bg-indigo-100 text-indigo-600',
    connected: true
  }
]

export default Settings
