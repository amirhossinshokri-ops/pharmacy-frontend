import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '@/utils/helpers'

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, cartSummary, removeFromCart, updateQty } = useCart()
  const { isLoggedIn } = useAuth()
  if (!cartOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)}/>

      {/* Desktop: right side panel | Mobile: bottom sheet */}
      <div className="fixed bottom-0 sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 left-0 right-0 sm:w-96 max-w-md sm:max-w-none mx-auto sm:mx-0 bg-white sm:rounded-none rounded-t-3xl z-50 sm:h-full max-h-[85vh] sm:max-h-full flex flex-col shadow-2xl animate-slide-in">

        <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100 flex-shrink-0">
          <h2 className="font-bold text-lg text-gray-800">سبد خرید</h2>
          <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center hover:bg-sage-200 transition-colors">
            <i className="fa-solid fa-xmark text-gray-600"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!isLoggedIn ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-sage-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-cart-shopping text-3xl text-primary-300"/>
              </div>
              <p className="text-gray-500 text-sm mb-4">برای مشاهده سبد خرید وارد شوید</p>
              <Link to="/login" onClick={() => setCartOpen(false)} className="btn-primary text-sm">ورود به حساب</Link>
            </div>
          ) : cartItems.length===0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-sage-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-basket-shopping text-3xl text-gray-300"/>
              </div>
              <p className="text-gray-400 text-sm mb-3">سبد خرید شما خالی است</p>
              <Link to="/products" onClick={() => setCartOpen(false)} className="text-sm text-primary-600 font-medium">مشاهده محصولات</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-sage-50 rounded-2xl p-3">
                  <img
                    src={getImageUrl(item.product.images?.[0])}
                    onError={e=>{(e.target as any).src='https://placehold.co/64x64/e6ede9/0e7f5c?text=.'}}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-4">{item.product.name}</p>
                    <p className="text-primary-600 font-bold text-xs mt-1">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1 shadow-sm flex-shrink-0">
                    <button onClick={() => item.quantity>1 ? updateQty(item.id, item.quantity-1) : removeFromCart(item.id)}
                      className="w-6 h-6 rounded-lg bg-sage-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-sage-200 transition-colors">
                      {item.quantity===1 ? <i className="fa-solid fa-trash text-red-400 text-[10px]"/> : '−'}
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity+1)}
                      className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 hover:bg-primary-200 transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartSummary && cartItems.length>0 && (
          <div className="px-4 pb-6 pt-3 border-t border-sage-100 space-y-2.5 flex-shrink-0">
            {cartSummary.shipping?.remainingForFreeShipping>0 && (
              <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
                <i className="fa-solid fa-truck-fast"/>
                {formatPrice(cartSummary.shipping.remainingForFreeShipping)} تا ارسال رایگان
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">جمع کل</span>
              <span className="font-bold">{formatPrice(cartSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ارسال</span>
              <span className={cartSummary.shipping?.standard===0?'text-green-600 font-semibold':'font-bold'}>
                {cartSummary.shipping?.standard===0?'رایگان':formatPrice(cartSummary.shipping?.standard)}
              </span>
            </div>
            <Link to="/checkout" onClick={() => setCartOpen(false)}
              className="btn-primary w-full text-center block py-3 rounded-2xl text-sm">
              ادامه خرید — {formatPrice(cartSummary.total)}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
