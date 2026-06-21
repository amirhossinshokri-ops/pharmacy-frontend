import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import CartDrawer from './CartDrawer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-sage-50">
      <Header />
      {/* responsive: full width on desktop, max-md centered on mobile */}
      <main className="w-full max-w-6xl mx-auto px-0 sm:px-4">
        <Outlet />
      </main>
      <BottomNav />
      <CartDrawer />
    </div>
  )
}
