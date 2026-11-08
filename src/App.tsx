import { RouterProvider } from 'react-router'
import { AnalyticsBeacon } from './components/AnalyticsBeacon.tsx'
import { router } from './router.tsx'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AnalyticsBeacon />
    </>
  )
}
