import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layout
import Layout from '@/components/layout/Layout'

// Pages
import Dashboard from '@/pages/Dashboard'
import LeadsEnhanced from '@/pages/Leads_Enhanced'
import Contacts from '@/pages/Contacts'
import Accounts from '@/pages/Accounts'
import Properties from '@/pages/Properties'
import Opportunities from '@/pages/Opportunities'
import Calendar from '@/pages/Calendar'
import Activities from '@/pages/Activities'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

// Auth placeholder - in a real app, you'd have proper auth
function LoginPlaceholder() {
  const { setUser, setToken } = useAuthStore()
  
  React.useEffect(() => {
    // Auto-login for demo purposes
    setUser({
      id: '1',
      username: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      role: 'Real Estate Agent',
      isActive: true,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    })
    setToken('demo-token')
  }, [setUser, setToken])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          SuiteCRM Real Estate Pro
        </h1>
        <p className="text-gray-600">Loading demo environment...</p>
      </div>
    </div>
  )
}

// No placeholder pages needed anymore - all implemented

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPlaceholder />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<LeadsEnhanced />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
