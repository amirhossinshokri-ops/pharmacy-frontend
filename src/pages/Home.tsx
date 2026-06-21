import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard'
import { ProductSkeleton } from '@/components/ui/Loading'
import { getImageUrl, formatPrice } from '@/utils/helpers'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

const BANNERS = [
  { gradient: 'from-primary-700 to-primary-500', badge: 'تا ۴۰٪ تخفیف', title: 'محصولات تخصصی\nمراقبت پوست', sub: 'بهترین برندها با ضمانت اصالت', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', to: '/products' },
  { gradient: 'from-cyan-700 to-teal-500', badge: 'جدیدترین مکمل‌ها', title: 'مکمل‌های غذایی\nپریمیوم', sub: 'با تأیید سازمان غذا و دارو', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', to: '/products' },
]
const CAT_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  'skin-care':   { icon: 'fa-spa',      bg: 'bg-emerald-100', color: 'text-emerald-600' },
  'hair-care':   { icon: 'fa-scissors', bg: 'bg-cyan-100',    color: 'text-cyan-600'    },
  'supplements': { icon: 'fa-capsules', bg: 'bg-orange-100',  color: 'text-orange-600'  },
  'sun-care':    { icon: 'fa-sun',      bg: 'bg-yellow-100',  color: 'text-yellow-600'  },
}

export default function Home() {
  const [bannerIdx, setBannerIdx] = useState(0)
  const { data: featData, isLoading: featLoading } = useQuery('featured', () => productAPI.featured(8))
  const { data: bestData, isLoading: bestLoading } = useQuery('bestsellers', () => productAPI.bestsellers(8))
  const { data: catData } = useQuery('categories', () => categoryAPI.list())
  const { addToCart } = useCart()

  const featured   = featData?.data?.data || []
  const bestsellers = bestData?.data?.data || []
  const categories  = catData?.data?.data || []
  const banner = BANNERS[bannerIdx]

  return (
    <div className="pb-20 sm:pb-8">

      {/* Hero Banner */}
      <section className="px-4 pt-4">
        <div className={`bg-gradient-to-l ${banner.gradient} rounded-3xl overflow-hidden relative`}>
          <div className="p-5 pb-0 flex justify-between items-end">
            <div className="flex-1">
              <span className="inline-block bg-white/25 text-white text-xs px-3 py-1 rounded-full mb-3">{banner.badge}</span>
              <h2 className="text-white text-xl font-black leading-7 whitespace-pre-line">{banner.title}</h2>
              <p className="text-white/75 text-xs mt-2 mb-4">{banner.sub}</p>
              <Link to={banner.to} className="inline-block bg-white text-primary-700 font-bold text-sm px-5 py-2.5 rounded-2xl mb-5 shadow-lg">مشاهده محصولات</Link>
            </div>
            <img src={banner.img} className="w-36 h-36 object-cover rounded-tl-3xl flex-shrink-0"/>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all ${i === bannerIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}/>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mt-7">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="section-title">دسته‌بندی‌ها</h3>
            <Link to="/products" className="text-primary-600 text-xs font-medium">مشاهده همه</Link>
          </div>
          {/* mobile: scroll / desktop: grid */}
          <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-visible px-4 hide-scrollbar pb-1">
            {categories.map((cat: any) => {
              const style = CAT_ICONS[cat.slug] || { icon: 'fa-tag', bg: 'bg-gray-100', color: 'text-gray-600' }
              return (
                <Link key={cat.id} to={`/products?categoryId=${cat.id}`}
                  className="flex-shrink-0 sm:flex-shrink flex flex-col items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-sage-100 min-w-[72px] hover:border-primary-300 transition-colors">
                  <div className={`w-11 h-11 ${style.bg} rounded-xl flex items-center justify-center`}>
                    <i className={`fa-solid ${style.icon} ${style.color}`}/>
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mt-7 px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">محصولات ویژه</h3>
          <Link to="/products?isFeatured=true" className="text-primary-600 text-xs font-medium">مشاهده همه</Link>
        </div>
        {/* mobile: 2col / tablet: 3col / desktop: 4col */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featLoading
            ? [...Array(4)].map((_, i) => <ProductSkeleton key={i}/>)
            : featured.map((p: any) => <ProductCard key={p.id} product={p}/>)
          }
        </div>
      </section>

      {/* Free shipping */}
      <section className="px-4 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-truck-fast text-xl text-amber-600"/>
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm">ارسال رایگان</p>
            <p className="text-amber-700 text-xs mt-0.5">برای سفارش‌های بالای یک میلیون تومان</p>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mt-7">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="section-title">پرفروش‌ترین‌ها</h3>
          <Link to="/products?sortBy=salesCount&sortOrder=desc" className="text-primary-600 text-xs font-medium">مشاهده همه</Link>
        </div>
        {/* mobile: horizontal scroll / desktop: grid */}
        <div className="sm:px-4">
          <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:overflow-visible px-4 sm:px-0 hide-scrollbar pb-2">
            {bestLoading
              ? [...Array(4)].map((_, i) => <div key={i} className="flex-shrink-0 w-36 h-52 bg-white rounded-2xl animate-pulse"/>)
              : bestsellers.map((p: any) => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="flex-shrink-0 sm:flex-shrink w-36 sm:w-auto bg-white rounded-2xl overflow-hidden shadow-sm border border-sage-100 hover:shadow-md transition-shadow">
                  <img src={getImageUrl(p.images?.[0])} className="w-full h-28 object-cover"/>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-gray-700 line-clamp-2 leading-4">{p.name}</p>
                    <p className="text-primary-600 font-bold text-xs mt-1.5">{formatPrice(p.price)}</p>
                    <button onClick={e => { e.preventDefault(); addToCart(p.id) }}
                      className="w-full mt-2 bg-primary-50 text-primary-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                      افزودن
                    </button>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      </section>

      {/* Chat */}
      <section className="px-4 mt-6">
        <div className="bg-gradient-to-l from-primary-700 to-primary-600 rounded-2xl px-4 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-headset text-xl text-white"/>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">چت آنلاین با داروساز</p>
            <p className="text-white/70 text-xs mt-0.5">پاسخ سوالات دارویی ۲۴/۷</p>
          </div>
          <button className="bg-white text-primary-700 font-bold text-xs px-4 py-2 rounded-xl flex-shrink-0">شروع چت</button>
        </div>
      </section>

    </div>
  )
}
