import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatPrice, getImageUrl } from '@/utils/helpers'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ProductCard({ product }: { product: any }) {
  const { addToCart, toggleWishlist, wishlistIds } = useCart()
  const [adding, setAdding] = useState(false)
  const inWish = wishlistIds.has(product.id)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    try {
      await addToCart(product.id)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در افزودن به سبد')
    } finally {
      setAdding(false)
    }
  }

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <div className="card overflow-hidden group flex flex-col">
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1">
        <div className="relative overflow-hidden">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e6ede9/0e7f5c?text=محصول' }}
          />
          {product.discountPercent && (
            <span className="badge-discount">{product.discountPercent}٪</span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">ناموجود</span>
            </div>
          )}
          <button onClick={handleWish}
            className="absolute top-2.5 left-2.5 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
            <i className={`fa-heart text-sm ${inWish ? 'fa-solid text-red-500' : 'fa-regular text-gray-400'}`}/>
          </button>
        </div>
        <div className="p-3 flex-1">
          <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
          <h4 className="text-sm font-semibold text-gray-800 leading-5 line-clamp-2">{product.name}</h4>
          <div className="flex items-center gap-0.5 my-2">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`fa-star text-[11px] ${i < Math.round(product.rating || 0) ? 'fa-solid text-amber-400' : 'fa-regular text-gray-200'}`}/>
            ))}
            {product.reviewCount > 0 && (
              <span className="text-[10px] text-gray-400 mr-1">({product.reviewCount})</span>
            )}
          </div>
          {product.originalPrice && (
            <p className="text-[11px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          )}
          <p className="text-sm font-bold text-primary-600">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
          {adding
            ? <i className="fa-solid fa-circle-notch fa-spin"/>
            : <i className="fa-solid fa-plus text-xs"/>
          }
          {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد'}
        </button>
      </div>
    </div>
  )
}
