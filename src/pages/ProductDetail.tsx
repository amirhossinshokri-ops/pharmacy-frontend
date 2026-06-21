import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { productAPI } from '@/services/api'
import { useCart } from '@/context/CartContext'
import { formatPrice, getImageUrl } from '@/utils/helpers'
import { PageLoader } from '@/components/ui/Loading'
import ProductCard from '@/components/ui/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [qty, setQty]     = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [tab, setTab]     = useState<'desc'|'how'|'reviews'>('desc')
  const [adding, setAdding] = useState(false)
  const { addToCart, toggleWishlist, wishlistIds } = useCart()

  const { data, isLoading, isError } = useQuery(
    ['product', slug],
    () => productAPI.bySlug(slug!),
    { enabled: !!slug }
  )
  const { data: relatedData } = useQuery(
    ['related', data?.data?.data?.id],
    () => productAPI.related(data?.data?.data?.id),
    { enabled: !!data?.data?.data?.id }
  )

  if (isLoading) return <PageLoader/>
  if (isError || !data?.data?.data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <i className="fa-solid fa-box-open text-5xl text-gray-200"/>
      <p className="text-gray-500 font-medium">محصول یافت نشد</p>
      <Link to="/products" className="btn-primary">بازگشت به محصولات</Link>
    </div>
  )

  const p = data.data.data
  const related = relatedData?.data?.data || []
  const inWish  = wishlistIds.has(p.id)
  const images  = p.images?.length ? p.images : ['']

  const handleAdd = async () => {
    if (adding) return
    setAdding(true)
    try { await addToCart(p.id, qty) }
    finally { setAdding(false) }
  }

  return (
    <div className="pb-24 sm:pb-8">
      {/* Back bar */}
      <div className="px-4 py-3 flex items-center gap-3 max-w-6xl mx-auto">
        <Link to="/products" className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center hover:bg-sage-50 transition-colors">
          <i className="fa-solid fa-arrow-right text-gray-600"/>
        </Link>
        <nav className="text-sm text-gray-400 flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary-600">خانه</Link>
          <i className="fa-solid fa-chevron-left text-[10px]"/>
          <Link to="/products" className="hover:text-primary-600">محصولات</Link>
          <i className="fa-solid fa-chevron-left text-[10px]"/>
          <span className="text-gray-600 font-medium truncate max-w-[120px] sm:max-w-xs">{p.category?.name}</span>
        </nav>
      </div>

      {/* Main content - 2 col on desktop */}
      <div className="max-w-6xl mx-auto px-4 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">

        {/* LEFT - Images */}
        <div>
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm">
            <img
              src={getImageUrl(images[imgIdx])}
              alt={p.name}
              onError={e=>{(e.target as any).src='https://placehold.co/800x600/e6ede9/0e7f5c?text=محصول'}}
              className="w-full h-72 sm:h-96 object-cover"
            />
            {p.discountPercent && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {p.discountPercent}٪
              </span>
            )}
            {p.stock===0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-700 font-bold px-4 py-2 rounded-2xl">ناموجود</span>
              </div>
            )}
            <button onClick={() => toggleWishlist(p.id)}
              className="absolute top-4 left-4 w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center hover:scale-110 transition-transform">
              <i className={`fa-heart text-lg ${inWish?'fa-solid text-red-500':'fa-regular text-gray-400'}`}/>
            </button>
          </div>
          {/* Thumbnails */}
          {images.length>1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
              {images.map((img: string, i: number)=>(
                <button key={i} onClick={()=>setImgIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i===imgIdx?'border-primary-500':'border-sage-100'}`}>
                  <img src={getImageUrl(img)} className="w-full h-full object-cover"
                    onError={e=>{(e.target as any).src='https://placehold.co/64x64/e6ede9/0e7f5c?text=.'}}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Info */}
        <div className="mt-5 lg:mt-0">
          <p className="text-xs text-gray-400 mb-1">{p.brand}</p>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-7">{p.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_,i)=>(
                <i key={i} className={`fa-star text-sm ${i<Math.round(p.rating||0)?'fa-solid text-amber-400':'fa-regular text-gray-200'}`}/>
              ))}
              <span className="text-xs text-gray-400 mr-1.5">({p.reviewCount} نظر)</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full mr-auto ${p.stock>0?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
              {p.stock>0?`${p.stock} عدد موجود`:'ناموجود'}
            </span>
          </div>

          {/* Price */}
          <div className="bg-sage-50 rounded-2xl p-4 mt-4">
            {p.originalPrice && (
              <p className="text-sm text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
            )}
            <p className="text-2xl sm:text-3xl font-black text-primary-600">{formatPrice(p.price)}</p>
          </div>

          {/* Qty */}
          {p.stock>0 && (
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-medium text-gray-600">تعداد:</span>
              <div className="flex items-center gap-3 bg-white border border-sage-200 rounded-2xl px-4 py-2">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))}
                  className="w-7 h-7 rounded-xl bg-sage-100 flex items-center justify-center font-bold text-gray-700 hover:bg-sage-200 transition-colors">−</button>
                <span className="text-base font-bold w-6 text-center">{qty}</span>
                <button onClick={()=>setQty(q=>Math.min(p.stock,q+1))}
                  className="w-7 h-7 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-primary-700 hover:bg-primary-200 transition-colors">+</button>
              </div>
              <span className="text-sm text-gray-400">حداکثر {p.stock}</span>
            </div>
          )}

          {/* Add button - desktop inline */}
          <button onClick={handleAdd} disabled={adding||p.stock===0}
            className="hidden lg:flex mt-5 w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-primary-200 active:scale-95 transition-all items-center justify-center gap-2">
            {adding ? <i className="fa-solid fa-circle-notch fa-spin"/> : <i className="fa-solid fa-cart-plus"/>}
            {p.stock===0 ? 'ناموجود' : `افزودن به سبد — ${formatPrice(p.price * qty)}`}
          </button>

          {/* Tabs */}
          <div className="mt-5">
            <div className="flex bg-sage-50 rounded-2xl p-1">
              {(['desc','how','reviews'] as const).map((t,i)=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab===t?'bg-white text-primary-700 shadow-sm':'text-gray-500'}`}>
                  {['توضیحات','نحوه استفاده',`نظرات (${p.reviewCount})`][i]}
                </button>
              ))}
            </div>

            <div className="mt-3 bg-white rounded-2xl p-4 min-h-[80px] border border-sage-100">
              {tab==='desc' && (
                <p className="text-sm text-gray-600 leading-7">{p.description||'توضیحی ثبت نشده است.'}</p>
              )}
              {tab==='how' && (
                <p className="text-sm text-gray-600 leading-7">{p.howToUse||'راهنمای استفاده ثبت نشده است.'}</p>
              )}
              {tab==='reviews' && (
                p.reviews?.length===0
                  ? <p className="text-sm text-gray-400 text-center py-4">هنوز نظری ثبت نشده است.</p>
                  : <div className="space-y-3">
                    {p.reviews?.map((r: any)=>(
                      <div key={r.id} className="bg-sage-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                            {r.user.firstName?.[0]}
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{r.user.firstName} {r.user.lastName}</span>
                          <div className="flex mr-auto">
                            {[...Array(5)].map((_,i)=>(
                              <i key={i} className={`fa-star text-[10px] ${i<r.rating?'fa-solid text-amber-400':'fa-regular text-gray-200'}`}/>
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-xs text-gray-600 leading-5">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length>0 && (
        <section className="mt-10 max-w-6xl mx-auto px-4">
          <h3 className="section-title mb-4">محصولات مرتبط</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map((rp: any)=><ProductCard key={rp.id} product={rp}/>)}
          </div>
        </section>
      )}

      {/* Mobile fixed add button */}
      <div className="lg:hidden fixed bottom-16 sm:bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-30">
        <button onClick={handleAdd} disabled={adding||p.stock===0}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-primary-200 active:scale-95 transition-all flex items-center justify-center gap-2">
          {adding ? <i className="fa-solid fa-circle-notch fa-spin"/> : <i className="fa-solid fa-cart-plus"/>}
          {p.stock===0 ? 'ناموجود' : `افزودن به سبد — ${formatPrice(p.price * qty)}`}
        </button>
      </div>
    </div>
  )
}
