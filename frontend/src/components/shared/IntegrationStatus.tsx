import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface IntegrationStatusProps {
  isConnected: boolean
  message?: string
  showDetails?: boolean
}

export default function IntegrationStatus({ 
  isConnected, 
  message, 
  showDetails = true 
}: IntegrationStatusProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)

  useEffect(() => {
    // Auto-hide after 10 seconds if connected
    if (isConnected) {
      const timer = setTimeout(() => setIsVisible(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  if (!isVisible && isConnected) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`
          fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-lg border pointer-events-auto
          ${isConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
          }
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isConnected ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                isConnected ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isConnected ? 'SuiteCRM Connected' : 'Using Demo Data'}
              </h3>
              
              <p className={`text-sm mt-1 ${
                isConnected ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {message || (isConnected 
                  ? 'Real-time data from your SuiteCRM instance'
                  : 'SuiteCRM API not available - showing demo functionality'
                )}
              </p>

              {showDetails && !isConnected && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                    className="text-xs text-yellow-800 hover:text-yellow-900 font-medium"
                  >
                    {showDetailedInfo ? 'Hide' : 'Show'} Connection Details
                  </button>
                  
                  {showDetailedInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-xs text-yellow-700 space-y-1"
                    >
                      <p><strong>To connect to real SuiteCRM:</strong></p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Ensure SuiteCRM is running on port 8080</li>
                        <li>Copy api.php to your SuiteCRM directory</li>
                        <li>Refresh this page</li>
                      </ol>
                      <p className="mt-2">
                        <strong>Current features working:</strong><br/>
                        ✓ Modern UI with real estate functionality<br/>
                        ✓ Lead capture and management<br/>
                        ✓ Dashboard analytics<br/>
                        ✓ Mobile-responsive design
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className={`ml-2 flex-shrink-0 text-xs ${
                isConnected ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
