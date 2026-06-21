import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard'
import { ProductSkeleton } from '@/components/ui/Loading'
import { getImageUrl, formatPrice } from '@/utils/helpers'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

const BANNERS = [
  {
    gradient: 'from-emerald-800 to-emerald-600',
    badge: 'تا ۴۰٪ تخفیف ویژه',
    title: 'محصولات تخصصی مراقبت پوست',
    sub: 'بهترین برندها با ضمانت اصالت کالا',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    to: '/products',
  },
  {
    gradient: 'from-cyan-800 to-teal-600',
    badge: 'جدیدترین مکمل‌ها',
    title: 'مکمل‌های غذایی پریمیوم',
    sub: 'با تأیید سازمان غذا و دارو',
    img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80',
    to: '/products',
  },
]

const CAT_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  'skin-care':   { icon: 'fa-spa',      bg: 'bg-emerald-100', color: 'text-emerald-700' },
  'hair-care':   { icon: 'fa-scissors', bg: 'bg-cyan-100',    color: 'text-cyan-700'    },
  'supplements': { icon: 'fa-capsules', bg: 'bg-orange-100',  color: 'text-orange-700'  },
  'sun-care':    { icon: 'fa-sun',      bg: 'bg-yellow-100',  color: 'text-yellow-700'  },
}

export default function Home() {
  const [bannerIdx, setBannerIdx] = useState(0)
  const { data: featData, isLoading: featLoading } = useQuery('featured', () => productAPI.featured(8))
  const { data: bestData, isLoading: bestLoading } = useQuery('bestsellers', () => productAPI.bestsellers(8))
  const { data: catData } = useQuery('categories', () => categoryAPI.list())
  const { addToCart } = useCart()

  const featured    = featData?.data?.data || []
  const bestsellers = bestData?.data?.data || []
  const categories  = catData?.data?.data || []
  const banner      = BANNERS[bannerIdx]

  return (
    <div className="pb-20 sm:pb-10">

      {/* ── HERO BANNER ── */}
      <section className="px-4 pt-5">
        <div className={`relative bg-gradient-to-l ${banner.gradient} rounded-3xl overflow-hidden h-52 sm:h-64`}>
          {/* Background image */}
          <img
            src={banner.img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          {/* Content */}
          <div className="relative z-10 flex items-center h-full px-6 gap-4">
            <div className="flex-1">
              <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3">
                {banner.badge}
              </span>
              <h2 className="text-white text-xl sm:text-2xl font-black leading-7 mb-2">
                {banner.title}
              </h2>
              <p className="text-white/70 text-xs mb-4">{banner.sub}</p>
              <Link to={banner.to}
                className="inline-block bg-white text-emerald-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                مشاهده محصولات
              </Link>
            </div>
            {/* Product image - visible on larger screens */}
            <div className="hidden sm:block w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
              <img src={banner.img} alt="" className="w-full h-full object-cover"/>
            </div>
          </div>
          {/* Dots */}
          <div className="absolute bottom-3 right-1/2 translate-x-1/2 flex gap-1.5 z-10">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all ${i === bannerIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-base font-black text-gray-800">دسته‌بندی‌ها</h3>
            <Link to="/products" className="text-emerald-600 text-xs font-semibold">مشاهده همه</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-visible px-4 hide-scrollbar pb-1">
            {categories.map((cat: any) => {
              const s = CAT_ICONS[cat.slug] || { icon: 'fa-tag', bg: 'bg-gray-100', color: 'text-gray-600' }
              return (
                <Link key={cat.id} to={`/products?categoryId=${cat.id}`}
                  className="flex-shrink-0 sm:flex-shrink flex flex-col items-center gap-2 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 min-w-[76px] hover:border-emerald-300 hover:shadow-md transition-all">
                  <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <i className={`fa-solid ${s.icon} ${s.color} text-lg`}/>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap text-center">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      <section className="mt-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-gray-800">محصولات ویژه</h3>
          <Link to="/products?isFeatured=true" className="text-emerald-600 text-xs font-semibold">مشاهده همه</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i}/>)
            : featured.map((p: any) => <ProductCard key={p.id} product={p}/>)
          }
        </div>
      </section>

      {/* ── FREE SHIPPING BANNER ── */}
      <section className="px-4 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-truck-fast text-xl text-amber-600"/>
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm">ارسال رایگان</p>
            <p className="text-amber-700 text-xs mt-0.5">برای سفارش‌های بالای یک میلیون تومان</p>
          </div>
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="mt-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-base font-black text-gray-800">پرفروش‌ترین‌ها</h3>
          <Link to="/products?sortBy=salesCount&sortOrder=desc" className="text-emerald-600 text-xs font-semibold">
            مشاهده همه
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:overflow-visible px-4 hide-scrollbar pb-2">
          {bestLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-auto h-52 bg-white rounded-2xl animate-pulse"/>
              ))
            : bestsellers.map((p: any) => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="flex-shrink-0 sm:flex-shrink w-36 sm:w-auto bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative h-28 overflow-hidden bg-gray-50">
                    <img
                      src={getImageUrl(p.images?.[0])}
                      alt={p.name}
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f0fdf4/059669?text=محصول' }}
                      className="w-full h-full object-cover"
                    />
                    {p.discountPercent && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {p.discountPercent}٪
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-gray-700 line-clamp-2 leading-4 mb-1.5">{p.name}</p>
                    <p className="text-emerald-600 font-bold text-xs">{formatPrice(p.price)}</p>
                    <button
                      onClick={e => { e.preventDefault(); addToCart(p.id) }}
                      className="w-full mt-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                      افزودن
                    </button>
                  </div>
                </Link>
              ))
          }
        </div>
      </section>

      {/* ── CHAT BANNER ── */}
      <section className="px-4 mt-6">
        <div className="bg-gradient-to-l from-emerald-700 to-emerald-600 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-headset text-xl text-white"/>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">چت آنلاین با داروساز</p>
            <p className="text-white/70 text-xs mt-0.5">پاسخ سوالات دارویی ۲۴/۷</p>
          </div>
          <button className="bg-white text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl flex-shrink-0 hover:bg-emerald-50 transition-colors">
            شروع چت
          </button>
        </div>
      </section>

    </div>
  )
}
