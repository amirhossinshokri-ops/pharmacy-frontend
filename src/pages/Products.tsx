import { useState } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { productAPI, categoryAPI } from '@/services/api'
import ProductCard from '@/components/ui/ProductCard'
import { ProductSkeleton } from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'جدیدترین' },
  { value: 'price-asc',      label: 'ارزان‌ترین' },
  { value: 'price-desc',     label: 'گران‌ترین'  },
  { value: 'rating-desc',    label: 'بهترین امتیاز' },
  { value: 'salesCount-desc',label: 'پرفروش‌ترین' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)

  const categoryId = searchParams.get('categoryId') || ''
  const sortRaw    = searchParams.get('sort') || 'createdAt-desc'
  const [sortBy, sortOrder] = sortRaw.split('-')
  const inStock    = searchParams.get('inStock') === 'true'
  const minPrice   = searchParams.get('minPrice') || ''
  const maxPrice   = searchParams.get('maxPrice') || ''
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  const { data: catData } = useQuery('categories', () => categoryAPI.list())
  const categories = catData?.data?.data || []

  const params = {
    page, limit: 12, sortBy, sortOrder,
    ...(categoryId && { categoryId }),
    ...(inStock    && { inStock: true }),
    ...(minPrice   && { minPrice }),
    ...(maxPrice   && { maxPrice }),
  }

  const { data, isLoading } = useQuery(['products', params], () => productAPI.list(params), { keepPreviousData: true })
  const products = data?.data?.data || []
  const meta     = data?.data?.meta

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    setPage(1); setSearchParams(p)
  }
  const resetFilters = () => { setSearchParams({}); setLocalMin(''); setLocalMax(''); setPage(1) }

  return (
    <div className="pb-20 sm:pb-8">

      {/* Filter bar */}
      <div className="sticky top-[105px] sm:top-[73px] z-30 bg-white/95 backdrop-blur-sm border-b border-sage-100 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar max-w-6xl mx-auto">
          <select value={sortRaw} onChange={e => setParam('sort', e.target.value)}
            className="flex-shrink-0 appearance-none bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 outline-none cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilter(true)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700">
            <i className="fa-solid fa-sliders text-primary-600"/>فیلتر
          </button>
          {categories.map((cat: any) => (
            <button key={cat.id} onClick={() => setParam('categoryId', categoryId === String(cat.id) ? '' : String(cat.id))}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${categoryId === String(cat.id) ? 'bg-primary-600 text-white' : 'bg-sage-50 border border-sage-200 text-gray-700'}`}>
              {cat.name}
            </button>
          ))}
          <button onClick={() => setParam('inStock', inStock ? '' : 'true')}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${inStock ? 'bg-primary-600 text-white' : 'bg-sage-50 border border-sage-200 text-gray-700'}`}>
            موجود
          </button>
        </div>
      </div>

      <div className="px-4 py-3 max-w-6xl mx-auto flex items-center justify-between">
        {meta && <p className="text-xs text-gray-500">{meta.total} محصول یافت شد</p>}
        {(categoryId || inStock || minPrice || maxPrice) && (
          <button onClick={resetFilters} className="text-xs text-red-500 flex items-center gap-1">
            <i className="fa-solid fa-xmark"/>حذف فیلترها
          </button>
        )}
      </div>

      {/* Grid - responsive columns */}
      <div className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading
            ? [...Array(8)].map((_, i) => <ProductSkeleton key={i}/>)
            : products.length === 0
              ? <div className="col-span-4"><EmptyState icon="fa-box-open" title="محصولی یافت نشد" description="فیلترها را تغییر دهید" action={{ label: 'نمایش همه', to: '/products' }}/></div>
              : products.map((p: any) => <ProductCard key={p.id} product={p}/>)
          }
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="px-4 mt-6 flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-right text-sm"/>
          </button>
          <span className="text-sm text-gray-600 font-medium">{page} از {meta.totalPages}</span>
          <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-left text-sm"/>
          </button>
        </div>
      )}

      {/* Filter sheet */}
      {showFilter && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setShowFilter(false)}/>
          <div className="fixed bottom-0 sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 left-0 right-0 sm:w-96 sm:rounded-3xl bg-white rounded-t-3xl z-50 p-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">فیلتر محصولات</h3>
              <button onClick={() => setShowFilter(false)} className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
                <i className="fa-solid fa-xmark text-gray-600"/>
              </button>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">محدوده قیمت (تومان)</p>
              <div className="flex gap-3">
                <input value={localMin} onChange={e => setLocalMin(e.target.value)} placeholder="از" className="input-field text-sm" type="number"/>
                <input value={localMax} onChange={e => setLocalMax(e.target.value)} placeholder="تا" className="input-field text-sm" type="number"/>
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">دسته‌بندی</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                  <button key={cat.id} onClick={() => setParam('categoryId', categoryId === String(cat.id) ? '' : String(cat.id))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${categoryId === String(cat.id) ? 'bg-primary-600 text-white' : 'bg-sage-50 border border-sage-200 text-gray-700'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-700">فقط کالاهای موجود</span>
              <button onClick={() => setParam('inStock', inStock ? '' : 'true')}
                className={`w-12 h-6 rounded-full transition-colors relative ${inStock ? 'bg-primary-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${inStock ? 'right-1' : 'left-1'}`}/>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={resetFilters} className="flex-1 btn-outline text-sm py-3 rounded-2xl">پاک کردن</button>
              <button onClick={() => {
                if (localMin) setParam('minPrice', localMin)
                if (localMax) setParam('maxPrice', localMax)
                setShowFilter(false)
              }} className="flex-1 btn-primary text-sm py-3 rounded-2xl">اعمال فیلتر</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
