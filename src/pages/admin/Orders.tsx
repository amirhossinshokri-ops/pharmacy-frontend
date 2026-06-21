import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '@/services/api'
import { formatPrice, orderStatusLabel, orderStatusColor } from '@/utils/helpers'
import toast from 'react-hot-toast'

const STATUSES = ['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED']

export default function AdminOrders() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number|null>(null)
  const [updatingId, setUpdatingId] = useState<number|null>(null)

  const { data, isLoading } = useQuery(
    ['admin-orders', page, statusFilter],
    () => adminAPI.orders({ page, limit: 15, ...(statusFilter && { status: statusFilter }) }),
    { keepPreviousData: true }
  )
  const orders = data?.data?.data || []
  const meta   = data?.data?.meta

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await adminAPI.updateOrderStatus(id, status)
      qc.invalidateQueries('admin-orders')
      qc.invalidateQueries('admin-stats')
      toast.success('وضعیت سفارش بروزرسانی شد')
    } catch { toast.error('خطا در بروزرسانی') }
    finally { setUpdatingId(null) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">مدیریت سفارشات</h1>
          {meta && <p className="text-xs text-gray-400 mt-0.5">{meta.total} سفارش</p>}
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2">
        <button onClick={() => { setStatusFilter(''); setPage(1) }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-white border border-sage-200 text-gray-600'}`}>
          همه
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter===s ? 'bg-primary-600 text-white' : 'bg-white border border-sage-200 text-gray-600'}`}>
            {orderStatusLabel[s]}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-2.5">
        {isLoading
          ? [...Array(5)].map((_,i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"/>)
          : orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">
              {/* Header row */}
              <button className="w-full flex items-center gap-3 p-3.5 text-right hover:bg-sage-50 transition-colors"
                onClick={() => setExpandedId(expandedId===order.id ? null : order.id)}>
                <div className="w-10 h-10 bg-sage-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-box text-primary-500 text-sm"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">#{order.id}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orderStatusColor[order.status]}`}>
                      {orderStatusLabel[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {order.user?.firstName} {order.user?.lastName}
                    {order.user?.phone && ` — ${order.user.phone}`}
                  </p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-sm font-bold text-primary-600">{formatPrice(order.finalPrice)}</p>
                  <p className="text-[10px] text-gray-400">{order.items?.length} کالا</p>
                </div>
                <i className={`fa-solid fa-chevron-${expandedId===order.id ? 'up':'down'} text-xs text-gray-400 flex-shrink-0`}/>
              </button>

              {/* Expanded details */}
              {expandedId===order.id && (
                <div className="border-t border-sage-50 px-4 py-3 space-y-3">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2.5 bg-sage-50 rounded-xl p-2">
                        <img
                          src={item.product?.images?.[0] || 'https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}
                          onError={e=>{(e.target as any).src='https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}}
                          className="w-10 h-10 rounded-lg object-cover bg-sage-100 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {item.product?.name || (item.snapshot as any)?.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {item.quantity} عدد × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-gray-700 flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-sage-50 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>جمع کل</span><span className="font-semibold text-gray-700">{formatPrice(order.totalPrice)}</span>
                    </div>
                    {order.discountAmount>0 && (
                      <div className="flex justify-between text-green-600">
                        <span>تخفیف</span><span className="font-semibold">−{formatPrice(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>ارسال</span>
                      <span className="font-semibold text-gray-700">
                        {order.shippingCost>0 ? formatPrice(order.shippingCost) : 'رایگان'}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800 border-t border-sage-200 pt-1.5">
                      <span>مبلغ نهایی</span>
                      <span className="text-primary-600">{formatPrice(order.finalPrice)}</span>
                    </div>
                  </div>

                  {/* Status change */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">تغییر وضعیت:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.filter(s => s!==order.status).map(s => (
                        <button key={s} onClick={() => updateStatus(order.id, s)}
                          disabled={updatingId===order.id}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors disabled:opacity-50 ${orderStatusColor[s]}`}>
                          {updatingId===order.id
                            ? <i className="fa-solid fa-circle-notch fa-spin"/>
                            : orderStatusLabel[s]
                          }
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                      <i className="fa-solid fa-location-dot ml-1.5"/>
                      {order.address.province}، {order.address.city}، {order.address.street}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* Pagination */}
      {meta && meta.totalPages>1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-right text-sm"/>
          </button>
          <span className="text-sm text-gray-600 font-medium">{page} / {meta.totalPages}</span>
          <button disabled={page===meta.totalPages} onClick={() => setPage(p=>p+1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-left text-sm"/>
          </button>
        </div>
      )}
    </div>
  )
}
