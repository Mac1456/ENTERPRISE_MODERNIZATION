import React, { useState, useEffect } from 'react'
import { LeadService } from '@/services/leadService'
import { 
  MapPinIcon, 
  UsersIcon, 
  TrophyIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface AssignmentRule {
  name: string
  rule_type: 'geolocation' | 'capacity' | 'specialization'
  is_active: boolean
  priority: number
}

export default function AssignmentRulesSettings() {
  const [activeTab, setActiveTab] = useState('geolocation')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rules, setRules] = useState({
    geolocationRules: [] as AssignmentRule[],
    capacityRules: [] as AssignmentRule[],
    specializationRules: [] as AssignmentRule[]
  })

  useEffect(() => {
    loadAssignmentRules()
  }, [])

  const loadAssignmentRules = async () => {
    try {
      setLoading(true)
      const data = await LeadService.getAssignmentRules()
      setRules(data)
    } catch (error) {
      console.error('Failed to load assignment rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAssignmentRules = async () => {
    try {
      setSaving(true)
      await LeadService.updateAssignmentRules(rules)
      alert('Assignment rules saved successfully!')
    } catch (error) {
      console.error('Failed to save assignment rules:', error)
      alert('Failed to save assignment rules')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Assignment Rules</h2>
          <p className="text-gray-600 mt-1">
            Configure intelligent lead routing based on geography, agent capacity, and specializations
          </p>
        </div>
        <button
          onClick={saveAssignmentRules}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-800 text-sm">
          <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
          Rules are applied in priority order. Lower priority numbers are processed first.
          If multiple rules match, the first matching rule determines the assignment.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'geolocation', name: 'Geographic Rules', icon: MapPinIcon },
            { id: 'capacity', name: 'Capacity Rules', icon: UsersIcon },
            { id: 'specialization', name: 'Specialization Rules', icon: TrophyIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'geolocation' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Geographic Assignment Rules</h3>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Geographic Rule
              </button>
            </div>

            {rules.geolocationRules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MapPinIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No geographic rules configured. Add a rule to route leads based on location.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.geolocationRules.map((rule, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Priority: {rule.priority}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="text-gray-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'capacity' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agent Capacity Rules</h3>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Capacity Rule
              </button>
            </div>

            {rules.capacityRules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No capacity rules configured. Add a rule to manage agent workload distribution.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.capacityRules.map((rule, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Manages agent workload distribution</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="text-gray-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'specialization' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agent Specialization Rules</h3>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Specialization Rule
              </button>
            </div>

            {rules.specializationRules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No specialization rules configured. Add rules to match leads with specialized agents.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.specializationRules.map((rule, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500">Matches leads with specialized agents</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="text-gray-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">How Lead Assignment Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Geographic Rules</h5>
              <p className="text-gray-600">Routes leads to agents based on property location and agent territories.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <UsersIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Capacity Rules</h5>
              <p className="text-gray-600">Distributes leads evenly based on agent workload and availability.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <TrophyIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900">Specialization Rules</h5>
              <p className="text-gray-600">Matches leads with agents who specialize in specific property types or buyer profiles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
