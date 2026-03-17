import { Outlet } from 'react-router-dom'
import Footer from '@/components/Footer'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
