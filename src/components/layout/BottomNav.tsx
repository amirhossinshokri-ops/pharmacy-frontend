import { Link, useLocation } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

const items = [
  { to: '/', icon: 'fa-house', label: 'خانه' },
  { to: '/products', icon: 'fa-grid-2', label: 'محصولات' },
  { to: '/wishlist', icon: 'fa-heart', label: 'علاقه‌مندی' },
  { to: '/cart', icon: 'fa-cart-shopping', label: 'سبد خرید' },
  { to: '/profile', icon: 'fa-user', label: 'حساب' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { cartCount } = useCart()
  return (
    // فقط موبایل نشون داده میشه
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sage-100 z-40">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {items.map(item => {
          const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
          return (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${active ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className="relative">
                <i className={`fa-solid ${item.icon} text-lg`}/>
                {item.to === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"/>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
