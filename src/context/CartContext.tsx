import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { cartAPI, wishlistAPI } from '@/services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface CartItem { id: number; quantity: number; lineTotal: number; product: any }
interface CartSummary { itemCount: number; subtotal: number; shipping: any; total: number }

interface CartCtx {
  cartItems: CartItem[]
  cartSummary: CartSummary | null
  wishlistIds: Set<number>
  cartCount: number
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  addToCart: (productId: number, qty?: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  updateQty: (itemId: number, qty: number) => Promise<void>
  toggleWishlist: (productId: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const Ctx = createContext<CartCtx>(null!)
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [cartItems, setCartItems]     = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set())
  const [cartOpen, setCartOpen]       = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const { data } = await cartAPI.get()
      setCartItems(data.data.items || [])
      setCartSummary(data.data.summary || null)
    } catch {}
  }, [isLoggedIn])

  const refreshWishlist = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const { data } = await wishlistAPI.get()
      setWishlistIds(new Set((data.data || []).map((i: any) => i.productId)))
    } catch {}
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      refreshCart()
      refreshWishlist()
    } else {
      setCartItems([])
      setCartSummary(null)
      setWishlistIds(new Set())
    }
  }, [isLoggedIn, refreshCart, refreshWishlist])

  const addToCart = async (productId: number, qty = 1) => {
    if (!isLoggedIn) {
      toast.error('لطفاً ابتدا وارد حساب کاربری شوید')
      return
    }
    try {
      await cartAPI.add(productId, qty)
      await refreshCart()
      toast.success('به سبد خرید اضافه شد ✓')
      setCartOpen(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'خطا در افزودن به سبد'
      toast.error(msg)
      throw err
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      await cartAPI.remove(itemId)
      await refreshCart()
      toast.success('محصول از سبد حذف شد')
    } catch {
      toast.error('خطا در حذف از سبد')
    }
  }

  const updateQty = async (itemId: number, qty: number) => {
    try {
      await cartAPI.update(itemId, qty)
      await refreshCart()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در بروزرسانی تعداد')
    }
  }

  const toggleWishlist = async (productId: number) => {
    if (!isLoggedIn) {
      toast.error('لطفاً ابتدا وارد حساب کاربری شوید')
      return
    }
    try {
      if (wishlistIds.has(productId)) {
        await wishlistAPI.remove(productId)
        setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s })
        toast.success('از علاقه‌مندی‌ها حذف شد')
      } else {
        await wishlistAPI.add(productId)
        setWishlistIds(prev => new Set([...prev, productId]))
        toast.success('به علاقه‌مندی‌ها اضافه شد ♥')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا')
    }
  }

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <Ctx.Provider value={{
      cartItems, cartSummary, wishlistIds, cartCount,
      cartOpen, setCartOpen,
      addToCart, removeFromCart, updateQty,
      toggleWishlist, refreshCart,
    }}>
      {children}
    </Ctx.Provider>
  )
}
