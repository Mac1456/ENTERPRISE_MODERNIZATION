import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  CogIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserPlusIcon, badge: 5 },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Accounts', href: '/accounts', icon: BuildingOffice2Icon },
  { name: 'Properties', href: '/properties', icon: BuildingOffice2Icon },
  { name: 'Opportunities', href: '/opportunities', icon: ChartBarIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Activities', href: '/activities', icon: PhoneIcon },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          lg:z-30 lg:fixed
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Matching CRMHUB design */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-crmhub-blue to-crmhub-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">CRMHUB</h1>
                <p className="text-xs text-gray-500">Real Estate Pro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-item group
                    ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                  `}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary-100 text-primary-600 text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Secondary navigation */}
          <div className="px-4 py-6 border-t border-gray-200">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-item group
                    ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                  `}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </NavLink>
              )
            })}
          </div>
        </div>
      </motion.div>
    </>
  )
}
