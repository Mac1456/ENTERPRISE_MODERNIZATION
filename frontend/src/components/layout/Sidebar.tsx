import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
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
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useLeadCount } from '@/hooks/useLeadCount'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number | null
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserPlusIcon }, // Badge will be added dynamically
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Accounts', href: '/accounts', icon: BuildingOffice2Icon },
  { name: 'Properties', href: '/properties', icon: BuildingOffice2Icon },
  { name: 'Opportunities', href: '/opportunities', icon: ChartBarIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Activities', href: '/activities', icon: PhoneIcon },
]

const secondaryNavigation: NavigationItem[] = [
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { formattedCount: leadBadgeCount } = useLeadCount()

  // Add dynamic badge to leads navigation item
  const enhancedNavigation: NavigationItem[] = navigation.map(item => {
    if (item.name === 'Leads') {
      return {
        ...item,
        badge: leadBadgeCount
      }
    }
    return item
  })

  return (
    <>
      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
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
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {enhancedNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200
                            ${isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                            }`}
                          />
                          {item.name}
                          {item.badge && (
                            <span className="ml-auto w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  {secondaryNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200
                            ${isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                            }`}
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <div className="relative z-50 lg:hidden">
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" onClick={onClose} />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            {/* Mobile Sidebar Panel - Optimized width for mobile */}
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative mr-16 flex w-full max-w-xs flex-1">
                {/* Close button */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                {/* Mobile Sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  {/* Mobile Logo */}
                  <div className="flex h-16 shrink-0 items-center">
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

                  {/* Mobile Navigation */}
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {enhancedNavigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                              <li key={item.name}>
                                <NavLink
                                  to={item.href}
                                  onClick={onClose} // Always close on mobile navigation
                                  className={`
                                    group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors duration-200
                                    ${isActive
                                      ? 'bg-primary-50 text-primary-600'
                                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <item.icon
                                    className={`h-6 w-6 shrink-0 ${
                                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                                    }`}
                                  />
                                  {item.name}
                                  {item.badge && (
                                    <span className="ml-auto w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 text-xs rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </NavLink>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <ul role="list" className="-mx-2 space-y-1">
                          {secondaryNavigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                              <li key={item.name}>
                                <NavLink
                                  to={item.href}
                                  onClick={onClose} // Always close on mobile navigation
                                  className={`
                                    group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors duration-200
                                    ${isActive
                                      ? 'bg-primary-50 text-primary-600'
                                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <item.icon
                                    className={`h-6 w-6 shrink-0 ${
                                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                                    }`}
                                  />
                                  {item.name}
                                </NavLink>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Transition.Root>
    </>
  )
}
