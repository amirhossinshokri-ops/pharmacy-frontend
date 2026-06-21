import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'

const NAV = [
  { to: '/admin',           icon: 'fa-chart-line', label: 'داشبورد',       end: true  },
  { to: '/admin/products',  icon: 'fa-box',        label: 'محصولات',       end: false },
  { to: '/admin/orders',    icon: 'fa-truck',      label: 'سفارشات',       end: false },
  { to: '/admin/users',     icon: 'fa-users',      label: 'کاربران',       end: false },
  { to: '/admin/discounts', icon: 'fa-ticket',     label: 'کدهای تخفیف',  end: false },
]

export default function AdminLayout() {
  const { isAdmin, loading, user, logout } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (!loading && !isAdmin) nav('/', { replace: true })
  }, [isAdmin, loading])

  if (loading || !isAdmin) return null

  return (
    <div className="min-h-screen bg-sage-50 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 bg-white border-l border-sage-100 fixed right-0 top-0 h-full z-40 shadow-sm">
        <div className="p-5 border-b border-sage-100">
          <Link to="/" className="font-black text-lg text-primary-700">سلامتی<span className="text-primary-500">شاپ</span></Link>
          <p className="text-xs text-gray-400 mt-0.5">پنل مدیریت</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-sage-50'}`
              }>
              <i className={`fa-solid ${item.icon} w-4 text-center`}/>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sage-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 text-sm font-bold">
              {user?.firstName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); nav('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <i className="fa-solid fa-arrow-right-from-bracket"/>خروج
          </button>
        </div>
      </aside>

      {/* Main content - offset for sidebar on desktop */}
      <div className="flex-1 sm:mr-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="sm:hidden sticky top-0 z-40 bg-white border-b border-sage-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={() => nav('/')} className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center">
            <i className="fa-solid fa-arrow-right text-gray-600 text-sm"/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-white text-xs"/>
            </div>
            <span className="font-bold text-gray-800 text-sm">پنل مدیریت</span>
          </div>
        </div>

        {/* Page */}
        <main className="flex-1 pb-20 sm:pb-6">
          <Outlet/>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sage-100 z-50 shadow-lg">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors relative ${isActive ? 'text-primary-600' : 'text-gray-400'}`
              }>
              {({ isActive }) => (
                <>
                  <i className={`fa-solid ${item.icon} text-lg`}/>
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full"/>}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
