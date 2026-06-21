import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { productAPI } from '@/services/api'
import { getImageUrl, formatPrice } from '@/utils/helpers'

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth()
  const { cartCount, setCartOpen } = useCart()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = useNavigate()
  let timer: any

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout(timer)
    if (!val.trim()) { setResults([]); setShowDropdown(false); return }
    timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await productAPI.list({ search: val, limit: 5 })
        setResults(data.data || [])
        setShowDropdown(true)
      } catch {} finally { setSearching(false) }
    }, 400)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-sage-100 shadow-sm">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="font-black text-xl text-primary-700 tracking-tight flex-shrink-0">
            سلامتی<span className="text-primary-500">شاپ</span>
          </Link>

          {/* Search - grows on desktop */}
          <div className="relative flex-1 max-w-xl hidden sm:block">
            <div className="bg-sage-50 border border-sage-200 rounded-2xl px-4 h-11 flex items-center gap-3 focus-within:border-primary-400 focus-within:bg-white transition-all">
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"/>
              <input value={search} onChange={e => handleSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="جستجوی محصول، برند، دسته‌بندی..." className="bg-transparent outline-none w-full text-sm"/>
              {searching && <i className="fa-solid fa-circle-notch fa-spin text-primary-500 text-sm"/>}
            </div>
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full right-0 left-0 bg-white rounded-2xl shadow-xl border border-sage-100 overflow-hidden z-50 mt-1">
                {results.map(p => (
                  <button key={p.id} onMouseDown={() => { nav(`/products/${p.slug}`); setShowDropdown(false); setSearch('') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sage-50 transition-colors">
                    <img src={getImageUrl(p.images?.[0])} className="w-10 h-10 rounded-xl object-cover"/>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-primary-600 font-semibold">{formatPrice(p.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/products" className="hover:text-primary-600 transition-colors">محصولات</Link>
            <Link to="/wishlist" className="hover:text-primary-600 transition-colors">علاقه‌مندی</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="hidden sm:flex w-9 h-9 rounded-xl overflow-hidden border-2 border-primary-100 items-center justify-center">
                  {user?.avatar
                    ? <img src={user.avatar} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">{user?.firstName?.[0]}</div>
                  }
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl">
                    <i className="fa-solid fa-shield-halved"/>پنل ادمین
                  </Link>
                )}
              </>
            ) : (
              <Link to="/login" className="hidden sm:flex btn-primary text-sm py-2 px-4">ورود / ثبت‌نام</Link>
            )}
            <button onClick={() => setCartOpen(true)} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sage-50">
              <i className="fa-solid fa-cart-shopping text-lg text-gray-600"/>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>
            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sage-50">
              <i className="fa-solid fa-bars text-lg text-gray-600"/>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 sm:hidden relative">
          <div className="bg-sage-50 border border-sage-200 rounded-2xl px-4 h-11 flex items-center gap-3 focus-within:border-primary-400 focus-within:bg-white transition-all">
            <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"/>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="جستجوی محصول..." className="bg-transparent outline-none w-full text-sm"/>
          </div>
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full right-4 left-4 bg-white rounded-2xl shadow-xl border border-sage-100 overflow-hidden z-50 mt-1">
              {results.map(p => (
                <button key={p.id} onMouseDown={() => { nav(`/products/${p.slug}`); setShowDropdown(false); setSearch('') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sage-50 transition-colors">
                  <img src={getImageUrl(p.images?.[0])} className="w-10 h-10 rounded-xl object-cover"/>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-primary-600 font-semibold">{formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-sage-100 px-4 py-3 space-y-2">
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700">
                  <i className="fa-solid fa-user text-primary-500 w-5"/>پروفایل من
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-amber-700">
                    <i className="fa-solid fa-shield-halved text-amber-500 w-5"/>پنل مدیریت
                  </Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false) }} className="flex items-center gap-3 py-2 text-sm font-medium text-red-500 w-full text-right">
                  <i className="fa-solid fa-arrow-right-from-bracket w-5"/>خروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700">
                  <i className="fa-solid fa-right-to-bracket text-primary-500 w-5"/>ورود
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-gray-700">
                  <i className="fa-solid fa-user-plus text-primary-500 w-5"/>ثبت‌نام
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
