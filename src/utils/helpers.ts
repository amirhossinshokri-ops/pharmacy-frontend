export const formatPrice = (n: number) =>
  new Intl.NumberFormat('fa-IR').format(Math.round(n)) + ' تومان'

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('fa-IR').format(n)

export const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n) + '...' : s

export const orderStatusLabel: Record<string, string> = {
  PENDING:    'در انتظار تأیید',
  PROCESSING: 'در حال پردازش',
  SHIPPED:    'ارسال شده',
  DELIVERED:  'تحویل داده شده',
  CANCELLED:  'لغو شده',
  REFUNDED:   'مسترد شده',
}
export const orderStatusColor: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
}

export const getImageUrl = (url?: string) => {
  if (!url) return 'https://placehold.co/400x400/e6ede9/0e7f5c?text=محصول'
  // unsplash or other external
  if (url.startsWith('http')) return url
  // local upload served via vite proxy -> backend
  return url
}
