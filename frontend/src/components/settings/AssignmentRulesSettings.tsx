import React, { useState, useEffect } from 'react'
/**
 * ⚠️ POTENTIALLY UNUSED - FULL ASSIGNMENT RULES SETTINGS
 * 
 * Status: UNCLEAR - This full version is NOT imported anywhere
 * Purpose: Comprehensive assignment rules with advanced features
 * 
 * NOTE: Settings.tsx uses AssignmentRulesSettings_Simple.tsx instead!
 * This appears to be a more complex version that was replaced by the Simple version.
 * 
 * ACTIVE VERSION: Use AssignmentRulesSettings_Simple.tsx instead
 */

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
  id?: string
  name: string
  rule_type: 'geolocation' | 'capacity' | 'specialization'
  rule_data: any
  priority: number
  is_active: boolean
  conditions: any
}

interface AssignmentRules {
  geolocationRules: AssignmentRule[]
  capacityRules: AssignmentRule[]
  specializationRules: AssignmentRule[]
}

export default function AssignmentRulesSettings() {
  const [rules, setRules] = useState<AssignmentRules>({
    geolocationRules: [],
    capacityRules: [],
    specializationRules: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('geolocation')

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
      toast.error('Failed to load assignment rules')
    } finally {
      setLoading(false)
    }
  }

  const saveAssignmentRules = async () => {
    try {
      setSaving(true)
      
      const allRules = [
        ...rules.geolocationRules,
        ...rules.capacityRules,
        ...rules.specializationRules
      ]

      await LeadService.updateAssignmentRules({
        geolocationRules: rules.geolocationRules,
        capacityRules: rules.capacityRules,
        specializationRules: rules.specializationRules
      })

      toast.success('Assignment rules saved successfully')
    } catch (error) {
      console.error('Failed to save assignment rules:', error)
      toast.error('Failed to save assignment rules')
    } finally {
      setSaving(false)
    }
  }

  const addGeolocationRule = () => {
    const newRule: AssignmentRule = {
      name: 'New Geographic Rule',
      rule_type: 'geolocation',
      rule_data: {
        areas: [],
        agents: []
      },
      priority: rules.geolocationRules.length + 1,
      is_active: true,
      conditions: {
        lead_source: ['website', 'zillow', 'realtor.com']
      }
    }

    setRules(prev => ({
      ...prev,
      geolocationRules: [...prev.geolocationRules, newRule]
    }))
  }

  const updateGeolocationRule = (index: number, updates: Partial<AssignmentRule>) => {
    setRules(prev => ({
      ...prev,
      geolocationRules: prev.geolocationRules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }))
  }

  const removeGeolocationRule = (index: number) => {
    setRules(prev => ({
      ...prev,
      geolocationRules: prev.geolocationRules.filter((_, i) => i !== index)
    }))
  }

  const addCapacityRule = () => {
    const newRule: AssignmentRule = {
      name: 'Agent Capacity Rule',
      rule_type: 'capacity',
      rule_data: {
        max_leads_per_agent: 15,
        max_active_opportunities: 10,
        overflow_strategy: 'round_robin',
        capacity_thresholds: {
          green: 0.7,
          yellow: 0.9,
          red: 1.0
        }
      },
      priority: rules.capacityRules.length + 1,
      is_active: true,
      conditions: {
        always_apply: true
      }
    }

    setRules(prev => ({
      ...prev,
      capacityRules: [...prev.capacityRules, newRule]
    }))
  }

  const updateCapacityRule = (index: number, updates: Partial<AssignmentRule>) => {
    setRules(prev => ({
      ...prev,
      capacityRules: prev.capacityRules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }))
  }

  const addSpecializationRule = () => {
    const newRule: AssignmentRule = {
      name: 'Agent Specialization Rule',
      rule_type: 'specialization',
      rule_data: {
        specializations: {}
      },
      priority: rules.specializationRules.length + 1,
      is_active: true,
      conditions: {}
    }

    setRules(prev => ({
      ...prev,
      specializationRules: [...prev.specializationRules, newRule]
    }))
  }

  const updateSpecializationRule = (index: number, updates: Partial<AssignmentRule>) => {
    setRules(prev => ({
      ...prev,
      specializationRules: prev.specializationRules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lead Assignment Rules</h2>
          <p className="text-muted-foreground">
            Configure intelligent lead routing based on geography, agent capacity, and specializations
          </p>
        </div>
        <Button onClick={saveAssignmentRules} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          Rules are applied in priority order. Lower priority numbers are processed first.
          If multiple rules match, the first matching rule determines the assignment.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geolocation" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Geographic Rules
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Capacity Rules
          </TabsTrigger>
          <TabsTrigger value="specialization" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Specialization Rules
          </TabsTrigger>
        </TabsList>

        {/* Geographic Rules */}
        <TabsContent value="geolocation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Geographic Assignment Rules</h3>
            <Button onClick={addGeolocationRule} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Geographic Rule
            </Button>
          </div>

          {rules.geolocationRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No geographic rules configured. Add a rule to route leads based on location.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rules.geolocationRules.map((rule, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Priority {rule.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => 
                          updateGeolocationRule(index, { is_active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGeolocationRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`rule-name-${index}`}>Rule Name</Label>
                        <Input
                          id={`rule-name-${index}`}
                          value={rule.name}
                          onChange={(e) => 
                            updateGeolocationRule(index, { name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`rule-priority-${index}`}>Priority</Label>
                        <Input
                          id={`rule-priority-${index}`}
                          type="number"
                          value={rule.priority}
                          onChange={(e) => 
                            updateGeolocationRule(index, { priority: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Coverage Areas</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Define geographic areas and assign agents to each area
                      </p>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          Geographic area configuration interface would go here.
                          Currently shows: {rule.rule_data.areas?.length || 0} configured areas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Capacity Rules */}
        <TabsContent value="capacity" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Agent Capacity Rules</h3>
            <Button onClick={addCapacityRule} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Capacity Rule
            </Button>
          </div>

          {rules.capacityRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No capacity rules configured. Add a rule to manage agent workload distribution.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rules.capacityRules.map((rule, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => 
                        updateCapacityRule(index, { is_active: checked })
                      }
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Leads per Agent</Label>
                        <Input
                          type="number"
                          value={rule.rule_data.max_leads_per_agent}
                          onChange={(e) => {
                            const newRuleData = { 
                              ...rule.rule_data, 
                              max_leads_per_agent: parseInt(e.target.value) 
                            }
                            updateCapacityRule(index, { rule_data: newRuleData })
                          }}
                        />
                      </div>
                      <div>
                        <Label>Max Active Opportunities</Label>
                        <Input
                          type="number"
                          value={rule.rule_data.max_active_opportunities}
                          onChange={(e) => {
                            const newRuleData = { 
                              ...rule.rule_data, 
                              max_active_opportunities: parseInt(e.target.value) 
                            }
                            updateCapacityRule(index, { rule_data: newRuleData })
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Capacity Thresholds</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label className="text-xs text-green-600">Green (Available)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            max="1"
                            value={rule.rule_data.capacity_thresholds?.green || 0.7}
                            onChange={(e) => {
                              const newRuleData = { 
                                ...rule.rule_data, 
                                capacity_thresholds: {
                                  ...rule.rule_data.capacity_thresholds,
                                  green: parseFloat(e.target.value)
                                }
                              }
                              updateCapacityRule(index, { rule_data: newRuleData })
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-yellow-600">Yellow (Busy)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            max="1"
                            value={rule.rule_data.capacity_thresholds?.yellow || 0.9}
                            onChange={(e) => {
                              const newRuleData = { 
                                ...rule.rule_data, 
                                capacity_thresholds: {
                                  ...rule.rule_data.capacity_thresholds,
                                  yellow: parseFloat(e.target.value)
                                }
                              }
                              updateCapacityRule(index, { rule_data: newRuleData })
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-red-600">Red (At Capacity)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            max="1"
                            value={rule.rule_data.capacity_thresholds?.red || 1.0}
                            onChange={(e) => {
                              const newRuleData = { 
                                ...rule.rule_data, 
                                capacity_thresholds: {
                                  ...rule.rule_data.capacity_thresholds,
                                  red: parseFloat(e.target.value)
                                }
                              }
                              updateCapacityRule(index, { rule_data: newRuleData })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Specialization Rules */}
        <TabsContent value="specialization" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Agent Specialization Rules</h3>
            <Button onClick={addSpecializationRule} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Specialization Rule
            </Button>
          </div>

          {rules.specializationRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No specialization rules configured. Add rules to match leads with specialized agents.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rules.specializationRules.map((rule, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => 
                        updateSpecializationRule(index, { is_active: checked })
                      }
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`spec-rule-name-${index}`}>Rule Name</Label>
                      <Input
                        id={`spec-rule-name-${index}`}
                        value={rule.name}
                        onChange={(e) => 
                          updateSpecializationRule(index, { name: e.target.value })
                        }
                      />
                    </div>
                    
                    <div>
                      <Label>Specializations</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Map agent specializations to lead types
                      </p>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          Specialization mapping interface would go here.
                          Available specializations: First-time buyers, Luxury properties, Commercial, Investment properties
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
