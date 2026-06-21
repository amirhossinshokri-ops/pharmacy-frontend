import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice, getImageUrl } from '@/utils/helpers'
import EmptyState from '@/components/ui/EmptyState'
import { useQuery } from 'react-query'
import { wishlistAPI, orderAPI } from '@/services/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ─── Cart Page ──────────────────────────────────────────────────
export function CartPage() {
  const { cartItems, cartSummary, removeFromCart, updateQty } = useCart()
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return (
    <div className="pb-24 pt-4 max-w-xl mx-auto">
      <EmptyState icon="fa-cart-shopping" title="لطفاً وارد شوید"
        description="برای مشاهده سبد خرید ابتدا وارد حساب خود شوید"
        action={{ label: 'ورود به حساب', to: '/login' }}/>
    </div>
  )
  if (cartItems.length === 0) return (
    <div className="pb-24 pt-4 max-w-xl mx-auto">
      <EmptyState icon="fa-basket-shopping" title="سبد خرید خالی است"
        description="محصولات مورد نظر خود را اضافه کنید"
        action={{ label: 'مشاهده محصولات', to: '/products' }}/>
    </div>
  )

  return (
    <div className="pb-20 sm:pb-8 pt-2">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="section-title mb-4">سبد خرید ({cartItems.reduce((s,i)=>s+i.quantity,0)} کالا)</h1>
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3 mb-4 lg:mb-0">
            {cartItems.map(item => (
              <div key={item.id} className="card p-3 flex gap-3">
                <Link to={`/products/${item.product.slug}`}>
                  <img src={getImageUrl(item.product.images?.[0])}
                    onError={e=>{(e.target as any).src='https://placehold.co/80x80/e6ede9/0e7f5c?text=محصول'}}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"/>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`}>
                    <p className="text-sm font-semibold text-gray-800 leading-5 line-clamp-2">{item.product.name}</p>
                  </Link>
                  <p className="text-primary-600 font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-sage-50 rounded-xl px-2.5 py-1">
                      <button onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity-1) : removeFromCart(item.id)}
                        className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm font-bold">
                        {item.quantity===1 ? <i className="fa-solid fa-trash text-red-400 text-xs"/> : '−'}
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity+1)}
                        className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">+</button>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{formatPrice(item.lineTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary - sticky on desktop */}
          {cartSummary && (
            <div className="lg:col-span-1">
              <div className="card p-4 lg:sticky lg:top-24">
                {cartSummary.shipping?.remainingForFreeShipping > 0 && (
                  <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-truck-fast"/>
                    {formatPrice(cartSummary.shipping.remainingForFreeShipping)} تا ارسال رایگان
                  </div>
                )}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">جمع سبد</span>
                  <span className="font-bold">{formatPrice(cartSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-500">ارسال</span>
                  <span className={cartSummary.shipping?.standard===0?'text-green-600 font-semibold':'font-bold'}>
                    {cartSummary.shipping?.standard===0?'رایگان':formatPrice(cartSummary.shipping?.standard)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 border-t border-sage-100 pt-3 mb-4">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="text-primary-600">{formatPrice(cartSummary.total)}</span>
                </div>
                <Link to="/checkout" className="btn-primary w-full text-center block py-3 rounded-2xl text-sm">
                  ادامه و ثبت سفارش
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile fixed bottom */}
      {cartSummary && (
        <div className="sm:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-sage-100 px-4 py-3 z-30">
          <Link to="/checkout" className="btn-primary w-full text-center block py-3 rounded-2xl text-sm">
            تکمیل خرید — {formatPrice(cartSummary.total)}
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Wishlist Page ──────────────────────────────────────────────
export function WishlistPage() {
  const { isLoggedIn } = useAuth()
  const { toggleWishlist, addToCart } = useCart()
  const { data, isLoading, refetch } = useQuery('wishlist-page', () => wishlistAPI.get(), { enabled: isLoggedIn })
  const items = data?.data?.data || []

  if (!isLoggedIn) return (
    <div className="pb-24 pt-4">
      <EmptyState icon="fa-heart" title="لطفاً وارد شوید" action={{ label: 'ورود', to: '/login' }}/>
    </div>
  )

  return (
    <div className="pb-20 sm:pb-8 pt-2 max-w-6xl mx-auto">
      <h1 className="section-title px-4 mb-4">علاقه‌مندی‌ها</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
          {[...Array(4)].map((_,i)=><div key={i} className="h-52 bg-white rounded-2xl animate-pulse"/>)}
        </div>
      ) : items.length===0 ? (
        <EmptyState icon="fa-heart" title="لیست علاقه‌مندی‌ها خالی است"
          description="محصولات مورد علاقه‌تان را اضافه کنید"
          action={{ label: 'مشاهده محصولات', to: '/products' }}/>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
          {items.map((item: any) => (
            <div key={item.productId} className="card overflow-hidden">
              <Link to={`/products/${item.product.slug}`}>
                <div className="relative">
                  <img src={getImageUrl(item.product.images?.[0])}
                    onError={e=>{(e.target as any).src='https://placehold.co/400x400/e6ede9/0e7f5c?text=محصول'}}
                    className="w-full h-36 object-cover"/>
                  {item.product.discountPercent && <span className="badge-discount">{item.product.discountPercent}٪</span>}
                  <button onClick={e=>{e.preventDefault();toggleWishlist(item.productId).then(()=>refetch())}}
                    className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-heart text-red-500 text-sm"/>
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-5">{item.product.name}</p>
                  <p className="text-primary-600 font-bold text-sm mt-1.5">{formatPrice(item.product.price)}</p>
                </div>
              </Link>
              <div className="px-3 pb-3">
                <button onClick={() => addToCart(item.productId)}
                  className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold py-2 rounded-xl transition-colors">
                  افزودن به سبد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Checkout Page ──────────────────────────────────────────────
export function Checkout() {
  const { cartItems, cartSummary, refreshCart } = useCart()
  const { isLoggedIn } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState<1|2|3>(1)
  const [address, setAddress] = useState({ province:'', city:'', street:'', postalCode:'' })
  const [shipping, setShipping] = useState('standard')
  const [notes, setNotes] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [placing, setPlacing] = useState(false)

  if (!isLoggedIn) return <div className="pb-24 pt-4"><EmptyState icon="fa-lock" title="لطفاً وارد شوید" action={{ label:'ورود', to:'/login' }}/></div>
  if (cartItems.length===0) return <div className="pb-24 pt-4"><EmptyState icon="fa-cart-shopping" title="سبد خرید خالی است" action={{ label:'محصولات', to:'/products' }}/></div>

  const shippingCost = cartSummary?.shipping?.[shipping] ?? 0
  const subtotal = cartSummary?.subtotal ?? 0
  const discount = discountResult?.discountAmount ?? 0
  const total = subtotal - discount + shippingCost

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    setChecking(true)
    try {
      const { data } = await orderAPI.applyDiscount(discountCode, subtotal)
      setDiscountResult(data.data)
      toast.success(`${formatPrice(data.data.discountAmount)} تخفیف اعمال شد ✓`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'کد تخفیف نامعتبر است')
      setDiscountResult(null)
    } finally { setChecking(false) }
  }

  const placeOrder = async () => {
    if (!address.province||!address.city||!address.street||!address.postalCode) {
      toast.error('لطفاً آدرس کامل را وارد کنید'); setStep(1); return
    }
    setPlacing(true)
    try {
      await orderAPI.create({
        address,
        shippingMethod: shipping,
        ...(discountResult && { discountCode }),
        notes: notes || undefined,
      })
      await refreshCart()
      toast.success('سفارش با موفقیت ثبت شد! 🎉')
      nav('/profile')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ثبت سفارش')
    } finally { setPlacing(false) }
  }

  const STEPS = ['آدرس','روش ارسال','پرداخت']

  return (
    <div className="pb-20 sm:pb-8 pt-2 max-w-2xl mx-auto">
      <div className="px-4 mb-5 flex items-center gap-3">
        <button onClick={() => step>1 ? setStep(s=>(s-1) as any) : nav('/cart')}
          className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center">
          <i className="fa-solid fa-arrow-right text-gray-600"/>
        </button>
        <h1 className="section-title">تکمیل سفارش</h1>
      </div>

      {/* Steps */}
      <div className="px-4 mb-6">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${step>i+1?'bg-green-500 text-white':step===i+1?'bg-primary-600 text-white':'bg-sage-200 text-gray-400'}`}>
                {step>i+1 ? <i className="fa-solid fa-check text-[10px]"/> : i+1}
              </div>
              {i<2 && <div className={`h-0.5 flex-1 mx-1 transition-colors ${step>i+1?'bg-green-400':'bg-sage-200'}`}/>}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-0.5">
          {STEPS.map(s=><span key={s}>{s}</span>)}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Step 1: Address */}
        {step===1 && (
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-gray-800">آدرس تحویل</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">استان *</label>
                <input value={address.province} onChange={e=>setAddress(a=>({...a,province:e.target.value}))}
                  className="input-field text-sm" placeholder="تهران"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">شهر *</label>
                <input value={address.city} onChange={e=>setAddress(a=>({...a,city:e.target.value}))}
                  className="input-field text-sm" placeholder="تهران"/>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">آدرس کامل *</label>
              <input value={address.street} onChange={e=>setAddress(a=>({...a,street:e.target.value}))}
                className="input-field text-sm" placeholder="خیابان، کوچه، پلاک، واحد"/>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">کد پستی *</label>
              <input value={address.postalCode} onChange={e=>setAddress(a=>({...a,postalCode:e.target.value}))}
                className="input-field text-sm" placeholder="1234567890" dir="ltr"/>
            </div>
            <button onClick={() => {
              if (!address.province||!address.city||!address.street||!address.postalCode) {
                toast.error('لطفاً همه فیلدها را پر کنید'); return
              }
              setStep(2)
            }} className="btn-primary w-full py-3 rounded-2xl text-sm">ادامه</button>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step===2 && (
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-gray-800">روش ارسال</h3>
            {[
              {id:'standard',label:'پست عادی',desc:'۳-۵ روز کاری',price:cartSummary?.shipping?.standard??50000},
              {id:'express', label:'پست سریع', desc:'۱-۲ روز کاری', price:cartSummary?.shipping?.express??120000},
              {id:'pickup',  label:'تحویل حضوری',desc:'از داروخانه‌های همکار',price:0},
            ].map(opt=>(
              <label key={opt.id} onClick={()=>setShipping(opt.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-colors ${shipping===opt.id?'border-primary-500 bg-primary-50':'border-sage-200'}`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shipping===opt.id?'border-primary-500':'border-gray-300'}`}>
                  {shipping===opt.id && <div className="w-2 h-2 rounded-full bg-primary-500"/>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${opt.price===0?'text-green-600':'text-gray-700'}`}>
                  {opt.price===0?'رایگان':formatPrice(opt.price)}
                </p>
              </label>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">توضیحات (اختیاری)</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                className="input-field text-sm resize-none" placeholder="توضیحات سفارش..."/>
            </div>
            <button onClick={()=>setStep(3)} className="btn-primary w-full py-3 rounded-2xl text-sm">ادامه</button>
          </div>
        )}

        {/* Step 3: Payment */}
        {step===3 && (
          <>
            {/* Discount */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">کد تخفیف</h3>
              <div className="flex gap-2">
                <input value={discountCode} onChange={e=>setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME20" className="input-field text-sm flex-1" dir="ltr"
                  disabled={!!discountResult}/>
                <button onClick={discountResult?()=>{setDiscountResult(null);setDiscountCode('')}:applyDiscount}
                  disabled={checking}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-colors ${discountResult?'bg-red-50 text-red-500':'bg-primary-600 text-white'}`}>
                  {checking ? <i className="fa-solid fa-circle-notch fa-spin"/> : discountResult?'حذف':'اعمال'}
                </button>
              </div>
              {discountResult && (
                <div className="mt-2 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                  <i className="fa-solid fa-check-circle"/>
                  {formatPrice(discountResult.discountAmount)} تخفیف اعمال شد
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">خلاصه سفارش</h3>
              <div className="space-y-2 mb-3">
                {cartItems.map(item=>(
                  <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <img src={getImageUrl(item.product.images?.[0])}
                      onError={e=>{(e.target as any).src='https://placehold.co/32x32/e6ede9/0e7f5c?text=.'}}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"/>
                    <span className="flex-1 truncate">{item.product.name} × {item.quantity}</span>
                    <span className="font-semibold flex-shrink-0">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-sage-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">جمع کل</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                {discount>0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>تخفیف</span>
                    <span className="font-bold">−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">هزینه ارسال</span>
                  <span className={shippingCost===0?'text-green-600 font-semibold':'font-bold'}>
                    {shippingCost===0?'رایگان':formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-sage-100 pt-2">
                  <span>مبلغ نهایی</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placing}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary-200">
              {placing ? <i className="fa-solid fa-circle-notch fa-spin"/> : <i className="fa-solid fa-credit-card"/>}
              {placing ? 'در حال ثبت سفارش...' : `پرداخت و ثبت سفارش — ${formatPrice(total)}`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
