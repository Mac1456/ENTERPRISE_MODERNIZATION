import { useQuery } from '@tanstack/react-query'

export function useLeadCount() {
  const { data: leadCount = 0, isLoading } = useQuery({
    queryKey: ['lead-count'],
    queryFn: async () => {
      try {
        // Fetch just the count from the API
        const response = await fetch('http://localhost:8080/custom/modernui/api.php/leads?page=1&limit=1')
        const result = await response.json()
        
        if (!result.success) {
          console.warn('Failed to fetch lead count:', result.message)
          return 0
        }
        
        // Return the total count from pagination
        return result.pagination?.total || 0
      } catch (error) {
        console.warn('Error fetching lead count:', error)
        return 0
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: 1000
  })

  // Format count with 99+ capping
  const formatCount = (count: number): string | null => {
    if (count === 0) return null // Don't show badge for 0 leads
    if (count > 99) return '99+'
    return count.toString()
  }

  return {
    leadCount,
    formattedCount: formatCount(leadCount),
    isLoading
  }
} 