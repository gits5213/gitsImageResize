import { useEffect } from 'react'
import { getAnalyticsConfig, mountAnalyticsBeacon } from '../config/analytics.ts'

export function AnalyticsBeacon() {
  useEffect(() => mountAnalyticsBeacon(document, getAnalyticsConfig()), [])
  return null
}
